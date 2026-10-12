// SAIR ka asli phone/WhatsApp number yahan likhein (X wali values badal dein).
// phone: "+92..." format, whatsapp: sirf digits, "92" se shuru, bina + ke.
export const SAIR = {
  name: 'SAIR Construction & Real Estate',
  phone: '+923342204328',
  whatsapp: '923342204328',
  address: 'Hyderabad, Sindh, Pakistan'
};

export const hasPhone = !/X/.test(SAIR.phone);

// true karein agar Supabase Pro plan hai (Image Transformations on). Lists mein chhoti images load hongi = tez app.
export const IMAGE_TRANSFORMS = false;