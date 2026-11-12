const DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Eastern Arabic numerals with the Arabic decimal (٫) and thousands (٬) separators. */
export const ar = (n: number, decimals = 0) => {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  const s = frac ? `${grouped}٫${frac}` : grouped;
  return s.replace(/\d/g, (d) => DIGITS[Number(d)]);
};

/** A year in Eastern Arabic numerals, no grouping: negative years get «ق.م», years below 1000 get «م». */
export const arYear = (y: number) => {
  const n = Math.round(y);
  const digits = (v: number) => String(Math.abs(v)).replace(/\d/g, (d) => DIGITS[Number(d)]);
  if (n < 0) return `${digits(n)} ق.م`;
  if (n < 1000) return `${digits(n)}م`;
  return digits(n);
};
