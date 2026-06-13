import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BellRing,
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Crown,
  Edit3,
  Eye,
  FileClock,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { styles } from './GroupDetailPage.styles';
import {
  groupDetailApi,
  type GroupDashboardResponse,
  type GroupDetailResponse,
  type GroupMemberResponse,
  type GroupParticipantResponse,
  type GroupPermissions,
  type GroupPostResponse,
  type GroupSessionResponse,
} from '../utils/groupDetailApi';
import { connectGroupDetailSocket } from '../utils/groupDetailSocket';
import { formatActivityRegion, splitActivityRegion } from '../utils/activityRegion';
import { koreanRegions, provinceOptions } from '../utils/koreanRegions';
import { ApiClientError } from '../utils/apiClient';

type TabKey = 'home' | 'schedule' | 'board' | 'members' | 'requests' | 'history' | 'settings';
type GroupRole = 'OWNER' | 'MANAGER' | 'MEMBER';
type ScheduleStatus = 'VOTING' | 'TODAY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type VoteStatus = 'JOIN' | 'UNDECIDED' | 'ABSENT';
type ModalState =
  | { type: 'schedule'; id: number }
  | { type: 'post'; id: number }
  | { type: 'member'; id: number }
  | { type: 'writePost' }
  | { type: 'participants'; id: number }
  | { type: 'addGuest'; id: number }
  | { type: 'editGuest'; id: number; guest: GroupParticipantResponse }
  | { type: 'manageSchedule'; id: number }
  | { type: 'memberPermissions'; id: number }
  | { type: 'ownershipTransfer'; id: number }
  | { type: 'memberRemoval'; id: number }
  | { type: 'groupDeletion' }
  | { type: 'confirm'; title: string; description: string; actionLabel: string; onConfirm?: () => void }
  | null;

const tabs: Array<{ key: TabKey; label: string; adminOnly?: boolean; ownerOnly?: boolean }> = [
  { key: 'home', label: '홈' },
  { key: 'schedule', label: '일정' },
  { key: 'board', label: '게시판' },
  { key: 'members', label: '멤버' },
  { key: 'requests', label: '가입 요청', adminOnly: true },
  { key: 'history', label: '운영 기록', adminOnly: true },
  { key: 'settings', label: '모임 설정', ownerOnly: true },
];

const tabPaths: Record<TabKey, string> = {
  home: '',
  schedule: 'schedule',
  board: 'board',
  members: 'members',
  requests: 'requests',
  history: 'history',
  settings: 'settings',
};

type ScheduleItem = { id: number; title: string; date: string; time: string; place: string; joined: number; undecided: number; absent: number; guests: number; deadline: string; status: ScheduleStatus; matches: number | null };
type MemberItem = { id: number; name: string; gender: string; age: string; grade: string; role: string; participation: number; recent: number; rate: number; matches: number | null; winRate: number | null; doublesMmr: number; mixedMmr: number; streak: number | null; absenceRate: number | null };
type PostItem = { id: number; authorId: number; type: string; pinned: boolean; title: string; author: string; date: string; views: number; comments: number; content: string; attachmentNames: string | null };
type JoinRequestItem = { id: number; name: string; gender: string; age: string; grade: string; requestedAt: string; message: string };
type OperationItem = { id: number; actor: string; action: string; time: string; icon: typeof Calendar };

const schedules: ScheduleItem[] = [];

const members: MemberItem[] = [];

const posts: PostItem[] = [];

const joinRequests: JoinRequestItem[] = [];

const operationHistory: OperationItem[] = [];

function toScheduleItem(session: GroupSessionResponse): typeof schedules[number] {
  const startsAt = new Date(session.startsAt);
  const endsAt = session.endsAt ? new Date(session.endsAt) : null;
  const date = session.startsAt.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const status: ScheduleStatus = session.status === 'CANCELLED'
    ? 'CANCELLED'
    : session.status === 'CLOSED' || date < today
      ? 'COMPLETED'
      : session.status === 'IN_PROGRESS'
        ? 'IN_PROGRESS'
      : date === today
        ? 'TODAY'
        : 'VOTING';
  return {
    id: session.id,
    title: session.title,
    date,
    time: `${startsAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endsAt ? endsAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}`,
    place: session.place || '',
    joined: session.attending ?? session.attendanceCount,
    undecided: session.undecided ?? 0,
    absent: session.absent ?? 0,
    guests: session.guestCount ?? 0,
    deadline: session.voteDeadline ? new Date(session.voteDeadline).toLocaleString('ko-KR') : '',
    status,
    matches: null,
  };
}

function toPostItem(post: GroupPostResponse): typeof posts[number] {
  return {
    id: post.id,
    authorId: post.authorId,
    type: post.type === 'NOTICE' ? '공지사항' : '자유 게시판',
    pinned: post.pinned,
    title: post.title,
    author: post.authorName,
    date: new Date(post.createdAt).toLocaleDateString('ko-KR'),
    views: post.viewCount,
    comments: post.commentCount,
    content: post.content,
    attachmentNames: post.attachmentNames,
  };
}

function toMemberItem(member: GroupMemberResponse): typeof members[number] {
  const role = member.role === 'OWNER' ? '소유자' : member.role === 'MANAGER' ? '매니저' : '멤버';
  const genderLabels: Record<string, string> = { MALE: '남성', FEMALE: '여성' };
  const ageLabels: Record<string, string> = {
    TEENS: '10대',
    TWENTIES: '20대',
    THIRTIES: '30대',
    FORTIES: '40대',
    FIFTIES: '50대',
    SIXTIES_AND_ABOVE: '60대 이상',
  };
  return {
    id: member.id,
    name: member.name,
    gender: genderLabels[member.gender] || member.gender || '미설정',
    age: ageLabels[member.ageGroup] || member.ageGroup || '미설정',
    grade: member.grade || '급수 미정',
    role,
    participation: member.participationCount,
    recent: member.recentFourWeekParticipationCount,
    rate: member.monthlyParticipationRate,
    matches: null,
    winRate: null,
    doublesMmr: member.doublesMmr,
    mixedMmr: member.mixedMmr,
    streak: null,
    absenceRate: null,
  };
}

