/**
 * Contact details. Every value in [brackets] is a placeholder for the client to replace.
 * WhatsApp: international format without + or spaces, e.g. 9613123456.
 */
export const SITE = {
  whatsappNumber: "[961XXXXXXXX]",
  instagramHandle: "[instagram_handle]",
  email: "[hello@yourdomain.com]",
  // Form endpoint (Formspree, Basin, Getform or your own). Set NEXT_PUBLIC_FORM_ENDPOINT in Vercel.
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
};

export const whatsappHref = `https://wa.me/${SITE.whatsappNumber}`;
export const instagramHref = `https://instagram.com/${SITE.instagramHandle}`;
