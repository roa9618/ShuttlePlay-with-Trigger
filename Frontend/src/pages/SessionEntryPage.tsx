import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Keyboard, QrCode, ShieldCheck, X } from 'lucide-react';
import { SessionFlowIcon, SessionFlowNotice, SessionFlowPage } from '../components/SessionFlowLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ApiClientError } from '../utils/apiClient';
import { sessionEntryApi } from '../utils/sessionEntryApi';
import { sessionPath } from '../utils/publicId';
import { setAuthRedirectPath } from '../utils/authSession';

type QrDetector = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
type QrReaderControls = { stop: () => void };
type QrReader = { decodeFromVideoElement: (video: HTMLVideoElement, callback: (result?: { getText?: () => string; text?: string }) => void) => Promise<QrReaderControls> };

function waitForVideoElement(ref: { current: HTMLVideoElement | null }) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    let attempts = 0;
    const findVideo = () => {
      if (ref.current) {
        resolve(ref.current);
        return;
      }
      attempts += 1;
      if (attempts >= 60) {
        reject(new Error('카메라 화면을 준비하지 못했습니다.'));
        return;
      }
      window.requestAnimationFrame(findVideo);
    };
    findVideo();
  });
}

function waitForVideoMetadata(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      reject(new Error('카메라 영상을 불러오지 못했습니다.'));
    }, 5_000);
    const handleLoaded = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    video.addEventListener('loadedmetadata', handleLoaded, { once: true });
  });
}

