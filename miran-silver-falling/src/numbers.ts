const DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Eastern Arabic numerals with the Arabic decimal (٫) and thousands (٬) separators. */
export const ar = (n: number, decimals = 0) => {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  const s = frac ? `${grouped}٫${frac}` : grouped;
  return s.replace(/\d/g, (d) => DIGITS[Number(d)]);
};