function toOperationItem(item: Record<string, unknown>): typeof operationHistory[number] {
  const action = String(item.action ?? '');
  const detail = String(item.detail ?? '');
  return {
    id: Number(item.id),
    actor: String(item.actorName ?? ''),
    action: detail && detail !== action ? `${action} - ${detail}` : action,
    time: item.createdAt ? new Date(String(item.createdAt)).toLocaleString('ko-KR') : '',
    icon: FileClock,
  };
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>(null);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupDetailResponse | null>(null);
  const [dashboard, setDashboard] = useState<GroupDashboardResponse | null>(null);
  const [monthlySummary, setMonthlySummary] = useState({ upcomingCount: 0, completedCount: 0, cumulativeAttendance: 0 });
  const [scheduleItems, setScheduleItems] = useState<typeof schedules>([]);
  const [postItems, setPostItems] = useState<typeof posts>([]);
  const [memberItems, setMemberItems] = useState<typeof members>([]);
  const [operationItems, setOperationItems] = useState<typeof operationHistory>([]);
  const [notice, setNotice] = useState('');
  const [noticeDraft, setNoticeDraft] = useState(notice);
  const [noticeAuthor, setNoticeAuthor] = useState<string | null>(null);
  const [noticeUpdatedAt, setNoticeUpdatedAt] = useState<string | null>(null);
  const [editingNotice, setEditingNotice] = useState(false);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>('UNDECIDED');
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [boardFilter, setBoardFilter] = useState('ALL');
  const [boardKeyword, setBoardKeyword] = useState('');
  const [memberKeyword, setMemberKeyword] = useState('');
  const [memberRole, setMemberRole] = useState('ALL');
  const [memberGrade, setMemberGrade] = useState('ALL');
  const [requests, setRequests] = useState<typeof joinRequests>([]);
  const [boardPage, setBoardPage] = useState(1);
  const [boardTotalPages, setBoardTotalPages] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [requestTotalPages, setRequestTotalPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [refreshNotice, setRefreshNotice] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [newJoinAllowed, setNewJoinAllowed] = useState(true);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [guestAllowed, setGuestAllowed] = useState(true);
  const [sameDayVoteChangeAllowed, setSameDayVoteChangeAllowed] = useState(true);
  const [postDeadlineVoteChangeAllowed, setPostDeadlineVoteChangeAllowed] = useState(false);
  const [memberPostAllowed, setMemberPostAllowed] = useState(true);
  const [memberCommentAllowed, setMemberCommentAllowed] = useState(true);
  const [postAttachmentAllowed, setPostAttachmentAllowed] = useState(true);

  const [currentRole, setCurrentRole] = useState<GroupRole>('OWNER');
  const [managerPermissions, setManagerPermissions] = useState<GroupPermissions>({
    schedule: false, notice: false, joinRequests: false, members: false, posts: false, operationLogs: false,
  });
  const isOwner = currentRole === 'OWNER';
  const isManager = currentRole === 'MANAGER';
  const canManage = isOwner || isManager;
  const canManageSchedule = isOwner || (isManager && managerPermissions.schedule);
  const canManageNotice = isOwner || (isManager && managerPermissions.notice);
  const canManageRequests = isOwner || (isManager && managerPermissions.joinRequests);
  const canManageMembers = isOwner || (isManager && managerPermissions.members);
  const canManagePosts = isOwner || (isManager && managerPermissions.posts);
  const canViewHistory = isOwner || (isManager && managerPermissions.operationLogs);
  const canWritePost = canManagePosts || memberPostAllowed;
  const canComment = canManagePosts || memberCommentAllowed;
  const activeTab = getActiveTab(location.pathname);

  const numericGroupId = Number(groupId);
  const showToast = useCallback((message: string, withRefresh = false) => {
    setToastMessage(message);
    setRefreshNotice(withRefresh);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToastMessage('');
      toastTimer.current = null;
    }, 3000);
  }, []);
  const showRequestError = useCallback((error: unknown, fallback: string) => {
    const conflict = error instanceof ApiClientError && error.status === 409;
    showToast(conflict ? '다른 변경 사항이 반영되었습니다. 새로고침 후 다시 시도해주세요.' : fallback, conflict);
  }, [showToast]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const loadGroupDetail = useCallback(async () => {
    if (!Number.isFinite(numericGroupId)) return;
    const [group, guide, dashboardResponse, sessionResponse, monthlySummaryResponse] = await Promise.all([
      groupDetailApi.getGroup(numericGroupId),
      groupDetailApi.getOperationGuide(numericGroupId),
      groupDetailApi.getDashboard(numericGroupId),
      groupDetailApi.getSessions(numericGroupId, calendarYear, calendarMonth),
      groupDetailApi.getMonthlySummary(numericGroupId, calendarYear, calendarMonth),
    ]);
    setGroupInfo(group);
    setCurrentRole(group.myRole);
    setManagerPermissions(group.permissions);
    setNotice(guide.content);
    setNoticeDraft(guide.content);
    setNoticeAuthor(guide.authorName);
    setNoticeUpdatedAt(guide.updatedAt);
    setDashboard(dashboardResponse);
    setScheduleItems(sessionResponse.map(toScheduleItem));
    const firstVote = sessionResponse.find(session => session.myVoteStatus)?.myVoteStatus;
    if (firstVote) setVoteStatus(firstVote === 'ATTENDING' ? 'JOIN' : firstVote as VoteStatus);
    setMonthlySummary({
      upcomingCount: Number(monthlySummaryResponse.upcomingCount ?? 0),
      completedCount: Number(monthlySummaryResponse.completedCount ?? 0),
      cumulativeAttendance: Number(monthlySummaryResponse.cumulativeAttendance ?? 0),
    });
    if (group.myRole === 'OWNER') {
      const settings = await groupDetailApi.getSettings(numericGroupId);
      setNewJoinAllowed(settings.newJoinAllowed);
      setApprovalRequired(settings.approvalRequired);
      setGuestAllowed(settings.guestAllowed);
      setSameDayVoteChangeAllowed(settings.sameDayVoteChangeAllowed);
      setPostDeadlineVoteChangeAllowed(settings.postDeadlineVoteChangeAllowed);
      setMemberPostAllowed(settings.memberPostAllowed);
      setMemberCommentAllowed(settings.memberCommentAllowed);
      setPostAttachmentAllowed(settings.postAttachmentAllowed);
    }
  }, [calendarMonth, calendarYear, numericGroupId]);

  useEffect(() => {
    void loadGroupDetail().catch(() => showToast('모임 정보를 불러오지 못했습니다.'));
    return connectGroupDetailSocket(numericGroupId, () => {
      setListRefreshKey(current => current + 1);
      void loadGroupDetail().catch(() => showToast('모임 정보를 갱신하지 못했습니다.'));
    });
  }, [loadGroupDetail, numericGroupId, showToast]);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId)) return;
    const type = boardFilter === '공지사항' ? 'NOTICE' : boardFilter === '자유 게시판' ? 'FREE' : undefined;
    void groupDetailApi.getPosts(numericGroupId, { keyword: boardKeyword, type, page: boardPage - 1, size: 10 })
      .then(response => {
        setPostItems(response.items.map(toPostItem));
        setBoardTotalPages(Math.max(1, response.totalPages));
      })
      .catch(() => showToast('게시글 목록을 불러오지 못했습니다.'));
  }, [boardFilter, boardKeyword, boardPage, listRefreshKey, numericGroupId, showToast]);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId)) return;
    const role = memberRole === '소유자' ? 'OWNER' : memberRole === '매니저' ? 'MANAGER' : memberRole === '멤버' ? 'MEMBER' : undefined;
    const grade = memberGrade === 'ALL' ? undefined : memberGrade.replace('급', '');
    void groupDetailApi.getMembers(numericGroupId, { keyword: memberKeyword, role, grade, page: memberPage - 1, size: 12 })
      .then(response => {
        setMemberItems(response.items.map(toMemberItem));
        setMemberTotalPages(Math.max(1, response.totalPages));
      })
      .catch(() => showToast('멤버 목록을 불러오지 못했습니다.'));
  }, [listRefreshKey, memberGrade, memberKeyword, memberPage, memberRole, numericGroupId, showToast]);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId) || !canManageRequests) return;
    void groupDetailApi.getJoinRequests(numericGroupId, requestPage - 1, 6).then(response => {
      setRequests(response.items.map(item => ({
        id: item.id, name: item.name, gender: item.gender, age: item.ageGroup, grade: item.grade,
        requestedAt: item.requestedAt, message: item.message,
      })));
      setRequestTotalPages(Math.max(1, response.totalPages));
    }).catch(error => showRequestError(error, '가입 요청 목록을 불러오지 못했습니다.'));
  }, [canManageRequests, listRefreshKey, numericGroupId, requestPage, showRequestError]);

  useEffect(() => {
    if (!Number.isFinite(numericGroupId) || !canViewHistory) return;
    void groupDetailApi.getOperationLogs(numericGroupId, historyPage - 1, 11).then(response => {
      setOperationItems(response.items.map(toOperationItem));
      setHistoryTotalPages(Math.max(1, response.totalPages));
    }).catch(error => showRequestError(error, '운영 기록을 불러오지 못했습니다.'));
  }, [canViewHistory, historyPage, listRefreshKey, numericGroupId, showRequestError]);

  const visibleTabs = tabs.filter(tab => {
    if (tab.ownerOnly && !isOwner) return false;
    if (tab.key === 'requests' && !canManageRequests) return false;
    if (tab.key === 'history' && !canViewHistory) return false;
    if (tab.adminOnly && !canManage) return false;
    return true;
  });

  useEffect(() => {
    const hasPermission =
      (activeTab !== 'requests' || canManageRequests) &&
      (activeTab !== 'history' || canViewHistory) &&
      (activeTab !== 'settings' || isOwner);

    if (!hasPermission) {
      navigate(`/groups/${groupId}`, { replace: true });
    }
  }, [activeTab, canManageRequests, canViewHistory, groupId, isOwner, navigate]);

  const selectedSchedule = modal?.type === 'schedule'
    ? scheduleItems.find(schedule => schedule.id === modal.id)
    : undefined;
  const selectedPost = modal?.type === 'post'
    ? postItems.find(post => post.id === modal.id)
    : undefined;
  const selectedMember = modal?.type === 'member' || modal?.type === 'memberPermissions' || modal?.type === 'ownershipTransfer' || modal?.type === 'memberRemoval'
    ? memberItems.find(member => member.id === modal.id)
    : undefined;

  const filteredPosts = postItems;
  const filteredMembers = memberItems;

  const daySchedules = useMemo(
    () => scheduleItems.filter(schedule => schedule.date === `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`),
    [calendarMonth, calendarYear, scheduleItems, selectedDay],
  );

  const handleCopyGroupLink = async () => {
    await navigator.clipboard?.writeText(`${window.location.origin}/groups/${groupId}/join`);
    showToast('모임 공유 링크를 복사했습니다.');
  };

  const handleVote = (nextStatus: VoteStatus, targetSessionId?: number) => {
    const sessionId = targetSessionId ?? selectedSchedule?.id ?? dashboard?.upcomingSession?.id;
    if (sessionId) {
      void groupDetailApi.vote(numericGroupId, sessionId, nextStatus === 'JOIN' ? 'ATTENDING' : nextStatus)
        .then(() => {
          setVoteStatus(nextStatus);
          return loadGroupDetail();
        })
        .catch(() => showToast('참여 상태를 변경하지 못했습니다.'));
    }
  };

  const openScheduleModal = async (scheduleId: number) => {
    const detail = await groupDetailApi.getSession(numericGroupId, scheduleId);
    const mapped = toScheduleItem(detail);
    setScheduleItems(current => current.map(item => item.id === scheduleId ? mapped : item));
    if (detail.myVoteStatus) setVoteStatus(detail.myVoteStatus === 'ATTENDING' ? 'JOIN' : detail.myVoteStatus as VoteStatus);
    setModal({ type: 'schedule', id: scheduleId });
  };

  const handleScheduleTabSelection = (scheduleId: number) => {
    const schedule = scheduleItems.find(item => item.id === scheduleId);
    if (!schedule) return;

    const today = new Date();
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (schedule.status === 'COMPLETED' || schedule.date < todayDate) {
      navigate(`/sessions/${schedule.id}/report`);
      return;
    }
    if (schedule.status === 'TODAY') {
      navigate(canManageSchedule ? `/sessions/${schedule.id}/dashboard` : `/sessions/${schedule.id}/status`);
      return;
    }
    if (schedule.status === 'IN_PROGRESS') {
      navigate(canManageSchedule ? `/sessions/${schedule.id}/dashboard` : `/sessions/${schedule.id}/current`);
      return;
    }

    void openScheduleModal(schedule.id);
  };

  const handleRequest = (requestId: number, approve: boolean) => {
    void (approve
      ? groupDetailApi.approveRequest(numericGroupId, requestId)
      : groupDetailApi.rejectRequest(numericGroupId, requestId))
      .then(() => groupDetailApi.getJoinRequests(numericGroupId, requestPage - 1, 6))
      .then(response => {
        if (response.items.length === 0 && requestPage > 1) {
          setRequestPage(requestPage - 1);
          return;
        }
        setRequests(response.items.map(item => ({
          id: item.id, name: item.name, gender: item.gender, age: item.ageGroup, grade: item.grade,
          requestedAt: item.requestedAt, message: item.message,
        })));
        setRequestTotalPages(Math.max(1, response.totalPages));
      })
      .catch(error => showRequestError(error, '가입 요청을 처리하지 못했습니다.'));
  };

  const handleAllRequests = (approve: boolean) => {
    void (approve
      ? groupDetailApi.approveAllRequests(numericGroupId)
      : groupDetailApi.rejectAllRequests(numericGroupId))
      .then(() => {
        setRequests([]);
        setRequestPage(1);
        setRequestTotalPages(1);
      })
      .catch(error => showRequestError(error, '가입 요청을 일괄 처리하지 못했습니다.'));
  };

  const openConfirm = (title: string, description: string, actionLabel: string, _actionMessage: string, onConfirm?: () => void) => {
    setModal({ type: 'confirm', title, description, actionLabel, onConfirm });
  };

  const executeConfirm = () => {
    if (modal?.type !== 'confirm') return;
    modal.onConfirm?.();
    setModal(null);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.backgroundGlowTop} />
      <div className = {styles.backgroundGlowBottom} />

      <div className = {styles.pageShell}>
        <Link to = "/groups" className = {styles.backLink}>
          <ArrowLeft className = {styles.smallIcon} />
          내 모임으로 돌아가기
        </Link>

        <header className = {styles.groupHeader}>
          <div className = {styles.groupIdentity}>
            <img src = {groupInfo?.profileImageUrl || '/shuttleplay-maskable-icon-512.png'} alt = {groupInfo?.name || '모임 대표 이미지'} className = {styles.groupImage} />
            <div className = {styles.groupHeaderText}>
              <div className = {styles.titleRow}>
                <h1 className = {styles.title}>{groupInfo?.name || '모임'}</h1>
                <Badge className = {styles.ownerBadge}><Crown /> {currentRole === 'OWNER' ? '소유자' : currentRole === 'MANAGER' ? '매니저' : '멤버'}</Badge>
              </div>
              <p className = {styles.groupDescription}>{groupInfo?.description || ''}</p>
              <div className = {styles.groupMeta}>
                <span><MapPin /> {groupInfo ? formatActivityRegion(groupInfo.activityRegion) : ''}</span>
                <span><Users /> 멤버 {groupInfo?.memberCount ?? 0}명</span>
                <span><Crown /> 소유자 {groupInfo?.ownerName}</span>
                <span><Calendar /> {groupInfo?.createdAt ? new Date(groupInfo.createdAt).toLocaleDateString('ko-KR') : ''} 생성</span>
              </div>
            </div>
          </div>
          <div className = {styles.headerActions}>
            <Button variant = "outline" className = {styles.roundButton} onClick = {handleCopyGroupLink}>
              <Share2 /> 공유
            </Button>
            {!isOwner && (
              <Button variant = "ghost" className = {styles.leaveButton} onClick = {() => openConfirm('모임에서 탈퇴할까요?', '탈퇴 후에는 모임 상세와 게시판에 접근할 수 없습니다.', '모임 탈퇴', '모임에서 탈퇴했습니다.', () => {
                void groupDetailApi.leave(numericGroupId).then(() => navigate('/groups'));
              })}>
                모임 탈퇴
              </Button>
            )}
          </div>
        </header>

        <nav className = {styles.tabBar}>
          {visibleTabs.map(tab => (
            <Link key = {tab.key} to = {`/groups/${groupId}${tabPaths[tab.key] ? `/${tabPaths[tab.key]}` : ''}`} className = {styles.tabButton(activeTab === tab.key)}>
              {tab.label}
              {tab.key === 'requests' && requests.length > 0 && <span>{requests.length}</span>}
            </Link>
          ))}
        </nav>

        <main className = {styles.tabContent}>
          {activeTab === 'home' && (
            <HomeTab
              dashboard = {dashboard}
              scheduleItems = {scheduleItems}
              notice = {notice}
              noticeDraft = {noticeDraft}
              noticeAuthor = {noticeAuthor}
              noticeUpdatedAt = {noticeUpdatedAt}
              editingNotice = {editingNotice}
              canManageNotice = {canManageNotice}
              canManageSchedule = {canManageSchedule}
              canChangeVote = {canChangeVoteForSchedule(scheduleItems[0], sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed)}
              voteStatus = {voteStatus}
              onNoticeDraftChange = {setNoticeDraft}
              onEditNotice = {() => setEditingNotice(true)}
              onCancelNotice = {() => {
                setNoticeDraft(notice);
                setEditingNotice(false);
              }}
              onSaveNotice = {() => {
                setNotice(noticeDraft.trim());
                setEditingNotice(false);
                void groupDetailApi.saveOperationGuide(numericGroupId, noticeDraft.trim()).then(loadGroupDetail).catch(error => showRequestError(error, '운영 안내를 저장하지 못했습니다.'));
              }}
              onDeleteNotice = {() => {
                setNotice('');
                setNoticeDraft('');
                setEditingNotice(false);
                void groupDetailApi.deleteOperationGuide(numericGroupId).then(loadGroupDetail).catch(error => showRequestError(error, '운영 안내를 삭제하지 못했습니다.'));
              }}
              onVote = {handleVote}
              onOpenSchedule = {handleScheduleTabSelection}
              onCreateSchedule = {() => navigate(`/groups/${groupId}/create-session`)}
              onNavigateReport = {id => navigate(`/sessions/${id}/report`)}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              scheduleItems = {scheduleItems}
              year = {calendarYear}
              month = {calendarMonth}
              selectedDay = {selectedDay}
              daySchedules = {daySchedules}
              monthlySummary = {monthlySummary}
              canManage = {canManageSchedule}
              onSelectDay = {setSelectedDay}
              onChangeMonth = {(year, month) => {
                setCalendarYear(year);
                setCalendarMonth(month);
                setSelectedDay(1);
              }}
              onOpenSchedule = {handleScheduleTabSelection}
              onCreateSchedule = {() => navigate(`/groups/${groupId}/create-session`)}
            />
          )}

          {activeTab === 'board' && (
            <BoardTab
              filter = {boardFilter}
              keyword = {boardKeyword}
              posts = {filteredPosts}
              canManage = {canManagePosts}
              canWrite = {canWritePost}
              onFilter = {setBoardFilter}
              onKeyword = {setBoardKeyword}
              currentPage = {boardPage}
              totalPages = {boardTotalPages}
              onPageChange = {setBoardPage}
              onOpenPost = {id => setModal({ type: 'post', id })}
              onWrite = {() => setModal({ type: 'writePost' })}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab
              members = {filteredMembers}
              keyword = {memberKeyword}
              role = {memberRole}
              grade = {memberGrade}
              canManage = {canManageMembers}
              isOwner = {isOwner}
              onKeyword = {setMemberKeyword}
              onRole = {setMemberRole}
              onGrade = {setMemberGrade}
              currentPage = {memberPage}
              totalPages = {memberTotalPages}
              onPageChange = {setMemberPage}
              onOpenMember = {id => setModal({ type: 'member', id })}
            />
          )}

          {activeTab === 'requests' && canManageRequests && (
            <RequestsTab requests = {requests} currentPage = {requestPage} totalPages = {requestTotalPages} onPageChange = {setRequestPage} onRequest = {handleRequest} onAllRequests = {handleAllRequests} />
          )}

          {activeTab === 'history' && canViewHistory && <HistoryTab items = {operationItems} currentPage = {historyPage} totalPages = {historyTotalPages} onPageChange = {setHistoryPage} />}

          {activeTab === 'settings' && isOwner && (
            <SettingsTab
              groupId = {numericGroupId}
              groupInfo = {groupInfo}
              isOwner = {isOwner}
              newJoinAllowed = {newJoinAllowed}
              approvalRequired = {approvalRequired}
              guestAllowed = {guestAllowed}
              onNewJoinAllowed = {value => {
                setNewJoinAllowed(value);
                void groupDetailApi.saveJoinSettings(numericGroupId, { newJoinAllowed: value, approvalRequired, guestAllowed }).catch(error => showRequestError(error, '가입 및 참여 설정을 저장하지 못했습니다.'));
              }}
              onApprovalRequired = {value => {
                setApprovalRequired(value);
                void groupDetailApi.saveJoinSettings(numericGroupId, { newJoinAllowed, approvalRequired: value, guestAllowed }).catch(error => showRequestError(error, '가입 및 참여 설정을 저장하지 못했습니다.'));
              }}
              onGuestAllowed = {value => {
                setGuestAllowed(value);
                void groupDetailApi.saveJoinSettings(numericGroupId, { newJoinAllowed, approvalRequired, guestAllowed: value }).catch(error => showRequestError(error, '가입 및 참여 설정을 저장하지 못했습니다.'));
              }}
              sameDayVoteChangeAllowed = {sameDayVoteChangeAllowed}
              postDeadlineVoteChangeAllowed = {postDeadlineVoteChangeAllowed}
              memberPostAllowed = {memberPostAllowed}
              memberCommentAllowed = {memberCommentAllowed}
              postAttachmentAllowed = {postAttachmentAllowed}
              onSameDayVoteChangeAllowed = {value => {
                setSameDayVoteChangeAllowed(value);
                void groupDetailApi.saveScheduleSettings(numericGroupId, { sameDayVoteChangeAllowed: value, postDeadlineVoteChangeAllowed }).catch(error => showRequestError(error, '일정 운영 설정을 저장하지 못했습니다.'));
              }}
              onPostDeadlineVoteChangeAllowed = {value => {
                setPostDeadlineVoteChangeAllowed(value);
                void groupDetailApi.saveScheduleSettings(numericGroupId, { sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed: value }).catch(error => showRequestError(error, '일정 운영 설정을 저장하지 못했습니다.'));
              }}
              onMemberPostAllowed = {value => {
                setMemberPostAllowed(value);
                void groupDetailApi.saveBoardSettings(numericGroupId, { memberPostAllowed: value, memberCommentAllowed, postAttachmentAllowed }).catch(error => showRequestError(error, '게시판 운영 설정을 저장하지 못했습니다.'));
              }}
              onMemberCommentAllowed = {value => {
                setMemberCommentAllowed(value);
                void groupDetailApi.saveBoardSettings(numericGroupId, { memberPostAllowed, memberCommentAllowed: value, postAttachmentAllowed }).catch(error => showRequestError(error, '게시판 운영 설정을 저장하지 못했습니다.'));
              }}
              onPostAttachmentAllowed = {value => {
                setPostAttachmentAllowed(value);
                void groupDetailApi.saveBoardSettings(numericGroupId, { memberPostAllowed, memberCommentAllowed, postAttachmentAllowed: value }).catch(error => showRequestError(error, '게시판 운영 설정을 저장하지 못했습니다.'));
              }}
              onOpenGroupDeletion = {() => setModal({ type: 'groupDeletion' })}
              onConfirm = {openConfirm}
              onToast = {showToast}
              onError = {showRequestError}
            />
          )}
        </main>
      </div>

      {modal && (
        <Modal title = {getModalTitle(modal, selectedSchedule?.title, selectedPost?.title, selectedMember?.name)} onClose = {() => setModal(null)} onBack = {modal.type === 'editGuest' ? () => setModal({ type: 'participants', id: modal.id }) : modal.type === 'participants' || modal.type === 'addGuest' || modal.type === 'manageSchedule' ? () => setModal({ type: 'schedule', id: modal.id }) : modal.type === 'memberPermissions' || modal.type === 'ownershipTransfer' || modal.type === 'memberRemoval' ? () => setModal({ type: 'member', id: modal.id }) : undefined} centeredHeader = {modal.type === 'schedule' || modal.type === 'post' || modal.type === 'writePost' || modal.type === 'member' || modal.type === 'groupDeletion'} fixedScheduleSize = {modal.type === 'schedule' || modal.type === 'post' || modal.type === 'participants' || modal.type === 'addGuest' || modal.type === 'editGuest' || modal.type === 'manageSchedule' || modal.type === 'writePost' || modal.type === 'member' || modal.type === 'memberPermissions' || modal.type === 'ownershipTransfer' || modal.type === 'memberRemoval' || modal.type === 'groupDeletion'}>
          {selectedSchedule && (
            <ScheduleModal schedule = {selectedSchedule} voteStatus = {voteStatus} canManage = {canManageSchedule} canAddGuest = {canManageSchedule && guestAllowed} canChangeVote = {canChangeVoteForSchedule(selectedSchedule, sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed)} onVote = {status => handleVote(status, selectedSchedule.id)} onOpenParticipants = {id => setModal({ type: 'participants', id })} onAddGuest = {id => setModal({ type: 'addGuest', id })} onManage = {id => setModal({ type: 'manageSchedule', id })} />
          )}
          {selectedPost && <PostModal groupId = {numericGroupId} post = {selectedPost} myMemberId = {groupInfo?.myMemberId} canManage = {canManagePosts} canEdit = {canManagePosts || groupInfo?.myMemberId === selectedPost.authorId} canComment = {canComment} onChanged = {async () => { setListRefreshKey(current => current + 1); await loadGroupDetail(); }} onError = {showRequestError} />}
          {modal.type === 'member' && selectedMember && (
            <MemberModal
              member = {selectedMember}
              isOwner = {isOwner}
              canViewMemo = {canManage}
              canManage = {canManageMembers}
              groupId = {numericGroupId}
              onOpenPermissions = {() => setModal({ type: 'memberPermissions', id: selectedMember.id })}
              onOpenOwnershipTransfer = {() => setModal({ type: 'ownershipTransfer', id: selectedMember.id })}
              onOpenRemoval = {() => setModal({ type: 'memberRemoval', id: selectedMember.id })}
            />
          )}
          {modal.type === 'confirm' && (
            <div className = {styles.confirmContent}>
              <div className = {styles.warningIconBox}><AlertTriangle /></div>
              <p>{modal.description}</p>
              <div className = {styles.modalActions}>
                <Button variant = "outline" className = {styles.roundButton} onClick = {() => setModal(null)}>취소</Button>
                <Button variant = "destructive" className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {executeConfirm}>{modal.actionLabel}</Button>
              </div>
            </div>
          )}
          {modal.type === 'writePost' && canWritePost && <WritePostModal groupId = {numericGroupId} canManage = {canManagePosts} attachmentAllowed = {postAttachmentAllowed} onComplete = {() => { setListRefreshKey(current => current + 1); setModal(null); }} />}
          {modal.type === 'participants' && <ParticipantsModal groupId = {numericGroupId} schedule = {scheduleItems.find(schedule => schedule.id === modal.id)} canManage = {canManageSchedule} onEditGuest = {guest => setModal({ type: 'editGuest', id: modal.id, guest })} />}
          {modal.type === 'addGuest' && <AddGuestModal groupId = {numericGroupId} sessionId = {modal.id} onComplete = {() => setModal(null)} />}
          {modal.type === 'editGuest' && <AddGuestModal groupId = {numericGroupId} sessionId = {modal.id} guest = {modal.guest} onComplete = {() => setModal({ type: 'participants', id: modal.id })} />}
          {modal.type === 'manageSchedule' && <ManageScheduleModal groupId = {numericGroupId} schedule = {scheduleItems.find(schedule => schedule.id === modal.id)} onComplete = {() => setModal(null)} />}
          {modal.type === 'memberPermissions' && selectedMember && <MemberPermissionsModal groupId = {numericGroupId} member = {selectedMember} onComplete = {() => setModal(null)} />}
          {modal.type === 'ownershipTransfer' && selectedMember && <OwnershipTransferModal groupId = {numericGroupId} member = {selectedMember} onComplete = {() => setModal(null)} />}
          {modal.type === 'memberRemoval' && selectedMember && <MemberRemovalModal groupId = {numericGroupId} member = {selectedMember} onComplete = {() => setModal(null)} />}
          {modal.type === 'groupDeletion' && <GroupDeletionModal groupId = {numericGroupId} groupName = {groupInfo?.name || ''} onClose = {() => setModal(null)} onDeleted = {() => navigate('/groups')} />}
        </Modal>
      )}

      {toastMessage && <div className = {styles.floatingNotice} role = "status">{toastMessage}{refreshNotice && <button type = "button" className = {styles.refreshNoticeButton} onClick = {() => window.location.reload()}>새로고침</button>}</div>}
    </div>
  );
}

