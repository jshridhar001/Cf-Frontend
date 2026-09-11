import { Font } from '@react-pdf/renderer';

let registered = false;

export const DEVANAGARI_PDF_FONT = 'NotoSansDevanagari';

export function registerDevanagariPdfFont() {
  if (registered) return;
  registered = true;

  Font.register({
    family: DEVANAGARI_PDF_FONT,
    fonts: [
      { src: '/fonts/NotoSansDevanagari-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/NotoSansDevanagari-Bold.ttf', fontWeight: 700 },
    ],
  });
}
