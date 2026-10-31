import SparkMD5 from 'spark-md5';

/** 分片信息 */
interface ChunkDescriptor {
  /** 分片序号 */
  index: number;
  /** 分片内容 MD5 */
  hash: string;
}

/** worker 入参 */
interface HashTask {
  /** 待计算文件 */
  file: File;
  /** 分片大小（字节） */
  chunkSize: number;
}

/** 回传主线程的消息 */
type WorkerMessage =
  | {
      type: 'done';
      /** 整文件 MD5 */
      fileHash: string;
      /** 各分片 MD5 */
      chunks: ChunkDescriptor[];
      /** 分片总数 */
      totalChunks: number;
    }
  | { type: 'error'; message: string };

self.onmessage = async (e: MessageEvent<HashTask>) => {
  try {
    const { file, chunkSize } = e.data;
    const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
    const fileSpark = new SparkMD5.ArrayBuffer();
    const chunks: ChunkDescriptor[] = [];
    // 逐片读取：增量累计文件 MD5，内存占用与文件大小解耦，同时记录各分片 MD5
    for (let i = 0; i < totalChunks; i++) {
      const buffer = await file.slice(i * chunkSize, (i + 1) * chunkSize).arrayBuffer();
      fileSpark.append(buffer);
      chunks.push({ index: i, hash: SparkMD5.ArrayBuffer.hash(buffer) });
    }
    postMessage({ type: 'done', fileHash: fileSpark.end(), chunks, totalChunks } satisfies WorkerMessage);
  } catch (err) {
    postMessage({ type: 'error', message: err instanceof Error ? err.message : 'hash 计算失败' } satisfies WorkerMessage);
  }
};