function HomeTab({
  dashboard, scheduleItems, notice, noticeDraft, noticeAuthor, noticeUpdatedAt, editingNotice, canManageNotice, canManageSchedule, canChangeVote, voteStatus, onNoticeDraftChange, onEditNotice,
  onCancelNotice, onSaveNotice, onDeleteNotice, onVote, onOpenSchedule,
  onCreateSchedule, onNavigateReport,
}: {
  dashboard: GroupDashboardResponse | null;
  scheduleItems: typeof schedules;
  notice: string;
  noticeDraft: string;
  noticeAuthor: string | null;
  noticeUpdatedAt: string | null;
  editingNotice: boolean;
  canManageNotice: boolean;
  canManageSchedule: boolean;
  canChangeVote: boolean;
  voteStatus: VoteStatus;
  onNoticeDraftChange: (value: string) => void;
  onEditNotice: () => void;
  onCancelNotice: () => void;
  onSaveNotice: () => void;
  onDeleteNotice: () => void;
  onVote: (status: VoteStatus) => void;
  onOpenSchedule: (id: number) => void;
  onCreateSchedule: () => void;
  onNavigateReport: (id: number) => void;
}) {
  const upcoming = dashboard?.upcomingSession ? toScheduleItem(dashboard.upcomingSession) : scheduleItems.find(schedule => schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED');
  const recent = dashboard?.recentSessions.map(toScheduleItem) ?? [];
  const participationTrend = dashboard?.participationTrend.map(item => item.attendance) ?? [0, 0, 0, 0];
  const maxParticipation = Math.max(...participationTrend, 1);
  const averageParticipation = Math.round(participationTrend.reduce((sum, value) => sum + value, 0) / participationTrend.length);
  const summaries = [
    ['최근 4주 운동', `${dashboard?.recentFourWeekSessionCount ?? 0}회`, CalendarDays],
    ['평균 참가 인원', `${dashboard?.averageAttendance ?? 0}명`, Users],
    ['주요 활동 시간', dashboard?.peakActivityTime ?? '기록 없음', Clock3],
    ['내 최근 참여', `${dashboard?.myRecentParticipationCount ?? 0}회`, UserCheck],
    ['내 월간 참여율', `${dashboard?.myMonthlyParticipationRate ?? 0}%`, Activity],
    ['평균 경기 수', dashboard?.averageMatchCount == null ? '-' : `${dashboard.averageMatchCount}경기`, BarChart3],
    ['평균 복식 MMR', `${dashboard?.averageDoublesMmr ?? 0}`, ShieldCheck],
    ['평균 혼복 MMR', `${dashboard?.averageMixedMmr ?? 0}`, ShieldCheck],
  ] as const;
  const gradeDistribution = dashboard?.gradeDistribution ?? {};
  const gradeTotal = Object.values(gradeDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className = {styles.homeGrid}>
      <div className = {styles.homeTopGrid}>
        <section className = {styles.mainColumn}>
      <Panel title = "운영 안내" description = "모임 운영에 필요한 내용을 확인하세요." icon = {BellRing} bodyClassName = {styles.noticePanelBody}
        action = {canManageNotice ? editingNotice ? (
          <div className = {styles.noticeEditActions}>
            {notice && <Button variant = "ghost" size = "sm" className = {styles.dangerTextButton} onClick = {onDeleteNotice}><Trash2 /> 삭제</Button>}
            <Button variant = "outline" size = "sm" className = {styles.smallRoundButton} onClick = {onCancelNotice}>취소</Button>
            <Button size = "sm" className = {styles.smallRoundButton} onClick = {onSaveNotice}>저장</Button>
          </div>
        ) : <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {onEditNotice}><Edit3 /> 수정</Button> : null}
      >
        {editingNotice ? (
          <div className = {styles.noticeInlineEditor}>
            <textarea value = {noticeDraft} onChange = {event => onNoticeDraftChange(event.target.value)} className = {`${styles.textarea} ${styles.noticeTextarea}`} maxLength = {150} autoFocus />
          </div>
        ) : notice ? (
          <div className = {styles.noticeBox}>
            <p>{notice}</p>
            {noticeUpdatedAt && noticeAuthor && <span>마지막 수정 {new Date(noticeUpdatedAt).toLocaleString('ko-KR')} · {noticeAuthor}</span>}
          </div>
        ) : (
          <div className = {styles.noticeEmptyState}>
            <div>
              <strong>등록된 운영 안내가 없습니다.</strong>
              <p>운영 안내가 등록되면 이곳에서 확인할 수 있습니다.</p>
            </div>
          </div>
        )}
      </Panel>

          <Panel title = "다가오는 운동 일정" description = "가장 가까운 일정의 참여 상태를 확인하세요." icon = {CalendarDays} bodyClassName = {styles.upcomingPanelBody}
            action = {canManageSchedule ? <Button size = "sm" className = {styles.smallRoundButton} onClick = {onCreateSchedule}><Plus /> 운동 일정 만들기</Button> : null}
          >
            {upcoming ? <div className = {styles.upcomingCard}>
              <div className = {styles.upcomingMain}>
                <div className = {styles.scheduleDateBox}><strong>{Number(upcoming.date.slice(-2))}</strong><span>{Number(upcoming.date.slice(5, 7))}월</span></div>
                <div className = {styles.upcomingText}>
                  <div className = {styles.inlineBadges}>
                    <Badge className = {styles.statusBadge(upcoming.status)}>{getScheduleStatusLabel(upcoming.status)}</Badge>
                    <Badge variant = "outline">{getVoteLabel(voteStatus)}</Badge>
                  </div>
                  <h3>{upcoming.title}</h3>
                  <div className = {styles.detailMeta}>
                    <span><Clock3 /> {upcoming.time}</span>
                    <span><MapPin /> {upcoming.place}</span>
                    <span><Users /> {upcoming.joined}명 참여</span>
                  </div>
                  <p className = {styles.deadlineText}>참여 투표 마감 {upcoming.deadline}</p>
                </div>
              </div>
              <div className = {styles.scheduleActions}>
                {canChangeVote && <div className = {styles.voteButtons}>
                  {(['JOIN', 'UNDECIDED', 'ABSENT'] as VoteStatus[]).map(status => (
                    <button key = {status} type = "button" className = {styles.voteButton(voteStatus === status)} onClick = {() => onVote(status)}>
                      {getVoteLabel(status)}
                    </button>
                  ))}
                </div>}
                <Button variant = "outline" className = {styles.roundButton} onClick = {() => onOpenSchedule(upcoming.id)}>일정 상세</Button>
              </div>
            </div> : <EmptyState className = {styles.preservedEmptyState} icon = {CalendarDays} title = "예정된 운동 일정이 없습니다." description = "새로운 운동 일정이 등록되면 이곳에서 확인할 수 있습니다." />}
          </Panel>

          <Panel title = "최근 운동 기록" description = "종료된 운동의 기록과 리포트를 확인하세요." icon = {FileClock}>
            <div className = {styles.recentList}>
              {recent.length > 0 ? recent.map(schedule => (
                <button key = {schedule.id} type = "button" className = {styles.recentRow} onClick = {() => onNavigateReport(schedule.id)}>
                  <div className = {styles.listIconBox}><Calendar /></div>
                  <div className = {styles.listMain}>
                    <strong>{schedule.title}</strong>
                    <span>{schedule.date.replaceAll('-', '.')} · {schedule.time}</span>
                  </div>
                  <span className = {styles.listMetric}>{schedule.joined}명</span>
                  <span className = {styles.listMetric}>{schedule.matches == null ? '-' : `${schedule.matches}경기`}</span>
                  <ChevronRight className = {styles.smallIcon} />
                </button>
              )) : <EmptyState icon = {FileClock} title = "최근 운동 기록이 없습니다." description = "종료된 운동 기록이 생성되면 이곳에서 확인할 수 있습니다." />}
            </div>
          </Panel>
        </section>

        <aside className = {styles.sideColumn}>
          <Panel title = "모임 활동 요약" description = "최근 한 달 기준 활동 통계입니다." icon = {BarChart3}>
            <div className = {styles.summaryGrid}>
              {summaries.map(([label, value, Icon]) => (
                <div key = {label} className = {styles.summaryCard}>
                  <div><Icon /><span>{label}</span></div>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className = {styles.chartSection}>
              <div className = {styles.chartHeader}><div><strong>최근 4주 참여 추이</strong><span>주차별 평균 참여 인원</span></div><em>평균 {averageParticipation}명</em></div>
              <div className = {styles.barChart}>
                {participationTrend.map((value, index) => (
                  <div key = {index} className = {styles.barChartColumn}>
                    <span className = {styles.barChartValue}>{value}</span>
                    <div className = {styles.barChartTrack}><i style = {{ height: `${Math.round((value / maxParticipation) * 100)}%` }} /></div>
                    <small className = {styles.barChartLabel}>{index + 1}주</small>
                  </div>
                ))}
              </div>
            </div>
            <div className = {styles.gradeChart}>
              <div className = {styles.chartHeader}><div><strong>급수 분포</strong><span>활성 멤버 {gradeTotal}명 기준</span></div></div>
            {['SS', 'S', 'A', 'B', 'C', 'D', 'E'].map(grade => {
              const count = gradeDistribution[grade] ?? 0;
              const percent = gradeTotal ? Math.round((count / gradeTotal) * 100) : 0;
              return (
                <div key = {grade}>
                  <span>{grade}급</span>
                  <i><b style = {{ width: `${percent}%` }} /></i>
                  <em>{count}명</em>
                </div>
              );
            })}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function ScheduleTab({ scheduleItems, year, month, selectedDay, daySchedules, monthlySummary, canManage, onSelectDay, onChangeMonth, onOpenSchedule, onCreateSchedule }: {
  scheduleItems: typeof schedules;
  year: number;
  month: number;
  selectedDay: number;
  daySchedules: typeof schedules;
  monthlySummary: { upcomingCount: number; completedCount: number; cumulativeAttendance: number };
  canManage: boolean;
  onSelectDay: (day: number) => void;
  onChangeMonth: (year: number, month: number) => void;
  onOpenSchedule: (id: number) => void;
  onCreateSchedule: () => void;
}) {
  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstWeekday + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
  }, [month, year]);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthSchedules = scheduleItems.filter(schedule => schedule.date.startsWith(monthPrefix));
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const getDisplayStatus = (schedule: typeof schedules[number]): ScheduleStatus => schedule.date < todayDate ? 'COMPLETED' : schedule.status;

  const changeMonth = (offset: number) => {
    const next = new Date(year, month - 1 + offset, 1);
    onChangeMonth(next.getFullYear(), next.getMonth() + 1);
  };

  return (
    <div className = {styles.scheduleLayout}>
      <Panel title = {`${month}월 일정 캘린더`} description = "예정된 일정과 지난 운동 기록을 함께 확인하세요." icon = {CalendarDays}
        action = {canManage ? <Button size = "sm" className = {styles.smallRoundButton} onClick = {onCreateSchedule}><Plus /> 운동 일정 만들기</Button> : null}
        className = {styles.schedulePanel}
        bodyClassName = {styles.calendarPanelBody}
      >
        <div className = {styles.calendarToolbar}>
          <Button variant = "ghost" size = "icon" className = {styles.iconButton} onClick = {() => changeMonth(-1)}><ChevronLeft /></Button>
          <strong>{year}년 {month}월</strong>
          <Button variant = "ghost" size = "icon" className = {styles.iconButton} onClick = {() => changeMonth(1)}><ChevronRight /></Button>
        </div>
        <div className = {styles.calendarLegend}>
          {(['VOTING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as ScheduleStatus[]).map(status => <span key = {status}><i className = {styles.legendDot(status)} />{getScheduleStatusLabel(status)}</span>)}
        </div>
        <div className = {styles.calendarWeek}>{['일', '월', '화', '수', '목', '금', '토'].map(day => <span key = {day}>{day}</span>)}</div>
        <div className = {styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const dateSchedules = day ? monthSchedules.filter(item => Number(item.date.slice(-2)) === day) : [];
            const schedule = dateSchedules[0];
            const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
            const displayStatus = schedule ? getDisplayStatus(schedule) : undefined;
            return (
              <button key = {index} type = "button" disabled = {!day} className = {styles.calendarDay(day === selectedDay, isToday)} onClick = {() => day && onSelectDay(day)}>
                {day && <span>{isToday ? <b>{day}</b> : day}{dateSchedules.length > 1 ? <small>+{dateSchedules.length - 1}</small> : isToday ? <small>오늘</small> : null}</span>}
                {schedule && displayStatus && <em className = {styles.calendarEvent(displayStatus)}>{schedule.title}</em>}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title = {`${month}월 ${selectedDay}일 일정`} description = "날짜를 선택하면 해당 일정이 표시됩니다." icon = {Clock3} className = {styles.schedulePanel} bodyClassName = {styles.scheduleSideBody}>
        {daySchedules.length > 0 ? (
          <div className = {styles.dayScheduleList}>
            {daySchedules.map(schedule => {
              const displayStatus = getDisplayStatus(schedule);
              return (
                <button key = {schedule.id} type = "button" className = {styles.dayScheduleCard} onClick = {() => onOpenSchedule(schedule.id)}>
                  <div className = {styles.inlineBadges}><Badge className = {styles.statusBadge(displayStatus)}>{getScheduleStatusLabel(displayStatus)}</Badge></div>
                  <strong>{schedule.title}</strong>
                  <span><Clock3 /> {schedule.time}</span>
                  <span><MapPin /> {schedule.place}</span>
                  <span><Users /> 참여 {schedule.joined}명</span>
                  <div className = {styles.cardArrow}><ChevronRight /></div>
                </button>
              );
            })}
          </div>
        ) : <EmptyState icon = {CalendarDays} title = "선택한 날짜에 일정이 없습니다." description = "다른 날짜를 선택하거나 새로운 운동 일정을 만들어보세요." />}
        <div className = {styles.monthScheduleSummary}>
          <div><strong>{month}월 일정 요약</strong><span>이번 달 모임 운영 현황</span></div>
          <section>
            <span><strong>{monthlySummary.upcomingCount}</strong>예정 일정</span>
            <span><strong>{monthlySummary.completedCount}</strong>종료 일정</span>
            <span><strong>{monthlySummary.cumulativeAttendance}</strong>누적 참여</span>
          </section>
        </div>
      </Panel>
    </div>
  );
}

function BoardTab({ filter, keyword, posts: filteredPosts, canManage, canWrite, currentPage, totalPages, onPageChange, onFilter, onKeyword, onOpenPost, onWrite }: {
  filter: string;
  keyword: string;
  posts: typeof posts;
  canManage: boolean;
  canWrite: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFilter: (filter: string) => void;
  onKeyword: (keyword: string) => void;
  onOpenPost: (id: number) => void;
  onWrite: () => void;
}) {
  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "모임 게시판" description = "공지사항과 멤버들의 이야기를 확인하세요." icon = {MessageCircle} className = {styles.listTabPanel} bodyClassName = {styles.listTabBody}
        action = {canWrite ? <Button size = "sm" className = {styles.smallRoundButton} onClick = {onWrite}><Plus /> 글쓰기</Button> : null}
      >
        <div className = {styles.toolbar}>
          <div className = {styles.searchBox}><Search /><Input value = {keyword} onChange = {event => { onKeyword(event.target.value); onPageChange(1); }} placeholder = "게시글 검색" className = {styles.searchInput} /></div>
          <div className = {styles.filterGroup}>
            {['ALL', '공지사항', '자유 게시판'].map(item => <button key = {item} type = "button" className = {styles.filterButton(filter === item)} onClick = {() => { onFilter(item); onPageChange(1); }}>{item === 'ALL' ? '전체' : item}</button>)}
          </div>
        </div>
        <div className = {styles.boardList}>
          {filteredPosts.map(post => (
            <button key = {post.id} type = "button" className = {styles.boardRow} onClick = {() => onOpenPost(post.id)}>
              <span className = {styles.boardType}>{post.pinned && <Pin />}{post.type}</span>
              <div className = {styles.listMain}><strong>{post.title}</strong><span>{post.author} · {post.date}</span></div>
              <span className = {styles.boardMetric}><Eye /> {post.views}</span>
              <span className = {styles.boardMetric}><MessageCircle /> {post.comments}</span>
              <ChevronRight />
            </button>
          ))}
        </div>
        {canManage && <p className = {styles.permissionGuide}><ShieldCheck /><span>공지사항은 소유자와 공지 관리 권한이 있는 매니저만 작성할 수 있습니다.</span></p>}
      </Panel>
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {onPageChange} />
    </div>
  );
}

function MembersTab({ members: filteredMembers, keyword, role, grade, canManage, isOwner, currentPage, totalPages, onPageChange, onKeyword, onRole, onGrade, onOpenMember }: {
  members: typeof members;
  keyword: string;
  role: string;
  grade: string;
  canManage: boolean;
  isOwner: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onKeyword: (keyword: string) => void;
  onRole: (role: string) => void;
  onGrade: (grade: string) => void;
  onOpenMember: (id: number) => void;
}) {
  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "전체 멤버" description = "프로필과 참여 통계를 확인하고 멤버를 관리하세요." icon = {Users} className = {styles.listTabPanel} bodyClassName = {styles.listTabBody}>
      <div className = {styles.toolbar}>
        <div className = {styles.searchBox}><Search /><Input value = {keyword} onChange = {event => { onKeyword(event.target.value); onPageChange(1); }} placeholder = "멤버 이름 검색" className = {styles.searchInput} /></div>
        <div className = {styles.memberFilters}>
          <div className = {styles.filterGroup}>
            {['ALL', '소유자', '매니저', '멤버'].map(item => <button key = {item} type = "button" className = {styles.filterButton(role === item)} onClick = {() => { onRole(item); onPageChange(1); }}>{item === 'ALL' ? '전체 권한' : item}</button>)}
          </div>
          <div className = {styles.filterGroup}>
            {['ALL', 'SS급', 'S급', 'A급', 'B급', 'C급', 'D급', 'E급'].map(item => <button key = {item} type = "button" className = {styles.filterButton(grade === item)} onClick = {() => { onGrade(item); onPageChange(1); }}>{item === 'ALL' ? '전체 급수' : item}</button>)}
          </div>
        </div>
      </div>
      <div className = {styles.memberGrid}>
        {filteredMembers.map(member => (
          <button key = {member.id} type = "button" className = {styles.memberCard} onClick = {() => onOpenMember(member.id)}>
            <div className = {styles.memberTop}>
              <div className = {styles.avatar}>{member.name[0]}</div>
              <div className = {styles.memberIdentity}>
                <div><strong>{member.name}</strong>{member.role === '소유자' && <Crown />}{member.role === '매니저' && <ShieldCheck />}</div>
                <span>{member.gender} · {member.age} · {member.grade}</span>
              </div>
              <MoreHorizontal />
            </div>
            <div className = {styles.memberStats}>
              <span><strong>{member.participation}</strong>총 참여</span>
              <span><strong>{member.rate}%</strong>월간 참여율</span>
              <span><strong>{member.winRate == null ? '-' : `${member.winRate}%`}</strong>승률</span>
            </div>
          </button>
        ))}
      </div>
      {filteredMembers.length === 0 && <EmptyState icon = {Users} title = "조건에 맞는 멤버가 없습니다." description = "검색어나 역할 필터를 변경해보세요." />}
      {canManage && <p className = {styles.permissionGuide}><LockKeyhole /><span>{isOwner ? '소유자는 매니저 임명, 소유권 이전, 멤버 강제 탈퇴를 관리할 수 있습니다.' : '매니저는 권한 범위 안에서 일반 멤버만 관리할 수 있습니다.'}</span></p>}
      </Panel>
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {onPageChange} />
    </div>
  );
}

function RequestsTab({ requests, currentPage, totalPages, onPageChange, onRequest, onAllRequests }: { requests: typeof joinRequests; currentPage: number; totalPages: number; onPageChange: (page: number) => void; onRequest: (id: number, approve: boolean) => void; onAllRequests: (approve: boolean) => void }) {
  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "가입 요청 관리" description = "승인 대기 중인 회원의 정보를 확인하세요." icon = {UserCheck} className = {styles.listTabPanel} action = {requests.length > 0 && <div className = {styles.requestBulkActions}><Button variant = "outline" className = {`${styles.smallRoundButton} ${styles.dangerTextButton}`} onClick = {() => onAllRequests(false)}>전체 거절</Button><Button className = {styles.smallRoundButton} onClick = {() => onAllRequests(true)}><Check /> 전체 승인</Button></div>}>
      {requests.length > 0 ? (
        <div className = {styles.requestList}>
          {requests.map(request => (
            <div key = {request.id} className = {styles.requestCard}>
              <div className = {styles.avatar}>{request.name[0]}</div>
              <div className = {styles.requestMain}>
                <div><strong>{request.name}</strong><span>{request.gender} · {request.age} · {request.grade}</span></div>
                <p>{request.message}</p>
                <span>{formatRequestTime(request.requestedAt)}</span>
              </div>
              <div className = {styles.requestActions}>
                <Button variant = "outline" className = {styles.smallRoundButton} onClick = {() => onRequest(request.id, false)}>거절</Button>
                <Button className = {styles.smallRoundButton} onClick = {() => onRequest(request.id, true)}><Check /> 승인</Button>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState icon = {UserCheck} title = "대기 중인 가입 요청이 없습니다." description = "새로운 가입 요청이 도착하면 이곳에서 확인할 수 있습니다." />}
      </Panel>
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {onPageChange} />
    </div>
  );
}

function HistoryTab({ items, currentPage, totalPages, onPageChange }: { items: typeof operationHistory; currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "운영 기록" description = "모임 운영에 영향을 준 변경 사항을 확인하세요." icon = {FileClock} className = {styles.listTabPanel}>
      <div className = {styles.historyList}>
        {items.map(history => {
          const Icon = history.icon;
          return (
            <div key = {history.id} className = {styles.historyRow}>
              <div className = {styles.listIconBox}><Icon /></div>
              <div className = {styles.listMain}><strong>{history.action}</strong><span>작업자 {history.actor}</span></div>
              <time>{history.time}</time>
            </div>
          );
        })}
      </div>
      </Panel>
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {onPageChange} />
    </div>
  );
}

function SettingsTab({ groupId, groupInfo, isOwner, newJoinAllowed, approvalRequired, guestAllowed, sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed, memberPostAllowed, memberCommentAllowed, postAttachmentAllowed, onNewJoinAllowed, onApprovalRequired, onGuestAllowed, onSameDayVoteChangeAllowed, onPostDeadlineVoteChangeAllowed, onMemberPostAllowed, onMemberCommentAllowed, onPostAttachmentAllowed, onOpenGroupDeletion, onConfirm, onToast, onError }: {
  groupId: number;
  groupInfo: GroupDetailResponse | null;
  isOwner: boolean;
  newJoinAllowed: boolean;
  approvalRequired: boolean;
  guestAllowed: boolean;
  sameDayVoteChangeAllowed: boolean;
  postDeadlineVoteChangeAllowed: boolean;
  memberPostAllowed: boolean;
  memberCommentAllowed: boolean;
  postAttachmentAllowed: boolean;
  onNewJoinAllowed: (value: boolean) => void;
  onApprovalRequired: (value: boolean) => void;
  onGuestAllowed: (value: boolean) => void;
  onSameDayVoteChangeAllowed: (value: boolean) => void;
  onPostDeadlineVoteChangeAllowed: (value: boolean) => void;
  onMemberPostAllowed: (value: boolean) => void;
  onMemberCommentAllowed: (value: boolean) => void;
  onPostAttachmentAllowed: (value: boolean) => void;
  onOpenGroupDeletion: () => void;
  onConfirm: (title: string, description: string, actionLabel: string, actionMessage: string, onConfirm?: () => void) => void;
  onToast: (message: string) => void;
  onError: (error: unknown, fallback: string) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [groupImagePreview, setGroupImagePreview] = useState(groupInfo?.profileImageUrl || '/shuttleplay-maskable-icon-512.png');
  const [basicName, setBasicName] = useState(groupInfo?.name || '');
  const initialRegion = splitActivityRegion(groupInfo?.activityRegion || '');
  const [basicProvince, setBasicProvince] = useState(initialRegion.province);
  const [basicDistrict, setBasicDistrict] = useState(initialRegion.district);
  const [basicDescription, setBasicDescription] = useState(groupInfo?.description || '');
  const districtOptions = basicProvince ? koreanRegions[basicProvince] : [];

  useEffect(() => {
    setGroupImagePreview(groupInfo?.profileImageUrl || '/shuttleplay-maskable-icon-512.png');
    setBasicName(groupInfo?.name || '');
    const region = splitActivityRegion(groupInfo?.activityRegion || '');
    setBasicProvince(region.province);
    setBasicDistrict(region.district);
    setBasicDescription(groupInfo?.description || '');
  }, [groupInfo]);

  return (
    <div className = {styles.settingsGrid}>
      <section className = {styles.settingsMain}>
        <Panel title = "모임 대표 이미지" description = "목록과 상세 페이지에 표시됩니다." icon = {CircleUserRound}>
          <div className = {styles.imageSetting}>
            <img src = {groupImagePreview} alt = "모임 대표" />
            <input
              ref = {imageInputRef}
              type = "file"
              accept = "image/*"
              className = "hidden"
              onChange = {event => {
                const file = event.target.files?.[0];
                if (file) {
                  setGroupImagePreview(URL.createObjectURL(file));
                  void groupDetailApi.updateImage(groupId, file).then(() => onToast('대표 이미지를 변경했습니다.')).catch(error => onError(error, '대표 이미지를 변경하지 못했습니다.'));
                }
              }}
            />
            <div><Button variant = "ghost" className = {styles.textButton} onClick = {() => imageInputRef.current?.click()}>이미지 변경</Button><Button variant = "ghost" className = {styles.dangerTextButton} onClick = {() => onConfirm('대표 이미지를 삭제할까요?', '삭제하면 기본 모임 이미지가 표시됩니다.', '이미지 삭제', '대표 이미지를 기본 이미지로 변경했습니다.', () => { setGroupImagePreview('/shuttleplay-maskable-icon-512.png'); if (imageInputRef.current) imageInputRef.current.value = ''; void groupDetailApi.resetImage(groupId).then(() => onToast('대표 이미지를 기본 이미지로 변경했습니다.')).catch(error => onError(error, '대표 이미지를 기본 이미지로 변경하지 못했습니다.')); })}>삭제</Button></div>
          </div>
        </Panel>

        <Panel title = "기본 정보" description = "모임에 표시되는 정보를 인라인으로 수정합니다." icon = {Edit3}>
          <div className = {styles.settingsForm}>
            <label><span>모임명</span><Input value = {basicName} onChange = {event => setBasicName(event.target.value)} className = {styles.input} /></label>
            <div className = {styles.settingsRegionGrid}>
              <label><span>시·도</span><Select value = {basicProvince} onValueChange = {value => { setBasicProvince(value); setBasicDistrict(''); }}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "시·도 선택" /></SelectTrigger><SelectContent>{provinceOptions.map(province => <SelectItem className = {styles.guestSelectItem} key = {province} value = {province}>{province}</SelectItem>)}</SelectContent></Select></label>
              <label><span>시·군·구</span><Select value = {basicDistrict} disabled = {!basicProvince} onValueChange = {setBasicDistrict}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "시·군·구 선택" /></SelectTrigger><SelectContent><SelectItem className = {styles.guestSelectItem} value = "전체">전체</SelectItem>{districtOptions.map(district => <SelectItem className = {styles.guestSelectItem} key = {district} value = {district}>{district}</SelectItem>)}</SelectContent></Select></label>
            </div>
            <label><span>모임 설명</span><textarea value = {basicDescription} onChange = {event => setBasicDescription(event.target.value)} className = {styles.textarea} /></label>
            <Button className = {styles.saveButton} onClick = {() => void groupDetailApi.saveBasicSettings(groupId, { name: basicName, activityRegion: basicDistrict ? `${basicProvince} ${basicDistrict}` : basicProvince, description: basicDescription }).then(() => onToast('모임 기본 정보를 저장했습니다.')).catch(error => onError(error, '모임 기본 정보를 저장하지 못했습니다.'))}><Check /> 변경사항 저장</Button>
          </div>
        </Panel>

        <Panel title = "가입 및 참여 설정" description = "새로운 회원과 게스트의 참여 기준을 관리합니다." icon = {UserCheck}>
          <div className = {styles.switchList}>
            <SettingSwitch title = "신규 가입 허용" description = "로그인한 회원의 모임 가입 요청을 받습니다." checked = {newJoinAllowed} onCheckedChange = {onNewJoinAllowed} />
            <SettingSwitch title = "가입 승인 필요" description = "소유자 또는 권한 있는 매니저가 가입 요청을 승인합니다." checked = {approvalRequired} onCheckedChange = {onApprovalRequired} />
            <SettingSwitch title = "게스트 일정 참여 허용" description = "특정 운동 일정의 게스트 참여 링크 사용을 허용합니다." checked = {guestAllowed} onCheckedChange = {onGuestAllowed} />
          </div>
        </Panel>

        <Panel title = "일정 운영 설정" description = "일정 메뉴와 참여 투표에 공통으로 적용할 운영 기준을 설정합니다." icon = {CalendarDays}>
          <div className = {styles.switchList}>
            <SettingSwitch title = "일정 당일 참여 상태 변경 허용" description = "일정 당일에도 멤버가 참여·미정·불참 상태를 변경할 수 있습니다." checked = {sameDayVoteChangeAllowed} onCheckedChange = {onSameDayVoteChangeAllowed} />
            <SettingSwitch title = "투표 마감 후 상태 변경 허용" description = "참여 투표가 마감된 뒤에도 멤버가 참여 상태를 변경할 수 있습니다." checked = {postDeadlineVoteChangeAllowed} onCheckedChange = {onPostDeadlineVoteChangeAllowed} />
          </div>
        </Panel>

        <Panel title = "게시판 운영 설정" description = "게시판 메뉴에서 일반 멤버가 사용할 수 있는 기능을 설정합니다." icon = {MessageCircle}>
          <div className = {styles.switchList}>
            <SettingSwitch title = "자유 게시판 작성 허용" description = "일반 멤버가 자유 게시판에 게시글을 작성할 수 있습니다." checked = {memberPostAllowed} onCheckedChange = {onMemberPostAllowed} />
            <SettingSwitch title = "댓글 및 대댓글 작성 허용" description = "일반 멤버가 게시글에 댓글과 대댓글을 작성할 수 있습니다." checked = {memberCommentAllowed} onCheckedChange = {onMemberCommentAllowed} />
            <SettingSwitch title = "게시글 파일 첨부 허용" description = "게시글 작성 시 이미지와 문서 파일을 첨부할 수 있습니다." checked = {postAttachmentAllowed} onCheckedChange = {onPostAttachmentAllowed} />
          </div>
        </Panel>

        {isOwner && (
          <Panel title = "위험 영역" description = "소유자만 실행할 수 있는 작업입니다." icon = {AlertTriangle}>
            <div className = {styles.dangerZone}>
              <strong>모임 삭제</strong>
              <p>예정되거나 진행 중인 일정이 있다면 먼저 확인해야 합니다. 삭제 후에도 기존 경기와 MMR 기록은 보존됩니다.</p>
              <Button variant = "destructive" className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {onOpenGroupDeletion}><Trash2 /> 모임 삭제</Button>
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function Panel({ title, description, icon: Icon, action, children, className = '', bodyClassName = '' }: { title: string; description?: string; icon: typeof Calendar; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className = {`${styles.panel} ${className}`}>
      <header className = {styles.panelHeader}>
        <div className = {styles.panelTitleBox}><div className = {styles.panelIconBox}><Icon /></div><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>
        {action && <div>{action}</div>}
      </header>
      <div className = {`${styles.panelBody} ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <nav className = {styles.pagination} aria-label = "페이지 이동">
      <button type = "button" className = {styles.paginationArrow} disabled = {currentPage === 1} onClick = {() => onPageChange(currentPage - 1)} aria-label = "이전 페이지"><ChevronLeft /></button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
        <button key = {page} type = "button" className = {styles.paginationPage(currentPage === page)} onClick = {() => onPageChange(page)}>{page}</button>
      ))}
      <button type = "button" className = {styles.paginationArrow} disabled = {currentPage === totalPages} onClick = {() => onPageChange(currentPage + 1)} aria-label = "다음 페이지"><ChevronRight /></button>
    </nav>
  );
}

function EmptyState({ icon: Icon, title, description, action, className = '' }: { icon: typeof Calendar; title: string; description: string; action?: ReactNode; className?: string }) {
  return <div className = {`${styles.emptyState} ${className}`}><div className = {styles.emptyIconBox}><Icon /></div><strong>{title}</strong><p>{description}</p>{action}</div>;
}

function Modal({ title, children, onClose, onBack, centeredHeader = false, fixedScheduleSize = false }: { title: string; children: ReactNode; onClose: () => void; onBack?: () => void; centeredHeader?: boolean; fixedScheduleSize?: boolean }) {
  return (
    <div className = {styles.modalOverlay} onClick = {onClose}>
      <section className = {`${styles.modal} ${fixedScheduleSize ? styles.scheduleModal : ''}`} onClick = {event => event.stopPropagation()}>
        <header className = {onBack || centeredHeader ? styles.modalHeaderWithBack : styles.modalHeader}>{onBack ? <Button variant = "ghost" size = "icon" className = {styles.iconButton} onClick = {onBack} aria-label = "뒤로가기"><ArrowLeft /></Button> : centeredHeader ? <span /> : null}<h2>{title}</h2><Button variant = "ghost" size = "icon" className = {styles.iconButton} onClick = {onClose}><X /></Button></header>
        <div className = {fixedScheduleSize ? styles.scheduleModalBody : styles.modalBody}>{children}</div>
      </section>
    </div>
  );
}

function ScheduleModal({ schedule, voteStatus, canManage, canAddGuest, canChangeVote, onVote, onOpenParticipants, onAddGuest, onManage }: { schedule: typeof schedules[number]; voteStatus: VoteStatus; canManage: boolean; canAddGuest: boolean; canChangeVote: boolean; onVote: (status: VoteStatus) => void; onOpenParticipants: (id: number) => void; onAddGuest: (id: number) => void; onManage: (id: number) => void }) {
  return (
    <div className = {styles.scheduleModalContent}>
      <div className = {styles.modalHighlight}><Badge className = {styles.statusBadge(schedule.status)}>{getScheduleStatusLabel(schedule.status)}</Badge><strong>{schedule.date.replaceAll('-', '.')} · {schedule.time}</strong><span><MapPin /> {schedule.place}</span></div>
      <div className = {styles.modalStats}>
        <span><strong>{schedule.joined}</strong>참여</span><span><strong>{schedule.undecided}</strong>미정</span><span><strong>{schedule.absent}</strong>불참</span><span><strong>{schedule.guests}</strong>게스트</span>
      </div>
      <div className = {styles.modalSection}><h3>내 참여 상태</h3><p>참여 투표 마감 {schedule.deadline}</p>{canChangeVote && <div className = {styles.voteButtons}>{(['JOIN', 'UNDECIDED', 'ABSENT'] as VoteStatus[]).map(status => <button key = {status} type = "button" className = {styles.voteButton(voteStatus === status)} onClick = {() => onVote(status)}>{getVoteLabel(status)}</button>)}</div>}</div>
      <div className = {styles.modalSection}><h3>참가자 및 게스트</h3><p>참여 {schedule.joined}명 · 미정 {schedule.undecided}명 · 불참 {schedule.absent}명</p><Button variant = "outline" className = {styles.smallRoundButton} onClick = {() => onOpenParticipants(schedule.id)}><Users /> 참가자 목록 확인</Button></div>
      {canManage && <div className = {styles.modalActions}>{canAddGuest && <Button variant = "outline" className = {styles.roundButton} onClick = {() => onAddGuest(schedule.id)}><Plus /> 게스트 추가</Button>}<Button className = {styles.roundButton} onClick = {() => onManage(schedule.id)}><Settings /> 일정 관리</Button></div>}
    </div>
  );
}

function PostModal({ groupId, post, myMemberId, canManage, canEdit, canComment, onChanged, onError }: { groupId: number; post: typeof posts[number]; myMemberId?: number; canManage: boolean; canEdit: boolean; canComment: boolean; onChanged: () => Promise<void>; onError: (error: unknown, fallback: string) => void }) {
  const [deleted, setDeleted] = useState(false);
  const [pinned, setPinned] = useState(post.pinned);
  const [editingPost, setEditingPost] = useState(false);
  const [postContent, setPostContent] = useState(post.content);
  const [postDraft, setPostDraft] = useState(post.content);
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(null);
  const [reply, setReply] = useState('');
  const [comments, setComments] = useState<Array<{ id: number; authorId: number; author: string; content: string; time: string; parentId: number | null }>>([]);

  const loadComments = useCallback(() => groupDetailApi.getComments(groupId, post.id).then(items => setComments(items.map(item => ({
    id: item.id,
    authorId: item.authorId,
    author: item.authorName,
    content: item.content,
    time: new Date(item.createdAt).toLocaleString('ko-KR'),
    parentId: item.parentId || null,
  })))), [groupId, post.id]);
  useEffect(() => { void groupDetailApi.getPost(groupId, post.id); void loadComments(); }, [groupId, loadComments, post.id]);

  const addComment = () => {
    if (!comment.trim()) return;
    void groupDetailApi.createComment(groupId, post.id, comment.trim()).then(() => { setComment(''); return loadComments(); });
  };

  const addReply = (parentId: number) => {
    if (!reply.trim()) return;
    void groupDetailApi.createReply(groupId, post.id, parentId, reply.trim()).then(() => { setReply(''); setReplyingCommentId(null); return loadComments(); });
  };

  const removeComment = (commentId: number) => {
    void groupDetailApi.deleteComment(groupId, post.id, commentId).then(loadComments);
  };

  const renderComment = (item: typeof comments[number], isReply = false) => (
    <div key = {item.id} className = {isReply ? styles.commentReply : styles.comment}>
      <div className = {styles.avatarSmall}>{item.author[0]}</div>
      <div className = {styles.commentBody}>
        <div className = {styles.commentHeader}>
          <strong>{item.author}</strong>
          <span>
            {canComment && !isReply && <button type = "button" onClick = {() => { setReplyingCommentId(item.id); setReply(''); }}>답글</button>}
            {(canManage || item.authorId === myMemberId) && <><button type = "button" onClick = {() => { setEditingCommentId(item.id); setCommentDraft(item.content); }}>수정</button><button type = "button" onClick = {() => removeComment(item.id)}>삭제</button></>}
          </span>
        </div>
        {editingCommentId === item.id ? <div className = {styles.commentEdit}><Input value = {commentDraft} onChange = {event => setCommentDraft(event.target.value)} className = {styles.input} /><Button variant = "outline" size = "sm" className = {styles.smallRoundButton} onClick = {() => setEditingCommentId(null)}>취소</Button><Button size = "sm" className = {styles.smallRoundButton} onClick = {() => void groupDetailApi.updateComment(groupId, post.id, item.id, commentDraft.trim()).then(() => { setEditingCommentId(null); return loadComments(); })}>저장</Button></div> : <p>{item.content}</p>}
        <small>{item.time}</small>
        {!isReply && replyingCommentId === item.id && <div className = {styles.replyInput}><Input value = {reply} onChange = {event => setReply(event.target.value)} placeholder = "답글을 입력하세요" className = {styles.input} /><Button variant = "outline" size = "sm" className = {styles.smallRoundButton} onClick = {() => setReplyingCommentId(null)}>취소</Button><Button size = "sm" className = {styles.smallRoundButton} disabled = {!reply.trim()} onClick = {() => addReply(item.id)}>등록</Button></div>}
      </div>
    </div>
  );

  return (
    <div className = {styles.postModalContent}>
      {deleted ? <EmptyState icon = {MessageCircle} title = "삭제된 게시글입니다." description = "작성자가 게시글을 삭제했습니다." /> : <>
      <div className = {styles.postMetaRow}>
        <div className = {styles.postMeta}><Badge variant = "outline">{post.type}</Badge>{pinned && <Badge className = {styles.statusBadge('VOTING')}><Pin /> 고정 게시물</Badge>}<span>{post.author} · {post.date}</span><span><Eye /> {post.views}</span><span><MessageCircle /> {comments.length}</span></div>
        <div className = {styles.postActions}>
          {canManage && <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => void groupDetailApi.togglePin(groupId, post.id).then(() => { setPinned(current => !current); return onChanged(); })}><Pin /> {pinned ? '고정 해제' : '상단 고정'}</Button>}
          {canEdit && <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => { setPostDraft(postContent); setEditingPost(current => !current); }}><Edit3 /> 수정</Button>}
          {canEdit && <Button variant = "ghost" size = "sm" className = {styles.dangerTextButton} onClick = {() => void groupDetailApi.deletePost(groupId, post.id).then(() => { setDeleted(true); return onChanged(); })}><Trash2 /> 삭제</Button>}
        </div>
      </div>
      {editingPost ? (
        <div className = {styles.postEditArea}>
          <textarea value = {postDraft} onChange = {event => setPostDraft(event.target.value)} className = {styles.postEditTextarea} />
          <div className = {styles.postEditActions}><Button variant = "outline" size = "sm" className = {styles.smallRoundButton} onClick = {() => setEditingPost(false)}>취소</Button><Button size = "sm" className = {styles.smallRoundButton} onClick = {() => void groupDetailApi.updatePost(groupId, post.id, { type: post.type === '공지사항' ? 'NOTICE' : 'FREE', title: post.title, content: postDraft.trim(), pinned, attachmentNames: post.attachmentNames }).then(() => { setPostContent(postDraft.trim()); setEditingPost(false); return onChanged(); }).catch(error => onError(error, '게시글을 저장하지 못했습니다.'))}>저장</Button></div>
        </div>
      ) : <p className = {styles.postContent}>{postContent}</p>}
      {post.attachmentNames && (
        <div className = {styles.postFileUpload}>
          <span><Paperclip /> 첨부 파일</span>
          <ul className = {styles.postFileList}>
            {post.attachmentNames.split(',').map(item => {
              const [name, url] = item.split('|');
              return <li key = {item}><Paperclip /><a href = {url} target = "_blank" rel = "noreferrer">{name}</a></li>;
            })}
          </ul>
        </div>
      )}
      <div className = {styles.postComments}>
        <h3>댓글 {comments.length}</h3>
        <div className = {styles.commentList}>
          {comments.filter(item => item.parentId === null).map(item => <div key = {item.id} className = {styles.commentThread}>{renderComment(item)}{comments.filter(replyItem => replyItem.parentId === item.id).map(replyItem => renderComment(replyItem, true))}</div>)}
        </div>
        {canComment && <div className = {styles.commentInput}><Input value = {comment} onChange = {event => setComment(event.target.value)} placeholder = "댓글을 입력하세요" className = {styles.input} /><Button className = {styles.smallRoundButton} disabled = {!comment.trim()} onClick = {addComment}>등록</Button></div>}
      </div>
      </>}
    </div>
  );
}

function MemberModal({ groupId, member, isOwner, canViewMemo, canManage, onOpenPermissions, onOpenOwnershipTransfer, onOpenRemoval }: { groupId: number; member: typeof members[number]; isOwner: boolean; canViewMemo: boolean; canManage: boolean; onOpenPermissions: () => void; onOpenOwnershipTransfer: () => void; onOpenRemoval: () => void }) {
  const isTargetOwner = member.role === '소유자';
  const [memo, setMemo] = useState('');
  const [memoDraft, setMemoDraft] = useState('');
  const [editingMemo, setEditingMemo] = useState(false);
  useEffect(() => {
    void groupDetailApi.getMember(groupId, member.id).then(detail => {
      setMemo(detail.memo ?? '');
      setMemoDraft(detail.memo ?? '');
    });
  }, [groupId, member.id]);
  return (
    <div className = {styles.memberModalContent}>
      <div className = {styles.memberModalScroll}>
        <div className = {styles.memberModalHeader}><div className = {styles.avatarLarge}>{member.name[0]}</div><div><div><h3>{member.name}</h3><Badge variant = "outline">{member.role}</Badge></div><p>{member.gender} · {member.age} · {member.grade}</p></div></div>
        <div className = {styles.memberDetailGrid}>
          <span><strong>{member.participation}회</strong>총 참여</span><span><strong>{member.recent}회</strong>최근 4주 참여</span><span><strong>{member.rate}%</strong>월간 참여율</span>
          <span><strong>{member.matches ?? '-'}</strong>평균 경기 수</span><span><strong>{member.winRate == null ? '-' : `${member.winRate}%`}</strong>승률</span><span><strong>{member.absenceRate == null ? '-' : `${member.absenceRate}%`}</strong>불참률</span>
          <span><strong>{member.doublesMmr}</strong>복식 MMR</span><span><strong>{member.mixedMmr}</strong>혼복 MMR</span><span><strong>{member.streak == null ? '-' : `${member.streak}회`}</strong>연속 참여</span>
        </div>
        {canViewMemo && <div className = {styles.memberMemo}>
          <div>
            <Edit3 />
            <strong>멤버 메모</strong>
            {canManage && (editingMemo
              ? <div className = {styles.memberMemoHeaderActions}><Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => setEditingMemo(false)}>취소</Button><Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => { const nextMemo = memoDraft.trim(); void groupDetailApi.saveMemo(groupId, member.id, nextMemo).then(() => { setMemo(nextMemo); setEditingMemo(false); }); }}>저장</Button></div>
              : <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => { setMemoDraft(memo); setEditingMemo(true); }}>{memo ? '수정' : '작성'}</Button>)}
          </div>
          {editingMemo ? <textarea className = {styles.memberMemoInlineTextarea} value = {memoDraft} onChange = {event => setMemoDraft(event.target.value)} placeholder = "운영에 필요한 멤버 메모를 입력하세요." /> : <p>{memo || '등록된 멤버 메모가 없습니다.'}</p>}
        </div>}
      </div>
      {canManage && !isTargetOwner && (
        <div className = {styles.modalActions}>
          {isOwner && <Button variant = "outline" className = {styles.roundButton} onClick = {onOpenPermissions}><ShieldCheck /> 권한 변경</Button>}
          {isOwner && <Button variant = "outline" className = {styles.roundButton} onClick = {onOpenOwnershipTransfer}><Crown /> 소유권 이전</Button>}
          <Button variant = "destructive" className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {onOpenRemoval}><UserMinus /> 강제 탈퇴</Button>
        </div>
      )}
    </div>
  );
}

function MemberPermissionsModal({ groupId, member, onComplete }: { groupId: number; member: typeof members[number]; onComplete: (message: string) => void }) {
  const [role, setRole] = useState<'MANAGER' | 'MEMBER'>(member.role === '매니저' ? 'MANAGER' : 'MEMBER');
  const [permissions, setPermissions] = useState<GroupPermissions>({ schedule: true, notice: true, joinRequests: false, members: false, posts: true, operationLogs: false });
  const labels = { schedule: '일정 관리', notice: '운영 안내 관리', joinRequests: '가입 요청 관리', members: '일반 멤버 관리', posts: '공지사항 관리', operationLogs: '운영 기록 조회' } as const;
  useEffect(() => {
    if (member.role === '매니저') void groupDetailApi.getPermissions(groupId, member.id).then(setPermissions);
  }, [groupId, member.id, member.role]);
  return (
    <div className = {styles.memberManagementModal}>
      <div className = {styles.memberModalHeader}><div className = {styles.avatarLarge}>{member.name[0]}</div><div><div><h3>{member.name}</h3><Badge variant = "outline">{role === 'MANAGER' ? '매니저' : '일반 멤버'}</Badge></div><p>역할과 허용할 운영 범위를 설정합니다.</p></div></div>
      <div className = {styles.memberManagementScroll}>
        <div className = {styles.roleSelector}>
          <button type = "button" className = {styles.roleOption(role === 'MEMBER')} onClick = {() => setRole('MEMBER')}><Users /><span><strong>일반 멤버</strong><small>모임 정보 확인, 일정 참여, 게시판 이용</small></span></button>
          <button type = "button" className = {styles.roleOption(role === 'MANAGER')} onClick = {() => setRole('MANAGER')}><ShieldCheck /><span><strong>매니저</strong><small>선택한 운영 권한 범위에서 모임 관리</small></span></button>
        </div>
        <div className = {styles.permissionSection}>
          <strong>매니저 세부 권한</strong>
          <div className = {styles.permissionOptionList}>{Object.entries(labels).map(([key, label]) => {
            const permissionKey = key as keyof typeof permissions;
            const enabled = role === 'MANAGER' && permissions[permissionKey];
            return <button key = {key} type = "button" disabled = {role !== 'MANAGER'} aria-pressed = {enabled} className = {styles.permissionOption(enabled)} onClick = {() => setPermissions(current => ({ ...current, [permissionKey]: !current[permissionKey] }))}><span><strong>{label}</strong><small>{role === 'MANAGER' ? `${label} 기능 사용을 허용합니다.` : '매니저 역할을 선택하면 설정할 수 있습니다.'}</small></span><span>{enabled && <Check />}{enabled ? '허용' : '허용 안 함'}</span></button>;
          })}</div>
        </div>
      </div>
      <div className = {styles.modalActions}><Button className = {styles.roundButton} onClick = {() => void groupDetailApi.updateRole(groupId, member.id, role).then(() => role === 'MANAGER' ? groupDetailApi.updatePermissions(groupId, member.id, permissions) : undefined).then(() => onComplete(''))}><Check /> 권한 저장</Button></div>
    </div>
  );
}

function OwnershipTransferModal({ groupId, member, onComplete }: { groupId: number; member: typeof members[number]; onComplete: (message: string) => void }) {
  const [confirmation, setConfirmation] = useState('');
  return (
    <div className = {styles.memberManagementModal}>
      <div className = {styles.ownershipSummary}><Crown /><div><strong>{member.name}님에게 소유권 이전</strong><span>이전 후 해당 멤버가 모임의 최고 관리자가 됩니다.</span></div></div>
      <div className = {styles.ownershipChanges}>
        <strong>소유권 이전 후 변경 사항</strong>
        <span><Check /> 새 소유자가 모임 삭제와 소유권 이전 권한을 가집니다.</span>
        <span><Check /> 현재 소유자는 매니저로 변경됩니다.</span>
        <span><Check /> 기존 일정, 게시글, 멤버 및 경기 기록은 유지됩니다.</span>
      </div>
      <label className = {styles.modalField}><span>확인을 위해 <strong>{member.name}</strong> 입력</span><Input value = {confirmation} onChange = {event => setConfirmation(event.target.value)} className = {styles.input} placeholder = {member.name} /></label>
      <div className = {styles.modalActions}><Button variant = "destructive" disabled = {confirmation !== member.name} className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {() => void groupDetailApi.transferOwner(groupId, member.id).then(() => onComplete(''))}><Crown /> 소유권 이전</Button></div>
    </div>
  );
}

function MemberRemovalModal({ groupId, member, onComplete }: { groupId: number; member: typeof members[number]; onComplete: (message: string) => void }) {
  const [confirmation, setConfirmation] = useState('');
  return (
    <div className = {styles.memberManagementModal}>
      <div className = {styles.removalSummary}><AlertTriangle /><div><strong>{member.name}님을 강제 탈퇴 처리합니다.</strong><span>처리 후 해당 멤버는 모임 상세와 게시판에 접근할 수 없습니다.</span></div></div>
      <div className = {styles.ownershipChanges}>
        <strong>강제 탈퇴 처리 안내</strong>
        <span><Check /> 기존 일정 참여, 경기 및 MMR 기록은 보존됩니다.</span>
        <span><Check /> 예정 일정의 참여 상태는 취소 처리됩니다.</span>
        <span><Check /> 다시 참여하려면 새로운 가입 절차가 필요합니다.</span>
      </div>
      <label className = {styles.modalField}><span>확인을 위해 <strong>{member.name}</strong> 입력</span><Input value = {confirmation} onChange = {event => setConfirmation(event.target.value)} className = {styles.input} placeholder = {member.name} /></label>
      <div className = {styles.modalActions}><Button variant = "destructive" disabled = {confirmation !== member.name} className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {() => void groupDetailApi.removeMember(groupId, member.id).then(() => onComplete(''))}><UserMinus /> 강제 탈퇴</Button></div>
    </div>
  );
}

function GroupDeletionModal({ groupId, groupName, onClose, onDeleted }: { groupId: number; groupName: string; onClose: () => void; onDeleted: () => void }) {
  const [confirmation, setConfirmation] = useState('');
  const [summary, setSummary] = useState({ upcomingCount: 0, inProgressCount: 0 });
  useEffect(() => {
    void groupDetailApi.getDeletionSummary(groupId).then(setSummary);
  }, [groupId]);

  return (
    <div className = {styles.memberManagementModal}>
      <div className = {styles.removalSummary}>
        <AlertTriangle />
        <div><strong>모임을 영구 삭제합니다.</strong><span>삭제 후에는 모든 멤버가 이 모임에 접근할 수 없으며 되돌릴 수 없습니다.</span></div>
      </div>
      <div className = {styles.groupDeletionScheduleWarning}>
        <div><CalendarDays /><span><strong>확인이 필요한 일정</strong><small>예정 일정 {summary.upcomingCount}개 · 진행 중 일정 {summary.inProgressCount}개</small></span></div>
        <p>참여 중인 멤버에게 안내한 뒤 일정을 취소하거나 종료 처리했는지 확인해주세요.</p>
      </div>
      <div className = {styles.ownershipChanges}>
        <strong>삭제 후 처리되는 내용</strong>
        <span><Check /> 모임 상세, 게시판, 멤버 목록 및 가입 링크에 접근할 수 없습니다.</span>
        <span><Check /> 기존 운동 일정, 경기 결과와 개인 MMR 기록은 보존됩니다.</span>
        <span><Check /> 삭제 작업은 운영 기록에 작업자와 처리 시각이 남습니다.</span>
      </div>
      <label className = {styles.modalField}>
        <span>삭제를 계속하려면 <strong>{groupName}</strong> 입력</span>
        <Input value = {confirmation} onChange = {event => setConfirmation(event.target.value)} className = {styles.input} placeholder = {groupName} autoComplete = "off" />
      </label>
      <div className = {styles.modalActions}>
        <Button variant = "outline" className = {styles.roundButton} onClick = {onClose}>취소</Button>
        <Button variant = "destructive" disabled = {confirmation !== groupName} className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {() => void groupDetailApi.deleteGroup(groupId).then(onDeleted)}><Trash2 /> 모임 영구 삭제</Button>
      </div>
    </div>
  );
}

function WritePostModal({ groupId, canManage, attachmentAllowed, onComplete }: { groupId: number; canManage: boolean; attachmentAllowed: boolean; onComplete: (message: string) => void }) {
  const [type, setType] = useState('자유 게시판');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [pinned, setPinned] = useState(false);
  const submit = async () => {
    const attachments = files.length > 0 ? await groupDetailApi.uploadPostAttachments(groupId, files) : [];
    await groupDetailApi.createPost(groupId, { type: type === '공지사항' ? 'NOTICE' : 'FREE', title: title.trim(), content: content.trim(), pinned, attachmentNames: attachments.map(file => `${file.name}|${file.url}`).join(',') || null });
    onComplete('');
  };

  return (
    <div className = {styles.writePostModalContent}>
      <div className = {styles.filterGroup}>
        {(canManage ? ['공지사항', '자유 게시판'] : ['자유 게시판']).map(item => <button key = {item} type = "button" className = {styles.filterButton(type === item)} onClick = {() => setType(item)}>{item}</button>)}
      </div>
      {canManage && <button type = "button" className = {styles.postPinOption(pinned)} aria-pressed = {pinned} onClick = {() => setPinned(current => !current)}><span><Pin /><span><strong>상단 고정 게시물</strong><small>중요한 게시글을 게시판 목록 상단에 고정합니다.</small></span></span><span>{pinned && <Check />} {pinned ? '고정함' : '고정 안 함'}</span></button>}
      <label className = {styles.modalField}><span>제목</span><Input value = {title} onChange = {event => setTitle(event.target.value)} className = {styles.input} placeholder = "게시글 제목을 입력하세요" /></label>
      <label className = {styles.modalField}><span>내용</span><textarea value = {content} onChange = {event => setContent(event.target.value)} className = {styles.modalTextarea} placeholder = "게시글 내용을 입력하세요" /></label>
      {attachmentAllowed && <label className = {styles.postFileUpload}>
        <span><Paperclip /> 파일 첨부</span>
        <Input type = "file" multiple onChange = {event => setFiles(Array.from(event.target.files ?? []))} />
        {files.length > 0 ? <ul className = {styles.postFileList}>{files.map(file => <li key = {`${file.name}-${file.lastModified}`}><Paperclip /> {file.name}</li>)}</ul> : <small>게시글에 필요한 이미지나 문서를 첨부할 수 있습니다.</small>}
      </label>}
      <div className = {styles.modalActions}><Button disabled = {!title.trim() || !content.trim()} className = {styles.roundButton} onClick = {() => void submit()}><Check /> 게시글 등록</Button></div>
    </div>
  );
}

function ParticipantsModal({ groupId, schedule, canManage, onEditGuest }: { groupId: number; schedule?: typeof schedules[number]; canManage: boolean; onEditGuest: (guest: GroupParticipantResponse) => void }) {
  const [filter, setFilter] = useState<VoteStatus>('JOIN');
  const [participantSamples, setParticipantSamples] = useState<Array<GroupParticipantResponse & { status: VoteStatus }>>([]);
  const loadParticipants = useCallback(() => {
    if (!schedule) return;
    return Promise.all([
      groupDetailApi.getParticipants(groupId, schedule.id, 'ATTENDING'),
      groupDetailApi.getParticipants(groupId, schedule.id, 'UNDECIDED'),
      groupDetailApi.getParticipants(groupId, schedule.id, 'ABSENT'),
    ]).then(([attending, undecided, absent]) => setParticipantSamples([
      ...attending.map(item => ({ ...item, status: 'JOIN' as VoteStatus })),
      ...undecided.map(item => ({ ...item, status: 'UNDECIDED' as VoteStatus })),
      ...absent.map(item => ({ ...item, status: 'ABSENT' as VoteStatus })),
    ]));
  }, [groupId, schedule]);
  useEffect(() => { void loadParticipants(); }, [loadParticipants]);
  if (!schedule) return null;
  const filteredParticipants = participantSamples.filter(participant => participant.status === filter);
  const statusCounts = {
    JOIN: participantSamples.filter(participant => participant.status === 'JOIN').length,
    UNDECIDED: participantSamples.filter(participant => participant.status === 'UNDECIDED').length,
    ABSENT: participantSamples.filter(participant => participant.status === 'ABSENT').length,
  };

  return (
    <div className = {styles.participantsModalContent}>
      <div className = {styles.participantSummary}>
        <div><Users /><span><strong>{participantSamples.length}명</strong>참여 투표 현황</span></div>
        <div className = {styles.participantSummaryStats}>
          {(['JOIN', 'UNDECIDED', 'ABSENT'] as VoteStatus[]).map(status => <button key = {status} type = "button" className = {styles.participantFilter(filter === status)} onClick = {() => setFilter(status)}><strong>{statusCounts[status]}</strong>{getVoteLabel(status)}</button>)}
        </div>
      </div>
      <div className = {styles.participantSectionTitle}><strong>{getVoteLabel(filter)} 응답</strong><span>{filteredParticipants.length}명</span></div>
      <div className = {styles.participantList}>
        {filteredParticipants.map(participant => <div key = {`${participant.guest ? 'guest' : 'member'}-${participant.id}`} className = {styles.participantCard}>{participant.profileImageUrl ? <img src = {participant.profileImageUrl} alt = {`${participant.name} 프로필`} className = {styles.participantProfileImage} onError = {event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling?.removeAttribute('hidden'); }} /> : null}<div hidden = {!!participant.profileImageUrl} className = {participant.guest ? styles.guestAvatar : styles.participantAvatar}>{participant.name[0]}</div><span><strong>{participant.name}</strong><small>{formatGender(participant.gender)} · {formatAgeGroup(participant.ageGroup)} · {participant.grade}</small></span><div className = {styles.participantBadges}>{participant.guest && canManage && <><Button variant = "ghost" size = "icon" className = {styles.iconButton} aria-label = "게스트 정보 수정" onClick = {() => onEditGuest(participant)}><Edit3 /></Button><Button variant = "ghost" size = "icon" className = {styles.iconButton} aria-label = "게스트 삭제" onClick = {() => schedule && void groupDetailApi.deleteGuest(groupId, schedule.id, participant.id).then(loadParticipants)}><Trash2 /></Button></>}<Badge variant = "outline" className = {participant.guest ? styles.guestBadge : styles.participantRoleBadge}>{participant.guest ? '게스트' : participant.role === 'OWNER' ? '소유자' : participant.role === 'MANAGER' ? '매니저' : '멤버'}</Badge><Badge className = {styles.statusBadge(filter)}>{getVoteLabel(filter)}</Badge></div></div>)}
      </div>
    </div>
  );
}

function AddGuestModal({ groupId, sessionId, guest, onComplete }: { groupId: number; sessionId: number; guest?: GroupParticipantResponse; onComplete: (message: string) => void }) {
  const genderLabel = guest?.gender === 'MALE' || guest?.gender === '남성' ? '남성' : guest?.gender === 'FEMALE' || guest?.gender === '여성' ? '여성' : '';
  const ageLabel = ({ TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_AND_ABOVE: '60대 이상' } as Record<string, string>)[guest?.ageGroup ?? ''] || guest?.ageGroup || '';
  const [name, setName] = useState(guest?.name ?? '');
  const [gender, setGender] = useState(genderLabel);
  const [age, setAge] = useState(ageLabel);
  const [grade, setGrade] = useState(guest?.grade ?? '');
  const submit = () => {
    const body = {
      name: name.trim(),
      gender: gender === '남성' ? 'MALE' : 'FEMALE',
      ageGroup: ({ '10대': 'TEENS', '20대': 'TWENTIES', '30대': 'THIRTIES', '40대': 'FORTIES', '50대': 'FIFTIES', '60대 이상': 'SIXTIES_AND_ABOVE' } as Record<string, string>)[age],
      grade,
    };
    return guest
      ? groupDetailApi.updateGuest(groupId, sessionId, guest.id, body).then(() => onComplete(''))
      : groupDetailApi.addGuest(groupId, sessionId, body).then(() => onComplete(''));
  };
  return (
    <div className = {styles.secondaryScheduleModalContent}>
      <label className = {styles.modalField}><span>게스트 이름</span><Input value = {name} onChange = {event => setName(event.target.value)} className = {styles.input} placeholder = "이름을 입력하세요" /></label>
      <label className = {styles.modalField}><span>성별</span><Select value = {gender} onValueChange = {setGender}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "성별을 선택하세요" /></SelectTrigger><SelectContent><SelectItem className = {styles.guestSelectItem} value = "남성">남성</SelectItem><SelectItem className = {styles.guestSelectItem} value = "여성">여성</SelectItem></SelectContent></Select></label>
      <label className = {styles.modalField}><span>연령대</span><Select value = {age} onValueChange = {setAge}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "연령대를 선택하세요" /></SelectTrigger><SelectContent>{['10대', '20대', '30대', '40대', '50대', '60대 이상'].map(item => <SelectItem className = {styles.guestSelectItem} key = {item} value = {item}>{item}</SelectItem>)}</SelectContent></Select></label>
      <label className = {styles.modalField}><span>급수</span><Select value = {grade} onValueChange = {setGrade}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "급수를 선택하세요" /></SelectTrigger><SelectContent>{['E', 'D', 'C', 'B', 'A', 'S', 'SS'].map(item => <SelectItem className = {styles.guestSelectItem} key = {item} value = {item}>{item}</SelectItem>)}</SelectContent></Select></label>
      <div className = {styles.modalActions}><Button disabled = {!name.trim() || !gender || !age || !grade} className = {styles.roundButton} onClick = {() => void submit()}>{guest ? <Edit3 /> : <Plus />} {guest ? '게스트 정보 저장' : '게스트 추가'}</Button></div>
    </div>
  );
}

function ManageScheduleModal({ groupId, schedule, onComplete }: { groupId: number; schedule?: typeof schedules[number]; onComplete: (message: string) => void }) {
  const [title, setTitle] = useState(schedule?.title ?? '');
  const [startTime, setStartTime] = useState(schedule?.time.split(' - ')[0] ?? '');
  const [endTime, setEndTime] = useState(schedule?.time.split(' - ')[1] ?? '');
  const [place, setPlace] = useState(schedule?.place ?? '');
  const [deadline, setDeadline] = useState('');
  if (!schedule) return null;
  const save = () => groupDetailApi.updateSession(groupId, schedule.id, {
    title: title.trim(),
    startsAt: `${schedule.date}T${startTime}`,
    endsAt: endTime ? `${schedule.date}T${endTime}` : null,
    place: place.trim(),
    voteDeadline: deadline || null,
  }).then(() => onComplete(''));
  return (
    <div className = {styles.secondaryScheduleModalContent}>
      <label className = {styles.modalField}><span>일정명</span><Input value = {title} onChange = {event => setTitle(event.target.value)} className = {styles.input} /></label>
      <label className = {styles.modalField}><span>시간</span><div className = {styles.timeFieldRow}><Input type = "time" value = {startTime} onChange = {event => setStartTime(event.target.value)} className = {styles.input} /><Input type = "time" value = {endTime} onChange = {event => setEndTime(event.target.value)} className = {styles.input} /></div></label>
      <label className = {styles.modalField}><span>장소</span><Input value = {place} onChange = {event => setPlace(event.target.value)} className = {styles.input} /></label>
      <label className = {styles.modalField}><span>투표 마감</span><Input type = "datetime-local" value = {deadline} onChange = {event => setDeadline(event.target.value)} className = {styles.input} /></label>
      <div className = {styles.modalActions}><Button variant = "outline" className = {styles.dangerTextButton} onClick = {() => void groupDetailApi.deleteSession(groupId, schedule.id).then(() => onComplete(''))}><Trash2 /> 일정 삭제</Button><Button variant = "outline" className = {styles.dangerTextButton} onClick = {() => void groupDetailApi.cancelSession(groupId, schedule.id).then(() => onComplete(''))}>일정 취소</Button><Button className = {styles.roundButton} onClick = {() => void save()}><Check /> 저장</Button></div>
    </div>
  );
}

function SettingSwitch({ title, description, checked, onCheckedChange, switchClassName, disabled = false }: { title: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void; switchClassName?: string; disabled?: boolean }) {
  return <button type = "button" disabled = {disabled} aria-pressed = {checked} className = {`${styles.permissionOption(checked)} ${switchClassName ?? ''}`} onClick = {() => onCheckedChange(!checked)}><span><strong>{title}</strong><small>{description}</small></span><span>{checked && <Check />}{checked ? '허용' : '허용 안 함'}</span></button>;
}

function getScheduleStatusLabel(status: ScheduleStatus) {
  return { VOTING: '참여 투표 중', TODAY: '오늘 진행', IN_PROGRESS: '진행 중', COMPLETED: '종료', CANCELLED: '취소' }[status];
}

function getVoteLabel(status: VoteStatus) {
  return { JOIN: '참여', UNDECIDED: '미정', ABSENT: '불참' }[status];
}

function formatGender(gender: string) {
  return ({ MALE: '남성', FEMALE: '여성' } as Record<string, string>)[gender] || gender || '미설정';
}

function formatAgeGroup(ageGroup: string) {
  return ({ TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대', SIXTIES_AND_ABOVE: '60대 이상' } as Record<string, string>)[ageGroup] || ageGroup || '미설정';
}

function canChangeVoteForSchedule(schedule: typeof schedules[number] | undefined, sameDayAllowed: boolean, postDeadlineAllowed: boolean) {
  if (!schedule) return false;
  if (schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED' || schedule.status === 'IN_PROGRESS') return false;
  if (schedule.status === 'TODAY') return sameDayAllowed;
  return schedule.status === 'VOTING' || postDeadlineAllowed;
}

function formatRequestTime(requestedAt: string) {
  const [datePart, timePart = '00:00:00'] = requestedAt.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);
  const requestedDate = new Date(year, month - 1, day, hour, minute, second);

  if (Number.isNaN(requestedDate.getTime())) return requestedAt;

  const now = new Date();
  const requestedTime = requestedDate.getTime();
  const elapsedMilliseconds = Math.max(0, now.getTime() - requestedTime);
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);
  const elapsedHours = Math.floor(elapsedMilliseconds / 3600000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfRequestedDay = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate()).getTime();
  const elapsedDays = Math.floor((startOfToday - startOfRequestedDay) / 86400000);

  if (elapsedMinutes < 1) return '방금 전';
  if (elapsedDays === 0 && elapsedHours < 1) return `${elapsedMinutes}분 전`;
  if (elapsedDays === 0) return `${elapsedHours}시간 전`;
  if (elapsedDays === 1) return `어제 ${String(requestedDate.getHours()).padStart(2, '0')}:${String(requestedDate.getMinutes()).padStart(2, '0')}`;
  if (elapsedDays < 30) return `${elapsedDays}일 전`;

  return `${requestedDate.getFullYear()}.${String(requestedDate.getMonth() + 1).padStart(2, '0')}.${String(requestedDate.getDate()).padStart(2, '0')}`;
}

function getModalTitle(modal: Exclude<ModalState, null>, scheduleTitle?: string, postTitle?: string, memberName?: string) {
  if (modal.type === 'schedule') return scheduleTitle ?? '일정 상세';
  if (modal.type === 'post') return postTitle ?? '게시글 상세';
  if (modal.type === 'member') return `${memberName ?? '멤버'} 상세`;
  if (modal.type === 'memberPermissions') return '멤버 권한 변경';
  if (modal.type === 'ownershipTransfer') return '소유권 이전 확인';
  if (modal.type === 'memberRemoval') return '멤버 강제 탈퇴';
  if (modal.type === 'groupDeletion') return '모임 삭제';
  if (modal.type === 'writePost') return '게시글 작성';
  if (modal.type === 'participants') return '참가자 목록';
  if (modal.type === 'addGuest') return '게스트 추가';
  if (modal.type === 'editGuest') return '게스트 정보 수정';
  if (modal.type === 'manageSchedule') return '일정 관리';
  return modal.title;
}

function getActiveTab(pathname: string): TabKey {
  const lastSegment = pathname.split('/').filter(Boolean).at(-1);

  if (lastSegment === 'schedule') return 'schedule';
  if (lastSegment === 'board') return 'board';
  if (lastSegment === 'members') return 'members';
  if (lastSegment === 'requests') return 'requests';
  if (lastSegment === 'history') return 'history';
  if (lastSegment === 'settings') return 'settings';

  return 'home';
}
