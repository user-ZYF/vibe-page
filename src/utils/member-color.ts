/**
 * 协作成员标识色：按用户 ID 从固定色板中取色，保证同一成员颜色稳定
 * @param userId 用户 ID
 * @returns 十六进制颜色值
 */
export function memberColor(userId: number): string {
  return MEMBER_COLORS[Math.abs(userId) % MEMBER_COLORS.length];
}

/** 成员色板（与白字对比度足够的主题色） */
const MEMBER_COLORS = [
  '#1677ff',
  '#722ed1',
  '#eb2f96',
  '#f5222d',
  '#fa8c16',
  '#a0d911',
  '#13c2c2',
  '#2f54eb',
  '#fa541c',
  '#52c41a',
] as const;
