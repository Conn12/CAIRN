const formatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 2026-11-03 */
export function formatDate(date: Date): string {
  return formatter.format(date).replaceAll('/', '-');
}
