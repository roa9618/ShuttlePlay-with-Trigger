import QRCode from 'qrcode';
import { encodePublicId } from './publicId';

const QR_SIZE = 512;

export function createSessionEntryUrl(sessionId: number, entryCode: string, origin = window.location.origin) {
  return `${origin.replace(/\/$/, '')}/sessions/${encodePublicId(sessionId)}/join?code=${encodeURIComponent(entryCode.trim().toUpperCase())}`;
}

export function createSessionEntryQrFileName(entryCode?: string) {
  const suffix = entryCode?.trim().toUpperCase() || 'entry';
  return `shuttleplay-${suffix}.png`;
}

export function generateSessionEntryQrDataUrl(value: string) {
  if (!value.trim()) throw new Error('QR 코드에 담을 값이 필요합니다.');

  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: QR_SIZE,
    color: {
      dark: '#2D2433',
      light: '#FFFFFF',
    },
  });
}

export function downloadQrDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
