const EASTERN = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** 1957 -> "١٩٥٧". Works on numbers and on strings that contain Western digits. */
export const toArabicDigits = (value: number | string): string =>
  String(value).replace(/[0-9]/g, (d) => EASTERN[Number(d)]);
