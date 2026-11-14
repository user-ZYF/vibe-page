import { describe, expect, it } from 'vitest';
import { cloneDeep } from 'lodash';
import type { CanvasInnerElement, CanvasStorageData } from '@/views/Canvas/types';
import { CanvasElementTypeEnum } from '@/constants/home';
import { deriveOps, applyOps, filterLocalOps, rebaseLocalOps, excludeSentOps } from '@/utils/collab-ops';
import { CollabOpTypeEnum as OpType } from '@/constants/collab';
import { StyleRuleTypeEnum } from '@/constants/style';
import type { CollabAddOp, CollabOp } from '@/api/model/collab';

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

  it('根元素 id 变更按 删除+新增 语义产生 add/remove 操作', () => {
    const base = makeCanvasData([el('a')]);
    const next = makeCanvasData([el('a')]);
    next.root.id = 'root-new';
    const ops = deriveOps(base, next)!;
    expect(ops).toEqual([
      { type: OpType.ADD, parentId: '', beforeId: null, element: next.root },
      { type: OpType.REMOVE, id: 'root' },
    ]);
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
      { type: OpType.MOVE, id: 'ghost', parentId: 'root', beforeId: null },
    ];
    expect(applyOps(base, ops)).toEqual(base);
  });

  it('不修改入参', () => {
    const base = makeCanvasData([el('a')]);
    applyOps(base, [{ type: OpType.REMOVE, id: 'a' }]);
    expect(base.root.children).toHaveLength(1);
  });

  it('parentId 为空的 add 操作替换根元素', () => {
    const base = makeCanvasData([el('a')]);
    const next = makeCanvasData([el('a')]);
    next.root.id = 'root-new';
    const result = applyOps(base, deriveOps(base, next)!);
    expect(result).toEqual(next);
  });

  it('update 操作不可修改结构字段（含元素 id）', () => {
    const base = makeCanvasData([el('a', { text: 'x' })]);
    const result = applyOps(base, [
      { type: OpType.UPDATE, id: 'a', props: { id: 'b', type: 2, text: 'y' } },
    ]);
    expect(result.root.children[0]).toMatchObject({ id: 'a', type: 1, text: 'y' });
  });
});

