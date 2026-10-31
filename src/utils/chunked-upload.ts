import { checkFileApi, uploadChunkApi } from '@/api/file';
import type { ChunkDescriptor, FileCheckBody, FileChunkParams, FileChunkResult } from '@/api/model/file';
import { delay } from '@/utils/delay';

/** 分片大小（分片小则请求数多，分片大则单片失败重传代价高） */
const CHUNK_SIZE = 4 * 1024 * 1024;

/** 并发上传数（浏览器同源连接数量制约） */
const CONCURRENCY = 3;

/** 单个分片失败后的最大重试次数（太少不够用，太多会增加服务端压力） */
const MAX_RETRIES = 3;

/** 重试间隔基数（毫秒），实际间隔按次数递增 */
const RETRY_DELAY = 500;

/** 可取消的上传文件（uid 用于关联上传任务） */
export interface UploadFile extends File {
  /** 任务唯一标识，配合 cancelTask 取消上传 */
  uid?: string;
}

/** 文件 hash 计算结果 */
interface HashResult {
  /** 整文件 MD5 */
  fileHash: string;
  /** 各分片 MD5 */
  chunks: ChunkDescriptor[];
  /** 分片总数 */
  totalChunks: number;
}

/** hash worker 回传结果 */
interface HashDoneMessage {
  /** 消息类型 */
  type: 'done' | 'error';
  /** 整文件 MD5 */
  fileHash?: string;
  /** 各分片 MD5 */
  chunks?: ChunkDescriptor[];
  /** 分片总数 */
  totalChunks?: number;
  /** 错误信息 */
  message?: string;
}

/** 上传任务（hash 阶段的 worker + 上传阶段的 AbortController + promise 拒绝函数） */
interface UploadTask {
  /** hash 计算中的 worker（hash 完成后为 undefined） */
  worker?: Worker;
  /** 上传阶段请求的取消控制器 */
  controller: AbortController;
  /** 终止 promise 的函数（取消时以 AbortError 拒绝） */
  reject: (reason: Error) => void;
}

/** 上传任务 map（key 为 file.uid） */
const uploadTasks = new Map<string, UploadTask>();

/** 取消指定上传任务 */
export function cancelTask(uid: string) {
  const task = uploadTasks.get(uid);
  if (!task) return;
  task.worker?.terminate();
  task.controller.abort();
  uploadTasks.delete(uid);
  const error = new Error('上传已取消');
  error.name = 'AbortError';
  task.reject(error);
}

/** 取消所有上传任务 */
export function cancelAllTasks() {
  for (const uid of uploadTasks.keys()) {
    cancelTask(uid);
  }
}

/** 计算文件与各分片 MD5 */
function hashFile(
  worker: Worker,
  file: File,
): Promise<HashResult> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<HashDoneMessage>) => {
      const msg = e.data;
      if (msg.type === 'done') {
        resolve({ fileHash: msg.fileHash!, chunks: msg.chunks!, totalChunks: msg.totalChunks! });
      } else {
        reject(new Error(msg.message));
      }
    };
    worker.onerror = (e) => reject(new Error(e.message));
    worker.postMessage({ file, chunkSize: CHUNK_SIZE });
  });
}

/** 上传单个分片 */
async function uploadChunk(
  params: FileChunkParams,
  body: Blob,
  signal: AbortSignal,
): Promise<FileChunkResult> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await uploadChunkApi(params, body, signal);
    } catch (err) {
      lastError = err;
      if (signal.aborted) throw err;
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * (attempt + 1));
      }
    }
  }
  throw lastError;
}

/**
 * 分片断点续传：hash 在 Web Worker 中计算避免阻塞主线程，分片经并发连接池并行传输
 * 服务端以 fileHash 跟踪已收分片，中断后重新调用即可只补缺失分片
 * @param file 待上传文件（如需取消，调用方需设置 uid 并配合 cancelTask）
 * @param onProgress 进度回调（0-100）
 * @returns 文件访问 URL
 */
export function uploadFile(file: UploadFile, onProgress?: (percent: number) => void): Promise<string> {
  const controller = new AbortController();
  const hashWorker = new Worker(new URL('./upload-worker.ts', import.meta.url), { type: 'module' });
  const uid = file.uid;

  return new Promise<string>((resolve, reject) => {
    const task: UploadTask = { worker: hashWorker, controller, reject };
    if (uid) uploadTasks.set(uid, task);
    const cleanup = () => {
      task.worker?.terminate();
      if (uid) uploadTasks.delete(uid);
    };

    hashFile(hashWorker, file)
      .then(async ({ fileHash, chunks, totalChunks }) => {
        // hash 阶段结束，销毁 worker，任务进入上传阶段
        task.worker?.terminate();
        task.worker = undefined;

        const checkBody: FileCheckBody = {
          fileHash,
          fileName: file.name,
          size: file.size,
          chunks,
        };
        const check = await checkFileApi(checkBody);
        if (check.url) return check.url;

        const queue = [...(check.needed ?? [])];
        const total = queue.length;
        let finished = 0;
        let finalUrl = '';

        // 有限并发上传：多个并发任务从队列取分片，全部发完后返回合并结果
        await Promise.all(
          Array.from({ length: Math.min(CONCURRENCY, total) }, async () => {
            let index = queue.shift();
            while (index !== undefined) {
              const result = await uploadChunk(
                {
                  fileHash,
                  fileName: file.name,
                  chunkIndex: index,
                  chunkHash: chunks[index].hash,
                  totalChunks,
                },
                file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
                controller.signal,
              );
              finished++;
              onProgress?.(Math.round((finished / total) * 100));
              if (result.url) finalUrl = result.url;
              index = queue.shift();
            }
          }),
        );
        if (finalUrl) return finalUrl;
        throw new Error('文件合并失败，请重试');
      })
      .then(resolve)
      .catch(reject)
      .finally(cleanup);
  });
}
