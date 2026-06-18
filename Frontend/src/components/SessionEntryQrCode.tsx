import { useEffect, useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import {
  createSessionEntryQrFileName,
  downloadQrDataUrl,
  generateSessionEntryQrDataUrl,
} from '../utils/sessionEntryQr';

type SessionEntryQrCodeProps = {
  value: string;
  entryCode?: string;
  title?: string;
  description?: string;
  className?: string;
};

export default function SessionEntryQrCode({
  value,
  entryCode,
  title = '일정 입장 QR',
  description = '카메라로 QR을 촬영하면 일정 입장 화면으로 이동해요.',
  className = '',
}: SessionEntryQrCodeProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setDataUrl(''); setError('');
    void generateSessionEntryQrDataUrl(value)
      .then(result => { if (active) setDataUrl(result); })
      .catch(() => { if (active) setError('QR 이미지를 만들지 못했어요.'); });
    return () => { active = false; };
  }, [value]);

  return <section className={`rounded-3xl border-2 border-border bg-card p-5 text-center shadow-sm ${className}`} aria-label={title}>
    <div className="mb-4"><div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"><QrCode className="h-6 w-6 text-primary" /></div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
    <div className="mx-auto flex aspect-square w-full max-w-72 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white p-3">
      {dataUrl ? <img src={dataUrl} alt={`${title} 이미지`} className="h-full w-full" /> : <p className="text-sm text-muted-foreground">{error || 'QR 이미지를 만들고 있어요…'}</p>}
    </div>
    {entryCode && <div className="mt-4 rounded-2xl bg-secondary/50 px-4 py-3"><p className="text-xs text-muted-foreground">일정 입장 코드</p><strong className="mt-1 block text-xl tracking-[0.18em] text-foreground">{entryCode}</strong></div>}
    <Button type="button" variant="outline" disabled={!dataUrl} className="mt-4 h-12 w-full rounded-2xl hover:border-primary hover:bg-primary/10 hover:text-primary" onClick={() => downloadQrDataUrl(dataUrl, createSessionEntryQrFileName(entryCode))}><Download className="mr-2 h-5 w-5" />QR 이미지 다운로드</Button>
  </section>;
}
