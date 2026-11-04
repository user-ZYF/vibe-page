import { describe, expect, it } from 'vitest';
import { cloneDeep } from 'lodash';
import type { CanvasInnerElement, CanvasStorageData } from '@/views/Canvas/types';
import { CanvasElementTypeEnum } from '@/constants/home';
import { deriveOps, applyOps, filterLocalOps } from '@/utils/collab-ops';
import { CollabOpTypeEnum as OpType } from '@/constants/collab';
import type { CollabOp } from '@/api/model/collab';

/** 构造测试元素 */
function el(id: string, props: Record<string, unknown> = {}) {
  return { id, type: 1, classes: [], children: [], alias: id, ...props } as unknown as CanvasInnerElement;
}

/** 构造测试画布数据 */
function makeCanvasData(children: CanvasInnerElement[]): CanvasStorageData {
  return {
    root: { id: 'root', type: CanvasElementTypeEnum.ROOT, classes: [], children },
    styleRules: [],
  };
}

function ids(data: CanvasStorageData): string[] {
  return data.root.children.map((c) => c.id);
}

describe('deriveOps', () => {
  it('无差异时返回 null', () => {
    const base = makeCanvasData([el('a')]);
    expect(deriveOps(base, cloneDeep(base))).toBeNull();
  });

  it('新增元素产生 add 操作', () => {
    const base = makeCanvasData([el('a')]);
    const next = makeCanvasData([el('a'), el('b', { text: 'hi' })]);
    const ops = deriveOps(base, next)!;
    expect(ops).toHaveLength(1);
    expect(ops[0].type).toBe(OpType.ADD);
    expect((ops[0] as { beforeId: string | null }).beforeId).toBeNull();
  });

  it('属性变化产生 update 操作', () => {
    const base = makeCanvasData([el('a', { text: 'x' })]);
    const next = makeCanvasData([el('a', { text: 'y' })]);
    const ops = deriveOps(base, next)!;
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({ type: OpType.UPDATE, id: 'a', props: { text: 'y' } });
  });

  it('删除元素产生 remove 操作（嵌套只发最外层）', () => {
    const base = makeCanvasData([el('p', { children: [el('c')] })]);
    const next = makeCanvasData([]);
    const ops = deriveOps(base, next)!;
    expect(ops.filter((o) => o.type === OpType.REMOVE)).toHaveLength(1);
  });

  it('位置变化产生 move 操作', () => {
    const base = makeCanvasData([el('a'), el('b'), el('c')]);
    const next = makeCanvasData([el('a'), el('c'), el('b')]);
    const ops = deriveOps(base, next)!;
    expect(ops.some((o) => o.type === OpType.MOVE && (o as { id: string }).id === 'b')).toBe(true);
  });
});

describe('applyOps', () => {
  it('往返可逆：derive + apply 还原目标数据', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b')]);
    const target = makeCanvasData([el('b'), el('a', { text: 'y' }), el('n')]);
    const result = applyOps(base, deriveOps(base, target)!);
    expect(result).toEqual(target);
  });

  it('目标不存在的操作自动跳过', () => {
    const base = makeCanvasData([el('a')]);
    const ops: CollabOp[] = [
      { type: OpType.REMOVE, id: 'ghost' },
      { type: OpType.UPDATE, id: 'ghost', props: { text: 'x' } },
      { type: OpType.MOVE, id: 'ghost', parentId: '', beforeId: null },
    ];
    expect(applyOps(base, ops)).toEqual(base);
  });

  it('不修改入参', () => {
    const base = makeCanvasData([el('a')]);
    applyOps(base, [{ type: OpType.REMOVE, id: 'a' }]);
    expect(base.root.children).toHaveLength(1);
  });
});

describe('filterLocalOps', () => {
  it('互不干扰的操作全部保留', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'y' })]);
    const localOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'local' } }];
    const remoteOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'b', props: { text: 'remote' } }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base);
    expect(ops).toEqual(localOps);
    expect(dropped).toBe(false);
  });

  it('远程删除的元素：本地相关操作全部丢弃', () => {
    const base = makeCanvasData([el('p', { children: [el('c')] })]);
    const localOps: CollabOp[] = [
      { type: OpType.UPDATE, id: 'c', props: { text: 'x' } },
      { type: OpType.REMOVE, id: 'p' },
    ];
    const remoteOps: CollabOp[] = [{ type: OpType.REMOVE, id: 'p' }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base);
    expect(ops).toHaveLength(0);
    expect(dropped).toBe(true);
  });

  it('同元素同字段冲突：本地该字段被剔除，其余保留', () => {
    const base = makeCanvasData([el('a', { text: 'x', alias: 'a' })]);
    const localOps: CollabOp[] = [
      { type: OpType.UPDATE, id: 'a', props: { text: 'local', alias: 'mine' } },
    ];
    const remoteOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'remote' } }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base);
    expect(ops).toHaveLength(1);
    expect((ops[0] as { props: Record<string, unknown> }).props).toEqual({ alias: 'mine' });
    expect(dropped).toBe(true);
  });

  it('同元素移动冲突：本地 move 丢弃', () => {
    const base = makeCanvasData([el('a'), el('b')]);
    const localOps: CollabOp[] = [{ type: OpType.MOVE, id: 'a', parentId: '', beforeId: null }];
    const remoteOps: CollabOp[] = [{ type: OpType.MOVE, id: 'a', parentId: '', beforeId: 'b' }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base);
    expect(ops).toHaveLength(0);
    expect(dropped).toBe(true);
  });

  it('多条 AT_RULE 规则互不干扰（按 atRuleCssText 区分）', () => {
    const base = makeCanvasData([]);
    base.styleRules = [
      { type: 3, selector: '', style: {}, atRuleCssText: '@media a { x: 1 }' },
      { type: 3, selector: '', style: {}, atRuleCssText: '@media b { y: 2 }' },
    ] as CanvasStorageData['styleRules'];
    const next = cloneDeep(base);
    next.styleRules!.splice(0, 1);
    const ops = deriveOps(base, next)!;
    const result = applyOps(base, ops);
    // 只应删除 @media a，@media b 保留
    expect(result.styleRules).toHaveLength(1);
    expect(result.styleRules![0].atRuleCssText).toBe('@media b { y: 2 }');
  });

  it('端到端：远程删除 + 本地修改同元素，合并后结果正确', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b')]);
    const localOps = deriveOps(base, makeCanvasData([el('a', { text: 'local' }), el('b')]))!;
    const remoteOps: CollabOp[] = [{ type: OpType.REMOVE, id: 'a' }];
    const { ops } = filterLocalOps(localOps, remoteOps, base);
    const remoteBase = applyOps(base, remoteOps);
    const newLocal = ops.length ? applyOps(remoteBase, ops) : remoteBase;
    expect(ids(newLocal)).toEqual(['b']);
  });
});
