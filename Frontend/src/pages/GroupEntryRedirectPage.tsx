import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManageableGroups } from '../utils/groupApi';

export default function GroupEntryRedirectPage({ createSession = false }: { createSession?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    void getManageableGroups({
      scheduleOnly: createSession,
      page: 0,
      size: 2,
    }).then(response => {
      if (ignore) return;

      if (response.totalElements === 0) {
        navigate('/groups/new', { replace: true });
        return;
      }

      if (response.totalElements === 1 && response.items[0]) {
        navigate(
          createSession
            ? `/groups/${response.items[0].id}/schedule?createSession=true`
            : `/groups/${response.items[0].id}`,
          { replace: true },
        );
        return;
      }

      navigate(createSession ? '/groups?action=createSession' : '/groups', { replace: true });
    }).catch(() => {
      if (!ignore) navigate('/groups', { replace: true });
    });

    return () => {
      ignore = true;
    };
  }, [createSession, navigate]);

  return null;
}
