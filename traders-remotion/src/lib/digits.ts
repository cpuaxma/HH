export const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** Eastern Arabic numerals. */
export const ar = (n: number | string) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
