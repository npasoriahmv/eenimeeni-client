export function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;

  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}