describe('filterLocalOps', () => {
  it('互不干扰的操作全部保留', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'y' })]);
    const localOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'local' } }];
    const remoteOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'b', props: { text: 'remote' } }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
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
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(0);
    expect(dropped).toBe(true);
  });

  it('同元素同字段冲突：本地该字段被剔除，其余保留', () => {
    const base = makeCanvasData([el('a', { text: 'x', alias: 'a' })]);
    const localOps: CollabOp[] = [
      { type: OpType.UPDATE, id: 'a', props: { text: 'local', alias: 'mine' } },
    ];
    const remoteOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'remote' } }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(1);
    expect((ops[0] as { props: Record<string, unknown> }).props).toEqual({ alias: 'mine' });
    expect(dropped).toBe(true);
  });

  it('同元素移动冲突：本地 move 丢弃', () => {
    const base = makeCanvasData([el('a'), el('b')]);
    const localOps: CollabOp[] = [{ type: OpType.MOVE, id: 'a', parentId: 'root', beforeId: null }];
    const remoteOps: CollabOp[] = [{ type: OpType.MOVE, id: 'a', parentId: 'root', beforeId: 'b' }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(0);
    expect(dropped).toBe(true);
  });

  it('远程将目标父级移入被移元素的深层子树：本地 move 丢弃（防循环引用）', () => {
    const base = makeCanvasData([el('x', { children: [el('a', { children: [el('c')] })] }), el('p'), el('b')]);
    const localOps: CollabOp[] = [{ type: OpType.MOVE, id: 'x', parentId: 'p', beforeId: null }];
    const remoteOps: CollabOp[] = [{ type: OpType.MOVE, id: 'p', parentId: 'c', beforeId: null }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(0);
    expect(dropped).toBe(true);
  });

  it('远程将目标父级移入新增元素包裹的已有元素下：本地 add 丢弃（防循环嵌套）', () => {
    const base = makeCanvasData([el('e'), el('p')]);
    const localOps: CollabOp[] = [
      {
        type: OpType.ADD,
        parentId: 'p',
        beforeId: null,
        element: el('w', { children: [el('e')] }) as unknown as CollabAddOp['element'],
      },
    ];
    const remoteOps: CollabOp[] = [{ type: OpType.MOVE, id: 'p', parentId: 'e', beforeId: null }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(0);
    expect(dropped).toBe(true);
  });

  it('前序 op 已置 dropped 时，id 不冲突的本地 add 仍保留', () => {
    const base = makeCanvasData([el('a'), el('b')]);
    const localOps: CollabOp[] = [
      { type: OpType.UPDATE, id: 'a', props: { text: 'local' } },
      {
        type: OpType.ADD,
        parentId: 'b',
        beforeId: null,
        element: el('n') as unknown as CollabAddOp['element'],
      },
    ];
    const remoteOps: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'remote' } }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toEqual([localOps[1]]);
    expect(dropped).toBe(true);
  });

  it('远程移动目标父级到无关位置：本地 move 保留', () => {
    const base = makeCanvasData([el('x', { children: [el('a')] }), el('p'), el('b')]);
    const localOps: CollabOp[] = [{ type: OpType.MOVE, id: 'x', parentId: 'p', beforeId: null }];
    const remoteOps: CollabOp[] = [{ type: OpType.MOVE, id: 'p', parentId: 'b', beforeId: null }];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toEqual(localOps);
    expect(dropped).toBe(false);
  });

  it('样式修改产生带属性补丁的 style-set 操作', () => {
    const rule = (style: Record<string, string>) => [
      { type: 0, selector: '.a', style },
    ] as CanvasStorageData['styleRules'];
    const base = makeCanvasData([]);
    base.styleRules = rule({ color: 'red', margin: '0' });
    const next = makeCanvasData([]);
    next.styleRules = rule({ color: 'blue', padding: '4px' });
    const ops = deriveOps(base, next)!;
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({
      type: OpType.STYLE_SET,
      selector: '.a',
      style: { color: 'blue', margin: null, padding: '4px' },
    });
  });

  it('style-set 补丁按属性合并，不覆盖未修改属性', () => {
    const base = makeCanvasData([]);
    base.styleRules = [
      { type: 0, selector: '.a', style: { color: 'red', margin: '0' } },
    ] as CanvasStorageData['styleRules'];
    const next = cloneDeep(base);
    next.styleRules![0].style.color = 'blue';
    const result = applyOps(base, deriveOps(base, next)!);
    expect(result.styleRules![0].style).toEqual({ color: 'blue', margin: '0' });
  });

  it('同一样式规则不同属性无冲突：本地补丁保留', () => {
    const base = makeCanvasData([]);
    base.styleRules = [
      { type: 0, selector: '.a', style: { color: 'red', margin: '0' } },
    ] as CanvasStorageData['styleRules'];
    const localOps: CollabOp[] = [
      { type: OpType.STYLE_SET, selector: '.a', ruleType: StyleRuleTypeEnum.UNDEFINED, style: { color: 'blue' } },
    ];
    const remoteOps: CollabOp[] = [
      { type: OpType.STYLE_SET, selector: '.a', ruleType: StyleRuleTypeEnum.UNDEFINED, style: { margin: '4px' } },
    ];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(1);
    expect(dropped).toBe(false);
    // 本地补丁合并到远程规则上：color 用本地值，margin 保留远程值
    const merged = applyOps(applyOps(base, remoteOps), ops);
    expect(merged.styleRules![0].style).toEqual({ color: 'blue', margin: '4px' });
  });

  it('同一样式规则同名属性冲突：本地该属性被剔除', () => {
    const base = makeCanvasData([]);
    base.styleRules = [
      { type: 0, selector: '.a', style: { color: 'red' } },
    ] as CanvasStorageData['styleRules'];
    const localOps: CollabOp[] = [
      {
        type: OpType.STYLE_SET,
        selector: '.a',
        ruleType: StyleRuleTypeEnum.UNDEFINED,
        style: { color: 'blue', margin: '2px' },
      },
    ];
    const remoteOps: CollabOp[] = [
      { type: OpType.STYLE_SET, selector: '.a', ruleType: StyleRuleTypeEnum.UNDEFINED, style: { color: 'green' } },
    ];
    const { ops, dropped } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    expect(ops).toHaveLength(1);
    expect((ops[0] as { style: Record<string, unknown> }).style).toEqual({ margin: '2px' });
    expect(dropped).toBe(true);
  });

  it('同名多条规则按级联合并比对：前序规则修改也能产生补丁', () => {
    const base = makeCanvasData([]);
    base.styleRules = [
      { type: 0, selector: '.a', style: { color: 'red' } },
      { type: 0, selector: '.a', style: { margin: '0' } },
    ] as CanvasStorageData['styleRules'];
    const next = cloneDeep(base);
    next.styleRules![0].style.color = 'blue';
    const ops = deriveOps(base, next)!;
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({ type: OpType.STYLE_SET, selector: '.a', style: { color: 'blue' } });
    const result = applyOps(base, ops);
    // 补丁写回含该属性的规则，其余同名规则不受影响
    expect(result.styleRules).toEqual(next.styleRules);
  });

  it('删除规则时整条同名规则集一并移除', () => {
    const base = makeCanvasData([]);
    base.styleRules = [
      { type: 0, selector: '.a', style: { color: 'red' } },
      { type: 0, selector: '.a', style: { margin: '0' } },
      { type: 0, selector: '.b', style: { padding: '4px' } },
    ] as CanvasStorageData['styleRules'];
    const next = makeCanvasData([]);
    next.styleRules = [base.styleRules![2]];
    const ops = deriveOps(base, next)!;
    const result = applyOps(base, ops);
    expect(result.styleRules).toEqual(next.styleRules);
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
    const { ops } = filterLocalOps(localOps, remoteOps, base, applyOps(base, remoteOps));
    const remoteBase = applyOps(base, remoteOps);
    const newLocal = ops.length ? applyOps(remoteBase, ops) : remoteBase;
    expect(ids(newLocal)).toEqual(['b']);
  });
});

