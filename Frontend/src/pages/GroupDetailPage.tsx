import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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

const schedules = [
  { id: 1, title: '6월 정기 운동', date: '2026-06-14', time: '14:00 - 17:00', place: '강남구민회관 제2체육관', joined: 18, undecided: 3, absent: 5, guests: 2, courts: 4, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 7, title: '오전 초급자 운동', date: '2026-06-14', time: '08:00 - 10:00', place: '강남구민회관 제1체육관', joined: 10, undecided: 2, absent: 1, guests: 1, courts: 2, deadline: '6월 13일 18:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 8, title: '오전 복식 집중 운동', date: '2026-06-14', time: '10:00 - 12:00', place: '강남구민회관 제1체육관', joined: 12, undecided: 1, absent: 2, guests: 0, courts: 3, deadline: '6월 13일 18:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 9, title: '점심 자유 운동', date: '2026-06-14', time: '12:00 - 14:00', place: '강남구민회관 제2체육관', joined: 8, undecided: 3, absent: 1, guests: 2, courts: 2, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 10, title: '오후 A·B급 운동', date: '2026-06-14', time: '15:00 - 17:00', place: '강남구민회관 제3체육관', joined: 16, undecided: 2, absent: 3, guests: 1, courts: 4, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 11, title: '혼복 로테이션 운동', date: '2026-06-14', time: '17:00 - 19:00', place: '강남구민회관 제2체육관', joined: 14, undecided: 2, absent: 2, guests: 2, courts: 3, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 12, title: '저녁 정기 운동', date: '2026-06-14', time: '18:00 - 20:00', place: '강남구민회관 제1체육관', joined: 20, undecided: 1, absent: 4, guests: 1, courts: 4, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 13, title: '저녁 중급자 운동', date: '2026-06-14', time: '19:00 - 21:00', place: '강남구민회관 제3체육관', joined: 15, undecided: 4, absent: 2, guests: 0, courts: 3, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 14, title: '야간 자유 운동', date: '2026-06-14', time: '20:00 - 22:00', place: '강남구민회관 제2체육관', joined: 11, undecided: 2, absent: 3, guests: 1, courts: 3, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 15, title: '야간 상급자 운동', date: '2026-06-14', time: '21:00 - 23:00', place: '강남구민회관 제1체육관', joined: 9, undecided: 1, absent: 1, guests: 0, courts: 2, deadline: '6월 13일 20:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 2, title: '평일 저녁 번개', date: '2026-06-18', time: '19:30 - 22:00', place: '역삼 배드민턴장', joined: 12, undecided: 2, absent: 4, guests: 1, courts: 3, deadline: '6월 17일 18:00', status: 'VOTING' as ScheduleStatus, matches: 0 },
  { id: 3, title: '6월 첫째 주 정기 운동', date: '2026-06-07', time: '14:00 - 17:00', place: '강남구민회관 제2체육관', joined: 20, undecided: 0, absent: 4, guests: 2, courts: 4, deadline: '6월 6일 20:00', status: 'COMPLETED' as ScheduleStatus, matches: 17 },
  { id: 4, title: '5월 마지막 정기 운동', date: '2026-05-31', time: '14:00 - 17:00', place: '강남구민회관 제2체육관', joined: 22, undecided: 0, absent: 2, guests: 1, courts: 4, deadline: '5월 30일 20:00', status: 'COMPLETED' as ScheduleStatus, matches: 19 },
  { id: 5, title: '5월 평일 저녁 운동', date: '2026-05-28', time: '19:30 - 22:00', place: '역삼 배드민턴장', joined: 14, undecided: 0, absent: 2, guests: 0, courts: 3, deadline: '5월 27일 18:00', status: 'COMPLETED' as ScheduleStatus, matches: 11 },
  { id: 6, title: '우천 취소 운동', date: '2026-06-21', time: '14:00 - 17:00', place: '강남구민회관 야외 코트', joined: 0, undecided: 0, absent: 0, guests: 0, courts: 3, deadline: '6월 20일 20:00', status: 'CANCELLED' as ScheduleStatus, matches: 0 },
];

const members = [
  { id: 1, name: '노우현', gender: '남성', age: '20대', grade: 'B급', role: '소유자', participation: 28, recent: 4, rate: 92, matches: 4.8, winRate: 61, doublesMmr: 1420, mixedMmr: 1390, lastJoined: '2026.06.07', streak: 7, absenceRate: 8 },
  { id: 2, name: '박지영', gender: '여성', age: '20대', grade: 'A급', role: '매니저', participation: 24, recent: 4, rate: 88, matches: 4.5, winRate: 63, doublesMmr: 1510, mixedMmr: 1540, lastJoined: '2026.06.07', streak: 5, absenceRate: 12 },
  { id: 3, name: '김민수', gender: '남성', age: '30대', grade: 'B급', role: '멤버', participation: 22, recent: 3, rate: 76, matches: 4.2, winRate: 58, doublesMmr: 1380, mixedMmr: 1360, lastJoined: '2026.06.07', streak: 3, absenceRate: 18 },
  { id: 4, name: '최서연', gender: '여성', age: '30대', grade: 'B급', role: '멤버', participation: 19, recent: 3, rate: 71, matches: 4.1, winRate: 54, doublesMmr: 1350, mixedMmr: 1410, lastJoined: '2026.05.31', streak: 2, absenceRate: 21 },
  { id: 5, name: '이준호', gender: '남성', age: '40대', grade: 'D급', role: '멤버', participation: 12, recent: 2, rate: 55, matches: 3.8, winRate: 43, doublesMmr: 1080, mixedMmr: 1060, lastJoined: '2026.05.28', streak: 1, absenceRate: 32 },
  { id: 6, name: '강수진', gender: '여성', age: '20대', grade: 'C급', role: '멤버', participation: 15, recent: 3, rate: 68, matches: 4.0, winRate: 49, doublesMmr: 1240, mixedMmr: 1270, lastJoined: '2026.06.07', streak: 4, absenceRate: 16 },
  ...[
    ['정하늘', '여성', '20대', 'C급'], ['오세진', '남성', '30대', 'A급'], ['문예린', '여성', '30대', 'B급'],
    ['장현우', '남성', '40대', 'D급'], ['김서우', '여성', '20대', 'C급'], ['윤채원', '여성', '20대', 'D급'],
    ['이도윤', '남성', '30대', 'B급'], ['한지민', '여성', '40대', 'C급'], ['송민재', '남성', '50대', 'E급'],
  ].map(([name, gender, age, grade], index) => ({
    id: index + 7, name, gender, age, grade, role: '멤버', participation: 10 + index, recent: 1 + index % 4,
    rate: 52 + index * 4, matches: Number((3.4 + index * 0.15).toFixed(1)), winRate: 42 + index * 3,
    doublesMmr: 1100 + index * 35, mixedMmr: 1080 + index * 38, lastJoined: `2026.06.${String(7 - index % 5).padStart(2, '0')}`,
    streak: 1 + index % 5, absenceRate: 28 - index * 2,
  })),
];

const posts = [
  { id: 1, type: '공지사항', pinned: true, title: '6월 정기 운동 운영 안내', author: '노우현', date: '2026.06.10', views: 48, comments: 5, content: '6월 정기 운동은 강남구민회관 제2체육관에서 진행합니다. 참여 투표 마감 시간을 꼭 확인해주세요.' },
  { id: 2, type: '공지사항', pinned: true, title: '게스트 참여 및 준비물 안내', author: '박지영', date: '2026.06.08', views: 36, comments: 2, content: '게스트 참여자는 개인 라켓과 실내 운동화를 준비해주세요.' },
  { id: 3, type: '자유 게시판', pinned: false, title: '지난주 운동 사진 공유합니다', author: '김민수', date: '2026.06.07', views: 27, comments: 8, content: '지난주 운동 사진을 정리해서 공유합니다. 모두 고생 많으셨습니다!' },
  { id: 4, type: '자유 게시판', pinned: false, title: '복식 로테이션 연습 같이 하실 분', author: '최서연', date: '2026.06.05', views: 21, comments: 4, content: '정기 운동 시작 전에 30분 정도 복식 로테이션 연습하실 분 댓글 남겨주세요.' },
  ...Array.from({ length: 16 }, (_, index) => ({
    id: index + 5,
    type: index % 5 === 0 ? '공지사항' : '자유 게시판',
    pinned: false,
    title: index % 5 === 0 ? `${index + 1}차 모임 운영 안내` : `${index + 1}번째 자유 게시글입니다`,
    author: ['노우현', '박지영', '김민수', '최서연'][index % 4],
    date: `2026.05.${String(30 - index).padStart(2, '0')}`,
    views: 18 + index * 3,
    comments: index % 9,
    content: '게시판 목록과 페이지네이션 동작을 확인하기 위한 테스트 게시글 내용입니다.',
  })),
];

const joinRequests = [
  { id: 1, name: '한지우', gender: '남성', age: '20대', grade: 'A급', requestedAt: '2026-06-13T13:20:00', message: '강남에서 꾸준히 운동할 모임을 찾고 있습니다.' },
  { id: 2, name: '윤서아', gender: '여성', age: '30대', grade: 'D급', requestedAt: '2026-06-12T19:40:00', message: '배드민턴을 시작한 지 1년 정도 되었습니다.' },
  { id: 3, name: '김도윤', gender: '남성', age: '30대', grade: 'B급', requestedAt: '2026-06-11T09:15:00', message: '주말 정기 운동에 꾸준히 참여하고 싶어 가입을 요청합니다.' },
  { id: 4, name: '이하린', gender: '여성', age: '20대', grade: 'C급', requestedAt: '2026-06-08T18:30:00', message: '복식 경기 경험을 쌓고 즐겁게 운동하고 싶습니다.' },
  { id: 5, name: '박준호', gender: '남성', age: '40대', grade: 'A급', requestedAt: '2026-06-03T11:05:00', message: '강남구 인근에서 활동 중이며 정기적으로 참여 가능합니다.' },
  { id: 6, name: '최유나', gender: '여성', age: '30대', grade: 'B급', requestedAt: '2026-05-29T16:45:00', message: '기초부터 다시 배우며 꾸준하게 운동하고 싶습니다.' },
  { id: 7, name: '정민재', gender: '남성', age: '20대', grade: 'C급', requestedAt: '2026-05-20T20:10:00', message: '평일 저녁과 주말 모두 참여할 수 있습니다.' },
  { id: 8, name: '오수빈', gender: '여성', age: '40대', grade: 'D급', requestedAt: '2026-05-11T14:25:00', message: '오랜만에 배드민턴을 다시 시작하려고 합니다.' },
  { id: 9, name: '강현우', gender: '남성', age: '30대', grade: 'S급', requestedAt: '2026-04-27T08:50:00', message: '다양한 급수의 멤버들과 즐겁게 경기하고 싶습니다.' },
  { id: 10, name: '송지민', gender: '여성', age: '20대', grade: 'B급', requestedAt: '2026-04-10T17:35:00', message: '친목과 실력 향상을 함께할 모임을 찾고 있습니다.' },
  { id: 11, name: '임태성', gender: '남성', age: '50대', grade: 'C급', requestedAt: '2026-03-18T12:00:00', message: '정기 운동 일정에 성실하게 참여하겠습니다.' },
  { id: 12, name: '문채원', gender: '여성', age: '30대', grade: 'A급', requestedAt: '2026-02-21T10:30:00', message: '새로운 분들과 복식 운동을 즐기고 싶습니다.' },
];

const operationHistory = [
  { id: 1, actor: '노우현', action: '6월 정기 운동 일정을 생성했습니다.', time: '오늘 11:24', icon: CalendarDays },
  { id: 2, actor: '박지영', action: '운영 안내를 수정했습니다.', time: '어제 20:12', icon: Edit3 },
  { id: 3, actor: '노우현', action: '박지영님을 매니저로 임명했습니다.', time: '2026.06.08 18:30', icon: UserRoundCog },
  { id: 4, actor: '박지영', action: '한지우님의 가입 요청을 확인했습니다.', time: '2026.06.08 14:22', icon: UserCheck },
  { id: 5, actor: '노우현', action: '모임 기본 정보를 변경했습니다.', time: '2026.06.02 09:15', icon: Settings },
  { id: 6, actor: '박지영', action: '게스트 참여 및 준비물 공지사항을 등록했습니다.', time: '2026.05.31 21:10', icon: MessageCircle },
  { id: 7, actor: '노우현', action: '5월 마지막 정기 운동 일정을 종료 처리했습니다.', time: '2026.05.31 18:45', icon: CalendarDays },
  { id: 8, actor: '박지영', action: '윤서아님의 가입 요청을 승인했습니다.', time: '2026.05.29 19:32', icon: UserCheck },
  { id: 9, actor: '노우현', action: '모임 대표 이미지를 변경했습니다.', time: '2026.05.27 10:14', icon: Settings },
  { id: 10, actor: '박지영', action: '5월 평일 저녁 운동 일정을 수정했습니다.', time: '2026.05.25 16:08', icon: Edit3 },
  { id: 11, actor: '노우현', action: '김민수님의 멤버 권한을 변경했습니다.', time: '2026.05.22 20:40', icon: UserRoundCog },
  { id: 12, actor: '박지영', action: '정민재님의 가입 요청을 거절했습니다.', time: '2026.05.20 21:05', icon: UserCheck },
  { id: 13, actor: '노우현', action: '모임 활동 지역을 서울특별시 강남구로 변경했습니다.', time: '2026.05.18 09:27', icon: Settings },
  { id: 14, actor: '박지영', action: '5월 주말 정기 운동 일정을 생성했습니다.', time: '2026.05.15 18:12', icon: CalendarDays },
  { id: 15, actor: '노우현', action: '운영 안내를 삭제했습니다.', time: '2026.05.12 13:35', icon: Edit3 },
  { id: 16, actor: '박지영', action: '오수빈님의 가입 요청을 승인했습니다.', time: '2026.05.11 15:02', icon: UserCheck },
  { id: 17, actor: '노우현', action: '신규 가입 방식을 승인 후 가입으로 변경했습니다.', time: '2026.05.08 11:48', icon: Settings },
  { id: 18, actor: '박지영', action: '봄맞이 친선 운동 공지사항을 등록했습니다.', time: '2026.05.05 20:16', icon: MessageCircle },
  { id: 19, actor: '노우현', action: '박지영님의 매니저 세부 권한을 변경했습니다.', time: '2026.05.03 14:50', icon: UserRoundCog },
  { id: 20, actor: '노우현', action: '5월 첫 정기 운동 일정을 생성했습니다.', time: '2026.05.01 09:30', icon: CalendarDays },
];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState('매주 정기 운동은 일요일 오후에 진행합니다. 참여 투표 마감 시간과 준비물을 확인해주세요.');
  const [noticeDraft, setNoticeDraft] = useState(notice);
  const [editingNotice, setEditingNotice] = useState(false);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>('UNDECIDED');
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(6);
  const [selectedDay, setSelectedDay] = useState(14);
  const [boardFilter, setBoardFilter] = useState('ALL');
  const [memberKeyword, setMemberKeyword] = useState('');
  const [memberRole, setMemberRole] = useState('ALL');
  const [memberGrade, setMemberGrade] = useState('ALL');
  const [requests, setRequests] = useState(joinRequests);
  const [newJoinAllowed, setNewJoinAllowed] = useState(true);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [guestAllowed, setGuestAllowed] = useState(true);
  const [sameDayVoteChangeAllowed, setSameDayVoteChangeAllowed] = useState(true);
  const [postDeadlineVoteChangeAllowed, setPostDeadlineVoteChangeAllowed] = useState(false);
  const [memberPostAllowed, setMemberPostAllowed] = useState(true);
  const [memberCommentAllowed, setMemberCommentAllowed] = useState(true);
  const [postAttachmentAllowed, setPostAttachmentAllowed] = useState(true);

  const [currentRole] = useState<GroupRole>('OWNER');
  const isOwner = currentRole === 'OWNER';
  const isManager = currentRole === 'MANAGER';
  const canManage = isOwner || isManager;
  const managerPermissions = {
    schedule: true,
    notice: true,
    requests: true,
    members: true,
    posts: true,
  };
  const canManageSchedule = isOwner || (isManager && managerPermissions.schedule);
  const canManageNotice = isOwner || (isManager && managerPermissions.notice);
  const canManageRequests = isOwner || (isManager && managerPermissions.requests);
  const canManageMembers = isOwner || (isManager && managerPermissions.members);
  const canManagePosts = isOwner || (isManager && managerPermissions.posts);
  const canWritePost = canManagePosts || memberPostAllowed;
  const canComment = canManagePosts || memberCommentAllowed;
  const activeTab = getActiveTab(location.pathname);

  const visibleTabs = tabs.filter(tab => {
    if (tab.ownerOnly && !isOwner) return false;
    if (tab.key === 'requests' && !canManageRequests) return false;
    if (tab.adminOnly && !canManage) return false;
    return true;
  });

  useEffect(() => {
    const hasPermission =
      (activeTab !== 'requests' || canManageRequests) &&
      (activeTab !== 'history' || canManage) &&
      (activeTab !== 'settings' || isOwner);

    if (!hasPermission) {
      navigate(`/groups/${groupId}`, { replace: true });
    }
  }, [activeTab, canManage, canManageRequests, groupId, isOwner, navigate]);

  const selectedSchedule = modal?.type === 'schedule'
    ? schedules.find(schedule => schedule.id === modal.id)
    : undefined;
  const selectedPost = modal?.type === 'post'
    ? posts.find(post => post.id === modal.id)
    : undefined;
  const selectedMember = modal?.type === 'member' || modal?.type === 'memberPermissions' || modal?.type === 'ownershipTransfer' || modal?.type === 'memberRemoval'
    ? members.find(member => member.id === modal.id)
    : undefined;

  const filteredPosts = posts.filter(post => boardFilter === 'ALL' || post.type === boardFilter);
  const filteredMembers = members.filter(member => {
    const matchesKeyword = member.name.includes(memberKeyword.trim());
    const matchesRole = memberRole === 'ALL' || member.role === memberRole;
    const matchesGrade = memberGrade === 'ALL' || member.grade === memberGrade;
    return matchesKeyword && matchesRole && matchesGrade;
  });

  const daySchedules = useMemo(
    () => schedules.filter(schedule => schedule.date === `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`),
    [calendarMonth, calendarYear, selectedDay],
  );

  const handleCopyGroupLink = async () => {
    await navigator.clipboard?.writeText(`${window.location.origin}/groups/${groupId}/join`);
  };

  const handleVote = (nextStatus: VoteStatus) => {
    setVoteStatus(nextStatus);
  };

  const handleScheduleTabSelection = (scheduleId: number) => {
    const schedule = schedules.find(item => item.id === scheduleId);
    if (!schedule) return;

    const today = new Date();
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (schedule.status === 'COMPLETED' || schedule.date < todayDate) {
      navigate(`/sessions/${schedule.id}/report`);
      return;
    }

    setModal({ type: 'schedule', id: schedule.id });
  };

  const handleRequest = (requestId: number) => {
    setRequests(current => current.filter(request => request.id !== requestId));
  };

  const handleAllRequests = () => {
    setRequests([]);
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
            <img src = "/shuttleplay-maskable-icon-512.png" alt = "강남 배드민턴 클럽" className = {styles.groupImage} />
            <div className = {styles.groupHeaderText}>
              <div className = {styles.titleRow}>
                <h1 className = {styles.title}>강남 배드민턴 클럽</h1>
                <Badge className = {styles.ownerBadge}><Crown /> 소유자</Badge>
              </div>
              <p className = {styles.groupDescription}>즐겁게 운동하면서 실력도 함께 키우는 강남 지역 정기 배드민턴 모임입니다.</p>
              <div className = {styles.groupMeta}>
                <span><MapPin /> 서울특별시 강남구</span>
                <span><Users /> 멤버 24명</span>
                <span><Crown /> 소유자 노우현</span>
                <span><Calendar /> 2026년 3월 12일 생성</span>
              </div>
            </div>
          </div>
          <div className = {styles.headerActions}>
            <Button variant = "outline" className = {styles.roundButton} onClick = {handleCopyGroupLink}>
              <Share2 /> 공유
            </Button>
            {!isOwner && (
              <Button variant = "ghost" className = {styles.leaveButton} onClick = {() => openConfirm('모임에서 탈퇴할까요?', '탈퇴 후에는 모임 상세와 게시판에 접근할 수 없습니다.', '모임 탈퇴', '모임에서 탈퇴했습니다.')}>
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
              notice = {notice}
              noticeDraft = {noticeDraft}
              editingNotice = {editingNotice}
              canManageNotice = {canManageNotice}
              canManageSchedule = {canManageSchedule}
              canChangeVote = {canChangeVoteForSchedule(schedules[0], sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed)}
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
              }}
              onDeleteNotice = {() => {
                setNotice('');
                setNoticeDraft('');
                setEditingNotice(false);
              }}
              onVote = {handleVote}
              onOpenSchedule = {id => setModal({ type: 'schedule', id })}
              onCreateSchedule = {() => navigate(`/groups/${groupId}/create-session`)}
              onNavigateReport = {id => navigate(`/sessions/${id}/report`)}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              year = {calendarYear}
              month = {calendarMonth}
              selectedDay = {selectedDay}
              daySchedules = {daySchedules}
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
              posts = {filteredPosts}
              canManage = {canManagePosts}
              canWrite = {canWritePost}
              onFilter = {setBoardFilter}
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
              onOpenMember = {id => setModal({ type: 'member', id })}
            />
          )}

          {activeTab === 'requests' && canManageRequests && (
            <RequestsTab requests = {requests} onRequest = {handleRequest} onAllRequests = {handleAllRequests} />
          )}

          {activeTab === 'history' && canManage && <HistoryTab />}

          {activeTab === 'settings' && isOwner && (
            <SettingsTab
              isOwner = {isOwner}
              newJoinAllowed = {newJoinAllowed}
              approvalRequired = {approvalRequired}
              guestAllowed = {guestAllowed}
              onNewJoinAllowed = {setNewJoinAllowed}
              onApprovalRequired = {setApprovalRequired}
              onGuestAllowed = {setGuestAllowed}
              sameDayVoteChangeAllowed = {sameDayVoteChangeAllowed}
              postDeadlineVoteChangeAllowed = {postDeadlineVoteChangeAllowed}
              memberPostAllowed = {memberPostAllowed}
              memberCommentAllowed = {memberCommentAllowed}
              postAttachmentAllowed = {postAttachmentAllowed}
              onSameDayVoteChangeAllowed = {setSameDayVoteChangeAllowed}
              onPostDeadlineVoteChangeAllowed = {setPostDeadlineVoteChangeAllowed}
              onMemberPostAllowed = {setMemberPostAllowed}
              onMemberCommentAllowed = {setMemberCommentAllowed}
              onPostAttachmentAllowed = {setPostAttachmentAllowed}
              onOpenGroupDeletion = {() => setModal({ type: 'groupDeletion' })}
              onConfirm = {openConfirm}
            />
          )}
        </main>
      </div>

      {modal && (
        <Modal title = {getModalTitle(modal, selectedSchedule?.title, selectedPost?.title, selectedMember?.name)} onClose = {() => setModal(null)} onBack = {modal.type === 'participants' || modal.type === 'addGuest' || modal.type === 'manageSchedule' ? () => setModal({ type: 'schedule', id: modal.id }) : modal.type === 'memberPermissions' || modal.type === 'ownershipTransfer' || modal.type === 'memberRemoval' ? () => setModal({ type: 'member', id: modal.id }) : undefined} centeredHeader = {modal.type === 'schedule' || modal.type === 'post' || modal.type === 'writePost' || modal.type === 'member' || modal.type === 'groupDeletion'} fixedScheduleSize = {modal.type === 'schedule' || modal.type === 'post' || modal.type === 'participants' || modal.type === 'addGuest' || modal.type === 'manageSchedule' || modal.type === 'writePost' || modal.type === 'member' || modal.type === 'memberPermissions' || modal.type === 'ownershipTransfer' || modal.type === 'memberRemoval' || modal.type === 'groupDeletion'}>
          {selectedSchedule && (
            <ScheduleModal schedule = {selectedSchedule} voteStatus = {voteStatus} canManage = {canManageSchedule} canAddGuest = {canManageSchedule && guestAllowed} canChangeVote = {canChangeVoteForSchedule(selectedSchedule, sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed)} onVote = {handleVote} onOpenParticipants = {id => setModal({ type: 'participants', id })} onAddGuest = {id => setModal({ type: 'addGuest', id })} onManage = {id => setModal({ type: 'manageSchedule', id })} />
          )}
          {selectedPost && <PostModal post = {selectedPost} canManage = {canManagePosts} canComment = {canComment} />}
          {modal.type === 'member' && selectedMember && (
            <MemberModal
              member = {selectedMember}
              isOwner = {isOwner}
              canManage = {canManageMembers}
              onConfirm = {openConfirm}
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
          {modal.type === 'writePost' && canWritePost && <WritePostModal canManage = {canManagePosts} attachmentAllowed = {postAttachmentAllowed} onComplete = {() => setModal(null)} />}
          {modal.type === 'participants' && <ParticipantsModal schedule = {schedules.find(schedule => schedule.id === modal.id)} />}
          {modal.type === 'addGuest' && <AddGuestModal onComplete = {() => setModal(null)} />}
          {modal.type === 'manageSchedule' && <ManageScheduleModal schedule = {schedules.find(schedule => schedule.id === modal.id)} onComplete = {() => setModal(null)} />}
          {modal.type === 'memberPermissions' && selectedMember && <MemberPermissionsModal member = {selectedMember} onComplete = {() => setModal(null)} />}
          {modal.type === 'ownershipTransfer' && selectedMember && <OwnershipTransferModal member = {selectedMember} onComplete = {() => setModal(null)} />}
          {modal.type === 'memberRemoval' && selectedMember && <MemberRemovalModal member = {selectedMember} onComplete = {() => setModal(null)} />}
          {modal.type === 'groupDeletion' && <GroupDeletionModal onClose = {() => setModal(null)} />}
        </Modal>
      )}

    </div>
  );
}