export default function SessionEntryPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const readerControlsRef = useRef<QrReaderControls | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const closeCamera = () => {
    if (scanTimerRef.current !== null) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    readerControlsRef.current?.stop();
    readerControlsRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraOpen(false);
  };

  useEffect(() => () => closeCamera(), []);

  const handleQrValue = (raw: string) => {
    const sessionMatch = raw.match(/\/sessions\/([^/?#]+)\/join/);
    if (sessionMatch) {
      closeCamera();
      navigate(`${sessionPath(sessionMatch[1], '/join')}${new URL(raw, window.location.origin).search}`);
      return true;
    }
    const codeMatch = raw.toUpperCase().match(/[2-9A-HJ-NP-Z]{8}/);
    if (!codeMatch) return false;
    setCode(codeMatch[0]);
    setError('QR을 읽었어요. 일정 확인하기를 눌러 주세요.');
    closeCamera();
    return true;
  };

  const openCamera = async () => {
    setError('');
    setCameraReady(false);
    const DetectorClass = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => QrDetector }).BarcodeDetector;
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setError('카메라는 HTTPS 환경에서 사용할 수 있어요. 배포 주소가 HTTPS인지 확인해 주세요.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      navigate('/session-entry/result/camera-unavailable');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      const video = await waitForVideoElement(videoRef);
      if (streamRef.current !== stream) return;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.srcObject = stream;
      await waitForVideoMetadata(video);
      await video.play();
      setCameraReady(true);
      if (DetectorClass) {
        const detector = new DetectorClass({ formats: ['qr_code'] });
        scanTimerRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const values = await detector.detect(videoRef.current);
            const raw = values[0]?.rawValue;
            if (raw) handleQrValue(raw);
          } catch {
            /* 다음 프레임에서 다시 시도합니다. */
          }
        }, 350);
        return;
      }
      try {
        const moduleUrl = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/+esm';
        const zxing = await import(/* @vite-ignore */ moduleUrl) as unknown as { BrowserQRCodeReader: new () => QrReader };
        const reader = new zxing.BrowserQRCodeReader();
        readerControlsRef.current = await reader.decodeFromVideoElement(video, result => {
          const raw = result?.getText?.() ?? result?.text;
          if (raw) handleQrValue(raw);
        });
      } catch {
        setError('카메라 화면은 열렸지만 QR 인식기를 불러오지 못했어요. 아래 코드 입력을 이용해 주세요.');
      }
    } catch (cameraError) {
      closeCamera();
      if (cameraError instanceof DOMException && cameraError.name === 'NotAllowedError') {
        setError('카메라 권한이 필요해요. 브라우저 설정에서 카메라를 허용한 뒤 다시 시도해 주세요.');
        return;
      }
      setError('카메라를 열지 못했어요. 다른 앱에서 카메라를 사용 중인지 확인해 주세요.');
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!/^[2-9A-HJ-NP-Z]{8}$/.test(normalized)) {
      navigate('/session-entry/result/invalid-code-format');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const entry = await sessionEntryApi.byCode(normalized);
      navigate(`${sessionPath(entry.sessionId, '/join')}?code=${normalized}`, { state: { entry } });
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) {
        setAuthRedirectPath('/session-entry');
        navigate('/login?redirect=%2Fsession-entry');
      } else if (e instanceof ApiClientError && e.status === 404) {
        navigate('/session-entry/result/session-not-found');
      } else {
        setError('코드를 확인하는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return <>
    <SessionFlowPage>
      <div className="text-center">
        <SessionFlowIcon><QrCode className="h-9 w-9" /></SessionFlowIcon>
        <h1 className="mt-4 text-[1.65rem] font-bold tracking-[-0.02em] md:text-4xl">일정에 입장할게요</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">QR을 촬영하거나 입장 코드를 입력해 주세요</p>
      </div>
      <Button type="button" variant="outline" className="mt-4 h-14 w-full rounded-2xl border-2 text-base font-semibold hover:border-primary hover:bg-primary/10 hover:text-primary" onClick={() => void openCamera()}>
        <Camera className="mr-2 h-5 w-5 text-primary" />QR 촬영하기
      </Button>
      <form onSubmit={submit}>
        <label className="mt-3 block text-base font-bold" htmlFor="entry-code"><Keyboard className="mr-2 inline h-5 w-5 text-primary" />일정 입장 코드</label>
        <Input id="entry-code" value={code} onChange={event => setCode(event.target.value.toUpperCase().slice(0, 8))} placeholder="예: A7K3M9Q2" autoCapitalize="characters" className="mt-2 h-14 rounded-2xl text-center text-xl font-bold tracking-[0.18em]" />
        <p className="min-h-7 pt-1 text-center text-sm text-destructive" role="alert">{error}</p>
        <Button type="submit" disabled={loading} className="h-14 w-full rounded-2xl text-[17px] font-bold">{loading ? '확인하고 있어요' : '일정 확인하기'}</Button>
      </form>
      <div className="mt-3">
        <SessionFlowNotice>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>영문 대문자와 숫자 8자리예요. 0, O, 1, I는 사용하지 않아요.</p>
          </div>
        </SessionFlowNotice>
      </div>
    </SessionFlowPage>
    {cameraOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4" role="dialog" aria-modal="true" aria-label="QR 촬영">
      <div className="w-full max-w-lg rounded-[28px] bg-card p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">QR 코드를 비춰 주세요</h2>
            <p className="text-sm text-muted-foreground">인식하면 자동으로 이동해요.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-secondary" onClick={closeCamera} aria-label="카메라 닫기"><X /></Button>
        </div>
        <button type="button" className="relative block w-full overflow-hidden rounded-2xl bg-foreground" onClick={() => {
          void videoRef.current?.play().then(() => setCameraReady(true)).catch(() => undefined);
        }} aria-label="카메라 미리보기">
          <video ref={videoRef} className="aspect-[4/3] min-h-[260px] w-full object-cover" autoPlay playsInline muted onPlaying={() => setCameraReady(true)} />
          {!cameraReady && <span className="absolute inset-0 flex items-center justify-center bg-foreground text-sm font-semibold text-background">카메라 화면을 준비하고 있어요</span>}
        </button>
        <Button type="button" variant="outline" className="mt-3 h-14 w-full rounded-2xl hover:border-primary hover:bg-primary/10 hover:text-primary" onClick={closeCamera}>직접 코드 입력하기</Button>
      </div>
    </div>}
  </>;
}