describe('excludeSentOps', () => {
  it('剔除与已发送操作完全一致的项', () => {
    const ops: CollabOp[] = [
      { type: OpType.UPDATE, id: 'a', props: { text: 'x' } },
      { type: OpType.REMOVE, id: 'b' },
    ];
    const sent: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'x' } }];

    expect(excludeSentOps(ops, sent)).toEqual([{ type: OpType.REMOVE, id: 'b' }]);
  });

  it('每条已发送操作至多消费一次匹配', () => {
    const op: CollabOp = { type: OpType.UPDATE, id: 'a', props: { text: 'x' } };

    expect(excludeSentOps([op, { ...op }], [op])).toEqual([op]);
  });

  it('值不同的操作不会被误剔除', () => {
    const ops: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'remote' } }];
    const sent: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'local' } }];

    expect(excludeSentOps(ops, sent)).toEqual(ops);
  });
});

describe('rebaseLocalOps', () => {
  it('本地非冲突修改重放到远程最新画布后仍需提交', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'y' })]);
    const local = makeCanvasData([el('a', { text: 'local' }), el('b', { text: 'y' })]);
    const remote = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'remote' })]);

    const result = rebaseLocalOps(base, local, remote);

    expect(result.canvasData).toEqual(
      makeCanvasData([el('a', { text: 'local' }), el('b', { text: 'remote' })]),
    );
    expect(result.ops).toEqual([{ type: OpType.UPDATE, id: 'a', props: { text: 'local' } }]);
    expect(result.dropped).toBe(false);
  });

  it('已发送未确认的操作被服务端应用后去重收敛，不误报冲突', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'y' })]);
    const local = makeCanvasData([el('a', { text: 'local' }), el('b', { text: 'y' })]);
    const remote = makeCanvasData([el('a', { text: 'local' }), el('b', { text: 'remote' })]);
    const sent: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'local' } }];

    const result = rebaseLocalOps(base, local, remote, sent);

    expect(result.canvasData).toEqual(remote);
    expect(result.ops).toBeNull();
    expect(result.dropped).toBe(false);
  });

  it('已发送未确认的操作未被服务端应用时仍会重发', () => {
    const base = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'y' })]);
    const local = makeCanvasData([el('a', { text: 'local' }), el('b', { text: 'y' })]);
    const remote = makeCanvasData([el('a', { text: 'x' }), el('b', { text: 'remote' })]);
    const sent: CollabOp[] = [{ type: OpType.UPDATE, id: 'a', props: { text: 'local' } }];

    const result = rebaseLocalOps(base, local, remote, sent);

    expect(result.canvasData).toEqual(
      makeCanvasData([el('a', { text: 'local' }), el('b', { text: 'remote' })]),
    );
    expect(result.ops).toEqual(sent);
    expect(result.dropped).toBe(false);
  });

  it('同字段冲突时保留远程结果并标记本地修改被裁剪', () => {
    const base = makeCanvasData([el('a', { text: 'x' })]);
    const local = makeCanvasData([el('a', { text: 'local' })]);
    const remote = makeCanvasData([el('a', { text: 'remote' })]);

    const result = rebaseLocalOps(base, local, remote);

    expect(result.canvasData).toEqual(remote);
    expect(result.ops).toBeNull();
    expect(result.dropped).toBe(true);
  });

  it('离线新增元素在父级未被远程删除时保留', () => {
    const base = makeCanvasData([el('a')]);
    const local = makeCanvasData([el('a'), el('n', { text: 'new' })]);
    const remote = makeCanvasData([el('a', { text: 'remote' })]);

    const result = rebaseLocalOps(base, local, remote);

    expect(ids(result.canvasData)).toEqual(['a', 'n']);
    expect(result.canvasData.root.children[0]).toMatchObject({ text: 'remote' });
    expect(result.ops).toHaveLength(1);
    expect(result.dropped).toBe(false);
  });
});
