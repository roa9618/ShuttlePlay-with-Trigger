import { useEffect } from 'react';
import { connectSessionEntrySocket } from './sessionEntrySocket';
import { isDemoSession } from './sessionOperationApi';

export function useSessionOperationRealtime(sessionId: string, groupId: number | undefined, numericSessionId: number | undefined, onChange: () => void | Promise<void>) {
  useEffect(() => {
    if (!groupId || !numericSessionId || isDemoSession(sessionId)) return;
    return connectSessionEntrySocket(groupId, numericSessionId, onChange);
  }, [groupId, numericSessionId, onChange, sessionId]);
}
