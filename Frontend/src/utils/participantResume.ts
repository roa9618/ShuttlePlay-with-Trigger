const PARTICIPANT_RESUME_KEY = 'shuttleplay-participant-resume';
const PARTICIPANT_RESUME_MAX_AGE = 6 * 60 * 60 * 1000;
const participantLivePath = /^\/sessions\/((?!demo)[^/]+)\/(status|next-match|match-call|current-match|match-result)$/;

type ParticipantResume = {
  path: string;
  savedAt: number;
};

export function isParticipantLivePath(path: string) {
  return participantLivePath.test(path);
}

export function saveParticipantResume(path: string) {
  if (!isParticipantLivePath(path.split('?')[0])) return;

  const resume: ParticipantResume = {
    path,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(PARTICIPANT_RESUME_KEY, JSON.stringify(resume));
}

export function getParticipantResumePath() {
  try {
    const resume = JSON.parse(window.localStorage.getItem(PARTICIPANT_RESUME_KEY) ?? '') as ParticipantResume;

    if (!isParticipantLivePath(resume.path.split('?')[0]) || Date.now() - resume.savedAt > PARTICIPANT_RESUME_MAX_AGE) {
      window.localStorage.removeItem(PARTICIPANT_RESUME_KEY);
      return null;
    }

    return resume.path;
  } catch {
    window.localStorage.removeItem(PARTICIPANT_RESUME_KEY);
    return null;
  }
}
