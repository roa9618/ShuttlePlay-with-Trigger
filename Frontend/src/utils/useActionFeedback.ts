import { useCallback, useState } from 'react';

export function useActionFeedback() {
  const [message, setMessage] = useState('');

  const showMessage = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 2400);
  }, []);

  return { message, showMessage };
}
