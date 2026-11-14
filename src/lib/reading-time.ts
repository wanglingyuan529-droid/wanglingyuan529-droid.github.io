/**
 * 汉字友好的阅读时长估算。
 * 中文按 350 字/分钟，英文按 200 词/分钟；代码块不计字数的一半。
 */
export function readingTimeMinutes(raw: string): number {
  const text = raw.replace(/```[\s\S]*?```/g, '');
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latinWords = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + latinWords / 200));
}

/** 字数（中文按字，英文按词），用于"约 N 字" */
export function wordCount(raw: string): number {
  const text = raw.replace(/```[\s\S]*?```/g, '');
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latinWords = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return cjk + latinWords;
}
