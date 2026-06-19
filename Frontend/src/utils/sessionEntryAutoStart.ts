import { sessionEntryApi, type SessionEntryParticipantStatus, type SessionParticipantAlert } from './sessionEntryApi';

const AUTO_START_DELAY_MS = 2 * 60 * 1000;

type AutoStartTarget = Pick<SessionEntryParticipantStatus, 'sessionId' | 'playStatus' | 'nextMatch' | 'currentMatch'> & {
  alertType?: SessionParticipantAlert['alertType'];
};

export function scheduleSessionAutoStart(
  target: AutoStartTarget,
  onStart: () => void,
  onError?: () => void,
) {
  if (target.currentMatch || target.playStatus === 'PLAYING') {
    window.setTimeout(onStart, 0);
    return () => undefined;
  }

  const active = target.alertType === 'NEXT_UP'
    || target.alertType === 'CALLING'
    || target.playStatus === 'NEXT_UP'
    || target.playStatus === 'CALLING';
  if (!active) return () => undefined;

  const key = autoStartKey(target);
  const firstSeenAt = Number(window.sessionStorage.getItem(key)) || Date.now();
  window.sessionStorage.setItem(key, String(firstSeenAt));
  const delay = Math.max(0, AUTO_START_DELAY_MS - (Date.now() - firstSeenAt));
  const timeoutId = window.setTimeout(async () => {
    try {
      await sessionEntryApi.startCurrentMatch(target.sessionId, target.nextMatch?.matchId ?? null);
      window.sessionStorage.removeItem(key);
      onStart();
    } catch {
      onError?.();
    }
  }, delay);

  return () => window.clearTimeout(timeoutId);
}

function autoStartKey(target: AutoStartTarget) {
  const match = target.nextMatch;
  return `session-auto-start:${target.sessionId}:${match?.matchQueueId ?? match?.matchId ?? 'current'}`;
}
