import dayjs from 'dayjs'

export const getPages = (total, current) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, 3, total, current]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
};

export const formatRange = (from, to) => {
  const a = dayjs(from)
  const b = dayjs(to)
  return a.month() === b.month()
    ? `${a.format('MMM D')} – ${b.format('D')}`
    : `${a.format('MMM D')} – ${b.format('MMM D')}`
}