function HomeTab({
  notice, noticeDraft, editingNotice, canManageNotice, canManageSchedule, canChangeVote, voteStatus, onNoticeDraftChange, onEditNotice,
  onCancelNotice, onSaveNotice, onDeleteNotice, onVote, onOpenSchedule,
  onCreateSchedule, onNavigateReport,
}: {
  notice: string;
  noticeDraft: string;
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
  const upcoming = schedules.find(schedule => schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED');
  const recent = schedules.filter(schedule => schedule.status === 'COMPLETED').slice(0, 3);
  const participationTrend = [2, 35, 5, 72];
  const maxParticipation = Math.max(...participationTrend);
  const averageParticipation = Math.round(participationTrend.reduce((sum, value) => sum + value, 0) / participationTrend.length);
  const summaries = [
    ['최근 4주 운동', '4회', CalendarDays],
    ['평균 참가 인원', '18명', Users],
    ['주요 활동 시간', '일요일 14시', Clock3],
    ['내 최근 참여', '4회', UserCheck],
    ['내 월간 참여율', '92%', Activity],
    ['평균 경기 수', '4.3경기', BarChart3],
    ['평균 복식 MMR', '1,336', ShieldCheck],
    ['평균 혼복 MMR', '1,348', ShieldCheck],
  ] as const;

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
            <span>마지막 수정 2026.06.11 20:12 · 박지영</span>
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
                <div className = {styles.scheduleDateBox}><strong>14</strong><span>6월 · 일</span></div>
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
              {recent.map(schedule => (
                <button key = {schedule.id} type = "button" className = {styles.recentRow} onClick = {() => onNavigateReport(schedule.id)}>
                  <div className = {styles.listIconBox}><Calendar /></div>
                  <div className = {styles.listMain}>
                    <strong>{schedule.title}</strong>
                    <span>{schedule.date.replaceAll('-', '.')} · {schedule.time}</span>
                  </div>
                  <span className = {styles.listMetric}>{schedule.joined}명</span>
                  <span className = {styles.listMetric}>{schedule.matches}경기</span>
                  <ChevronRight className = {styles.smallIcon} />
                </button>
              ))}
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
              <div className = {styles.chartHeader}><div><strong>급수 분포</strong><span>활성 멤버 24명 기준</span></div></div>
            {[['SS급', 0, 0], ['S급', 1, 4], ['A급', 4, 17], ['B급', 9, 38], ['C급', 6, 25], ['D급', 4, 17], ['E급', 0, 0]].map(([label, count, percent]) => (
                <div key = {label}>
                  <span>{label}</span>
                  <i><b style = {{ width: `${percent}%` }} /></i>
                  <em>{count}명</em>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function ScheduleTab({ year, month, selectedDay, daySchedules, canManage, onSelectDay, onChangeMonth, onOpenSchedule, onCreateSchedule }: {
  year: number;
  month: number;
  selectedDay: number;
  daySchedules: typeof schedules;
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
  const monthSchedules = schedules.filter(schedule => schedule.date.startsWith(monthPrefix));
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
            <span><strong>{monthSchedules.filter(schedule => getDisplayStatus(schedule) === 'VOTING').length}</strong>예정 일정</span>
            <span><strong>{monthSchedules.filter(schedule => getDisplayStatus(schedule) === 'COMPLETED').length}</strong>종료 일정</span>
            <span><strong>{monthSchedules.reduce((total, schedule) => total + schedule.joined, 0)}</strong>누적 참여</span>
          </section>
        </div>
      </Panel>
    </div>
  );
}

function BoardTab({ filter, posts: filteredPosts, canManage, canWrite, onFilter, onOpenPost, onWrite }: {
  filter: string;
  posts: typeof posts;
  canManage: boolean;
  canWrite: boolean;
  onFilter: (filter: string) => void;
  onOpenPost: (id: number) => void;
  onWrite: () => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "모임 게시판" description = "공지사항과 멤버들의 이야기를 확인하세요." icon = {MessageCircle} className = {styles.listTabPanel} bodyClassName = {styles.listTabBody}
        action = {canWrite ? <Button size = "sm" className = {styles.smallRoundButton} onClick = {onWrite}><Plus /> 글쓰기</Button> : null}
      >
        <div className = {styles.toolbar}>
          <div className = {styles.searchBox}><Search /><Input placeholder = "게시글 검색" className = {styles.searchInput} /></div>
          <div className = {styles.filterGroup}>
            {['ALL', '공지사항', '자유 게시판'].map(item => <button key = {item} type = "button" className = {styles.filterButton(filter === item)} onClick = {() => { onFilter(item); setPage(1); }}>{item === 'ALL' ? '전체' : item}</button>)}
          </div>
        </div>
        <div className = {styles.boardList}>
          {pagedPosts.map(post => (
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
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {setPage} />
    </div>
  );
}

function MembersTab({ members: filteredMembers, keyword, role, grade, canManage, isOwner, onKeyword, onRole, onGrade, onOpenMember }: {
  members: typeof members;
  keyword: string;
  role: string;
  grade: string;
  canManage: boolean;
  isOwner: boolean;
  onKeyword: (keyword: string) => void;
  onRole: (role: string) => void;
  onGrade: (grade: string) => void;
  onOpenMember: (id: number) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "전체 멤버" description = "프로필과 참여 통계를 확인하고 멤버를 관리하세요." icon = {Users} className = {styles.listTabPanel} bodyClassName = {styles.listTabBody}>
      <div className = {styles.toolbar}>
        <div className = {styles.searchBox}><Search /><Input value = {keyword} onChange = {event => { onKeyword(event.target.value); setPage(1); }} placeholder = "멤버 이름 검색" className = {styles.searchInput} /></div>
        <div className = {styles.memberFilters}>
          <div className = {styles.filterGroup}>
            {['ALL', '소유자', '매니저', '멤버'].map(item => <button key = {item} type = "button" className = {styles.filterButton(role === item)} onClick = {() => { onRole(item); setPage(1); }}>{item === 'ALL' ? '전체 권한' : item}</button>)}
          </div>
          <div className = {styles.filterGroup}>
            {['ALL', 'SS급', 'S급', 'A급', 'B급', 'C급', 'D급', 'E급'].map(item => <button key = {item} type = "button" className = {styles.filterButton(grade === item)} onClick = {() => { onGrade(item); setPage(1); }}>{item === 'ALL' ? '전체 급수' : item}</button>)}
          </div>
        </div>
      </div>
      <div className = {styles.memberGrid}>
        {pagedMembers.map(member => (
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
              <span><strong>{member.winRate}%</strong>승률</span>
            </div>
          </button>
        ))}
      </div>
      {filteredMembers.length === 0 && <EmptyState icon = {Users} title = "조건에 맞는 멤버가 없습니다." description = "검색어나 역할 필터를 변경해보세요." />}
      {canManage && <p className = {styles.permissionGuide}><LockKeyhole /><span>{isOwner ? '소유자는 매니저 임명, 소유권 이전, 멤버 강제 탈퇴를 관리할 수 있습니다.' : '매니저는 권한 범위 안에서 일반 멤버만 관리할 수 있습니다.'}</span></p>}
      </Panel>
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {setPage} />
    </div>
  );
}

function RequestsTab({ requests, onRequest, onAllRequests }: { requests: typeof joinRequests; onRequest: (id: number) => void; onAllRequests: () => void }) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRequests = requests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "가입 요청 관리" description = "승인 대기 중인 회원의 정보를 확인하세요." icon = {UserCheck} className = {styles.listTabPanel} action = {requests.length > 0 && <div className = {styles.requestBulkActions}><Button variant = "outline" className = {`${styles.smallRoundButton} ${styles.dangerTextButton}`} onClick = {onAllRequests}>전체 거절</Button><Button className = {styles.smallRoundButton} onClick = {onAllRequests}><Check /> 전체 승인</Button></div>}>
      {requests.length > 0 ? (
        <div className = {styles.requestList}>
          {pagedRequests.map(request => (
            <div key = {request.id} className = {styles.requestCard}>
              <div className = {styles.avatar}>{request.name[0]}</div>
              <div className = {styles.requestMain}>
                <div><strong>{request.name}</strong><span>{request.gender} · {request.age} · {request.grade}</span></div>
                <p>{request.message}</p>
                <span>{formatRequestTime(request.requestedAt)}</span>
              </div>
              <div className = {styles.requestActions}>
                <Button variant = "outline" className = {styles.smallRoundButton} onClick = {() => onRequest(request.id)}>거절</Button>
                <Button className = {styles.smallRoundButton} onClick = {() => onRequest(request.id)}><Check /> 승인</Button>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState icon = {UserCheck} title = "대기 중인 가입 요청이 없습니다." description = "새로운 가입 요청이 도착하면 이곳에서 확인할 수 있습니다." />}
      </Panel>
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {setPage} />
    </div>
  );
}

function HistoryTab() {
  const [page, setPage] = useState(1);
  const pageSize = 11;
  const totalPages = Math.max(1, Math.ceil(operationHistory.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedHistory = operationHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className = {styles.paginatedTab}>
      <Panel title = "운영 기록" description = "모임 운영에 영향을 준 변경 사항을 확인하세요." icon = {FileClock} className = {styles.listTabPanel}>
      <div className = {styles.historyList}>
        {pagedHistory.map(history => {
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
      <Pagination currentPage = {currentPage} totalPages = {totalPages} onPageChange = {setPage} />
    </div>
  );
}

function SettingsTab({ isOwner, newJoinAllowed, approvalRequired, guestAllowed, sameDayVoteChangeAllowed, postDeadlineVoteChangeAllowed, memberPostAllowed, memberCommentAllowed, postAttachmentAllowed, onNewJoinAllowed, onApprovalRequired, onGuestAllowed, onSameDayVoteChangeAllowed, onPostDeadlineVoteChangeAllowed, onMemberPostAllowed, onMemberCommentAllowed, onPostAttachmentAllowed, onOpenGroupDeletion, onConfirm }: {
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
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [groupImagePreview, setGroupImagePreview] = useState('/shuttleplay-maskable-icon-512.png');

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
                if (file) setGroupImagePreview(URL.createObjectURL(file));
              }}
            />
            <div><Button variant = "ghost" className = {styles.textButton} onClick = {() => imageInputRef.current?.click()}>이미지 변경</Button><Button variant = "ghost" className = {styles.dangerTextButton} onClick = {() => onConfirm('대표 이미지를 삭제할까요?', '삭제하면 기본 모임 이미지가 표시됩니다.', '이미지 삭제', '대표 이미지를 기본 이미지로 변경했습니다.', () => { setGroupImagePreview('/shuttleplay-maskable-icon-512.png'); if (imageInputRef.current) imageInputRef.current.value = ''; })}>삭제</Button></div>
          </div>
        </Panel>

        <Panel title = "기본 정보" description = "모임에 표시되는 정보를 인라인으로 수정합니다." icon = {Edit3}>
          <div className = {styles.settingsForm}>
            <label><span>모임명</span><Input defaultValue = "강남 배드민턴 클럽" className = {styles.input} /></label>
            <label><span>활동 지역</span><Input defaultValue = "서울특별시 강남구" className = {styles.input} /></label>
            <label><span>모임 설명</span><textarea defaultValue = "즐겁게 운동하면서 실력도 함께 키우는 강남 지역 정기 배드민턴 모임입니다." className = {styles.textarea} /></label>
            <Button className = {styles.saveButton}><Check /> 변경사항 저장</Button>
          </div>
        </Panel>

        <Panel title = "가입 및 참여 설정" description = "새로운 회원과 게스트의 참여 기준을 관리합니다." icon = {UserCheck}>
          <div className = {styles.switchList}>
            <SettingSwitch title = "신규 가입 허용" description = "로그인한 회원의 모임 가입 요청을 받습니다." checked = {newJoinAllowed} onCheckedChange = {onNewJoinAllowed} />
            <SettingSwitch title = "가입 승인 필요" description = "소유자 또는 권한 있는 매니저가 가입 요청을 승인합니다." checked = {approvalRequired} onCheckedChange = {onApprovalRequired} />
            <SettingSwitch title = "게스트 일정 참여 허용" description = "특정 운동 일정의 게스트 참여 링크 사용을 허용합니다." checked = {guestAllowed} onCheckedChange = {onGuestAllowed} />
          </div>
          <div className = {styles.settingsTwoColumns}>
            <label><span>기본 투표 마감</span><Select defaultValue = "24"><SelectTrigger className = {styles.selectTriggerWide}><SelectValue /></SelectTrigger><SelectContent><SelectItem value = "12">일정 12시간 전</SelectItem><SelectItem value = "24">일정 1일 전</SelectItem><SelectItem value = "48">일정 2일 전</SelectItem></SelectContent></Select></label>
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

function PostModal({ post, canManage, canComment }: { post: typeof posts[number]; canManage: boolean; canComment: boolean }) {
  const currentUser = '노우현';
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
  const [comments, setComments] = useState([
    { id: 1, author: '김민수', content: '확인했습니다. 이번 운동도 기대됩니다!', time: '오늘 12:30', parentId: null as number | null },
    { id: 2, author: '노우현', content: '준비물과 투표 마감 시간도 다시 확인해주세요.', time: '오늘 12:42', parentId: null as number | null },
  ]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(current => [...current, { id: Date.now(), author: currentUser, content: comment.trim(), time: '방금 전', parentId: null }]);
    setComment('');
  };

  const addReply = (parentId: number) => {
    if (!reply.trim()) return;
    setComments(current => [...current, { id: Date.now(), author: currentUser, content: reply.trim(), time: '방금 전', parentId }]);
    setReply('');
    setReplyingCommentId(null);
  };

  const removeComment = (commentId: number) => {
    setComments(current => current.filter(commentItem => commentItem.id !== commentId && commentItem.parentId !== commentId));
  };

  const renderComment = (item: typeof comments[number], isReply = false) => (
    <div key = {item.id} className = {isReply ? styles.commentReply : styles.comment}>
      <div className = {styles.avatarSmall}>{item.author[0]}</div>
      <div className = {styles.commentBody}>
        <div className = {styles.commentHeader}>
          <strong>{item.author}</strong>
          <span>
            {canComment && !isReply && <button type = "button" onClick = {() => { setReplyingCommentId(item.id); setReply(''); }}>답글</button>}
            {item.author === currentUser && <><button type = "button" onClick = {() => { setEditingCommentId(item.id); setCommentDraft(item.content); }}>수정</button><button type = "button" onClick = {() => removeComment(item.id)}>삭제</button></>}
          </span>
        </div>
        {editingCommentId === item.id ? <div className = {styles.commentEdit}><Input value = {commentDraft} onChange = {event => setCommentDraft(event.target.value)} className = {styles.input} /><Button variant = "outline" size = "sm" className = {styles.smallRoundButton} onClick = {() => setEditingCommentId(null)}>취소</Button><Button size = "sm" className = {styles.smallRoundButton} onClick = {() => { setComments(current => current.map(commentItem => commentItem.id === item.id ? { ...commentItem, content: commentDraft.trim() } : commentItem)); setEditingCommentId(null); }}>저장</Button></div> : <p>{item.content}</p>}
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
          {canManage && <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => setPinned(current => !current)}><Pin /> {pinned ? '고정 해제' : '상단 고정'}</Button>}
          {post.author === currentUser && <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => { setPostDraft(postContent); setEditingPost(current => !current); }}><Edit3 /> 수정</Button>}
          {post.author === currentUser && <Button variant = "ghost" size = "sm" className = {styles.dangerTextButton} onClick = {() => setDeleted(true)}><Trash2 /> 삭제</Button>}
        </div>
      </div>
      {editingPost ? (
        <div className = {styles.postEditArea}>
          <textarea value = {postDraft} onChange = {event => setPostDraft(event.target.value)} className = {styles.postEditTextarea} />
          <div className = {styles.postEditActions}><Button variant = "outline" size = "sm" className = {styles.smallRoundButton} onClick = {() => setEditingPost(false)}>취소</Button><Button size = "sm" className = {styles.smallRoundButton} onClick = {() => { setPostContent(postDraft.trim()); setEditingPost(false); }}>저장</Button></div>
        </div>
      ) : <p className = {styles.postContent}>{postContent}</p>}
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

function MemberModal({ member, isOwner, canManage, onOpenPermissions, onOpenOwnershipTransfer, onOpenRemoval }: { member: typeof members[number]; isOwner: boolean; canManage: boolean; onConfirm: (title: string, description: string, actionLabel: string, actionMessage: string) => void; onOpenPermissions: () => void; onOpenOwnershipTransfer: () => void; onOpenRemoval: () => void }) {
  const isTargetOwner = member.role === '소유자';
  const [memo, setMemo] = useState('');
  const [memoDraft, setMemoDraft] = useState('');
  const [editingMemo, setEditingMemo] = useState(false);
  return (
    <div className = {styles.memberModalContent}>
      <div className = {styles.memberModalScroll}>
        <div className = {styles.memberModalHeader}><div className = {styles.avatarLarge}>{member.name[0]}</div><div><div><h3>{member.name}</h3><Badge variant = "outline">{member.role}</Badge></div><p>{member.gender} · {member.age} · {member.grade}</p></div></div>
        <div className = {styles.memberDetailGrid}>
          <span><strong>{member.participation}회</strong>총 참여</span><span><strong>{member.recent}회</strong>최근 4주 참여</span><span><strong>{member.rate}%</strong>월간 참여율</span>
          <span><strong>{member.matches}</strong>평균 경기 수</span><span><strong>{member.winRate}%</strong>승률</span><span><strong>{member.absenceRate}%</strong>불참률</span>
          <span><strong>{member.doublesMmr}</strong>복식 MMR</span><span><strong>{member.mixedMmr}</strong>혼복 MMR</span><span><strong>{member.streak}회</strong>연속 참여</span>
        </div>
        <div className = {styles.memberMemo}>
          <div>
            <Edit3 />
            <strong>멤버 메모</strong>
            {canManage && (editingMemo
              ? <div className = {styles.memberMemoHeaderActions}><Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => setEditingMemo(false)}>취소</Button><Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => { setMemo(memoDraft.trim()); setEditingMemo(false); }}>저장</Button></div>
              : <Button variant = "ghost" size = "sm" className = {styles.textButton} onClick = {() => { setMemoDraft(memo); setEditingMemo(true); }}>{memo ? '수정' : '작성'}</Button>)}
          </div>
          {editingMemo ? <textarea className = {styles.memberMemoInlineTextarea} value = {memoDraft} onChange = {event => setMemoDraft(event.target.value)} placeholder = "운영에 필요한 멤버 메모를 입력하세요." /> : <p>{memo || '등록된 멤버 메모가 없습니다.'}</p>}
        </div>
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

function MemberPermissionsModal({ member, onComplete }: { member: typeof members[number]; onComplete: (message: string) => void }) {
  const [role, setRole] = useState(member.role === '매니저' ? 'MANAGER' : 'MEMBER');
  const [permissions, setPermissions] = useState({ schedule: true, notice: true, requests: false, members: false, posts: true });
  const labels = { schedule: '일정 관리', notice: '운영 안내 관리', requests: '가입 요청 관리', members: '일반 멤버 관리', posts: '공지사항 관리' } as const;
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
      <div className = {styles.modalActions}><Button className = {styles.roundButton} onClick = {() => onComplete(`${member.name}님의 역할과 권한을 저장했습니다.`)}><Check /> 권한 저장</Button></div>
    </div>
  );
}

function OwnershipTransferModal({ member, onComplete }: { member: typeof members[number]; onComplete: (message: string) => void }) {
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
      <div className = {styles.modalActions}><Button variant = "destructive" disabled = {confirmation !== member.name} className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {() => onComplete(`${member.name}님에게 소유권을 이전했습니다.`)}><Crown /> 소유권 이전</Button></div>
    </div>
  );
}

function MemberRemovalModal({ member, onComplete }: { member: typeof members[number]; onComplete: (message: string) => void }) {
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
      <div className = {styles.modalActions}><Button variant = "destructive" disabled = {confirmation !== member.name} className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {() => onComplete(`${member.name}님을 강제 탈퇴 처리했습니다.`)}><UserMinus /> 강제 탈퇴</Button></div>
    </div>
  );
}

function GroupDeletionModal({ onClose }: { onClose: () => void }) {
  const groupName = '강남 배드민턴 클럽';
  const [confirmation, setConfirmation] = useState('');

  return (
    <div className = {styles.memberManagementModal}>
      <div className = {styles.removalSummary}>
        <AlertTriangle />
        <div><strong>모임을 영구 삭제합니다.</strong><span>삭제 후에는 모든 멤버가 이 모임에 접근할 수 없으며 되돌릴 수 없습니다.</span></div>
      </div>
      <div className = {styles.groupDeletionScheduleWarning}>
        <div><CalendarDays /><span><strong>확인이 필요한 일정</strong><small>예정 일정 2개 · 진행 중 일정 1개</small></span></div>
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
        <Button variant = "destructive" disabled = {confirmation !== groupName} className = {`${styles.roundButton} ${styles.destructiveButton}`} onClick = {onClose}><Trash2 /> 모임 영구 삭제</Button>
      </div>
    </div>
  );
}

function WritePostModal({ canManage, attachmentAllowed, onComplete }: { canManage: boolean; attachmentAllowed: boolean; onComplete: (message: string) => void }) {
  const [type, setType] = useState('자유 게시판');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [pinned, setPinned] = useState(false);

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
      <div className = {styles.modalActions}><Button disabled = {!title.trim() || !content.trim()} className = {styles.roundButton} onClick = {() => onComplete(`${type} 게시글을 등록했습니다.`)}><Check /> 게시글 등록</Button></div>
    </div>
  );
}

function ParticipantsModal({ schedule }: { schedule?: typeof schedules[number] }) {
  const [filter, setFilter] = useState<VoteStatus>('JOIN');
  if (!schedule) return null;

  const participantSamples = [
    ...members.map((member, index) => ({ id: `member-${member.id}`, name: member.name, detail: `${member.gender} · ${member.age} · ${member.grade}`, role: member.role, profileImageUrl: null as string | null, status: index < 4 ? 'JOIN' as VoteStatus : index === 4 ? 'UNDECIDED' as VoteStatus : 'ABSENT' as VoteStatus, guest: false })),
    { id: 'member-7', name: '정하늘', detail: '여성 · 20대 · C급', role: '멤버', profileImageUrl: null, status: 'JOIN' as VoteStatus, guest: false },
    { id: 'member-8', name: '오세진', detail: '남성 · 30대 · A급', role: '멤버', profileImageUrl: null, status: 'JOIN' as VoteStatus, guest: false },
    { id: 'member-9', name: '문예린', detail: '여성 · 30대 · B급', role: '멤버', profileImageUrl: null, status: 'UNDECIDED' as VoteStatus, guest: false },
    { id: 'member-10', name: '장현우', detail: '남성 · 40대 · D급', role: '멤버', profileImageUrl: null, status: 'ABSENT' as VoteStatus, guest: false },
    { id: 'guest-1', name: '이도윤', detail: '남성 · 20대 · B급', role: '게스트', profileImageUrl: null, status: 'JOIN' as VoteStatus, guest: true },
    { id: 'guest-2', name: '김서우', detail: '여성 · 30대 · C급', role: '게스트', profileImageUrl: null, status: 'JOIN' as VoteStatus, guest: true },
    { id: 'guest-3', name: '윤채원', detail: '여성 · 20대 · D급', role: '게스트', profileImageUrl: null, status: 'UNDECIDED' as VoteStatus, guest: true },
  ];
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
        {filteredParticipants.map(participant => <div key = {participant.id} className = {styles.participantCard}>{participant.profileImageUrl ? <img src = {participant.profileImageUrl} alt = {`${participant.name} 프로필`} className = {styles.participantProfileImage} onError = {event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling?.removeAttribute('hidden'); }} /> : null}<div hidden = {!!participant.profileImageUrl} className = {participant.guest ? styles.guestAvatar : styles.participantAvatar}>{participant.name[0]}</div><span><strong>{participant.name}</strong><small>{participant.detail}</small></span><div className = {styles.participantBadges}><Badge variant = "outline" className = {participant.guest ? styles.guestBadge : styles.participantRoleBadge}>{participant.role}</Badge><Badge className = {styles.statusBadge(filter)}>{getVoteLabel(filter)}</Badge></div></div>)}
      </div>
    </div>
  );
}

function AddGuestModal({ onComplete }: { onComplete: (message: string) => void }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  return (
    <div className = {styles.secondaryScheduleModalContent}>
      <label className = {styles.modalField}><span>게스트 이름</span><Input value = {name} onChange = {event => setName(event.target.value)} className = {styles.input} placeholder = "이름을 입력하세요" /></label>
      <label className = {styles.modalField}><span>성별</span><Select value = {gender} onValueChange = {setGender}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "성별을 선택하세요" /></SelectTrigger><SelectContent><SelectItem className = {styles.guestSelectItem} value = "남성">남성</SelectItem><SelectItem className = {styles.guestSelectItem} value = "여성">여성</SelectItem></SelectContent></Select></label>
      <label className = {styles.modalField}><span>연령대</span><Select value = {age} onValueChange = {setAge}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "연령대를 선택하세요" /></SelectTrigger><SelectContent>{['10대', '20대', '30대', '40대', '50대', '60대 이상'].map(item => <SelectItem className = {styles.guestSelectItem} key = {item} value = {item}>{item}</SelectItem>)}</SelectContent></Select></label>
      <label className = {styles.modalField}><span>급수</span><Select value = {grade} onValueChange = {setGrade}><SelectTrigger className = {styles.selectTriggerWide}><SelectValue placeholder = "급수를 선택하세요" /></SelectTrigger><SelectContent>{['E', 'D', 'C', 'B', 'A', 'S', 'SS'].map(item => <SelectItem className = {styles.guestSelectItem} key = {item} value = {item}>{item}</SelectItem>)}</SelectContent></Select></label>
      <div className = {styles.modalActions}><Button disabled = {!name.trim() || !gender || !age || !grade} className = {styles.roundButton} onClick = {() => onComplete(`${name.trim()} 게스트를 추가했습니다.`)}><Plus /> 게스트 추가</Button></div>
    </div>
  );
}

function ManageScheduleModal({ schedule, onComplete }: { schedule?: typeof schedules[number]; onComplete: (message: string) => void }) {
  if (!schedule) return null;
  return (
    <div className = {styles.secondaryScheduleModalContent}>
      <label className = {styles.modalField}><span>일정명</span><Input defaultValue = {schedule.title} className = {styles.input} /></label>
      <label className = {styles.modalField}><span>시간</span><div className = {styles.timeFieldRow}><Input type = "time" defaultValue = {schedule.time.split(' - ')[0]} className = {styles.input} /><Input type = "time" defaultValue = {schedule.time.split(' - ')[1]} className = {styles.input} /></div></label>
      <label className = {styles.modalField}><span>장소</span><Input defaultValue = {schedule.place} className = {styles.input} /></label>
      <label className = {styles.modalField}><span>투표 마감</span><Input type = "datetime-local" defaultValue = "2026-06-13T20:00" className = {styles.input} /></label>
      <div className = {styles.modalActions}><Button variant = "outline" className = {styles.dangerTextButton} onClick = {() => onComplete('일정을 취소했습니다.')}><Trash2 /> 일정 취소</Button><Button className = {styles.roundButton} onClick = {() => onComplete('일정 정보를 저장했습니다.')}><Check /> 저장</Button></div>
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

function canChangeVoteForSchedule(schedule: typeof schedules[number], sameDayAllowed: boolean, postDeadlineAllowed: boolean) {
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
