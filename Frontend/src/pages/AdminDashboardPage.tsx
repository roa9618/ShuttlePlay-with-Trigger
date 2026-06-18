import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity, BellRing, CalendarDays, ChevronLeft, ChevronRight,
  ClipboardCheck, Database, Gauge, History,
  PauseCircle, PlayCircle, Search, Settings2, ShieldCheck, Swords, Trash2,
  UserCog, Users, UsersRound, X,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { adminApi, type AdminSectionResponse, type AdminUserDetail } from '../utils/adminApi';
import { connectAdminSocket } from '../utils/adminSocket';
import { styles } from './AdminDashboardPage.styles';

type AdminSection = { id: string; title: string; description: string; icon: ComponentType<{ className?: string }> };

const adminSections: AdminSection[] = [
  { id: 'home', title: '관리자 홈', description: '서비스 핵심 지표와 오늘의 운영 현황', icon: Gauge },
  { id: 'users', title: '회원 관리', description: '회원 검색, 상태와 활동 정보 확인', icon: Users },
  { id: 'groups', title: '모임 관리', description: '전체 모임과 운영 상태 확인', icon: UsersRound },
  { id: 'sessions', title: '일정 관리', description: '전체 일정과 진행 상태 확인', icon: CalendarDays },
  { id: 'matches', title: '경기 관리', description: '경기 결과와 반영 상태 확인', icon: Swords },
  { id: 'records', title: 'MMR / 기록', description: 'MMR 및 개인 기록 정합성 확인', icon: Activity },
  { id: 'notifications', title: '알림 / 푸시', description: '알림 발송과 구독 상태 확인', icon: BellRing },
  { id: 'inquiries', title: '문의 / 신고 관리', description: '문의, 피드백, 오류 및 문제 제보 통합 처리', icon: ClipboardCheck },
  { id: 'logs', title: '모임 운영 로그', description: '모임 내 운영 작업과 변경 이력 확인', icon: History },
  { id: 'system', title: '시스템 상태', description: '서버, DB, WebSocket 상태 확인', icon: Database },
];

const initial: AdminSectionResponse = { section: 'home', stats: {}, items: [], page: 0, size: 12, totalElements: 0, totalPages: 1 };
const labels: Record<string, string> = {
  ACTIVE: '활성', INACTIVE: '비활성', DELETED: '탈퇴', USER: '일반 회원', ADMIN: '관리자',
  CREATED: '생성', ATTENDANCE_OPEN: '출석 접수', IN_PROGRESS: '진행 중', CLOSED: '종료', CANCELLED: '취소',
  RECEIVED: '접수', RESOLVED: '처리 완료', LOCAL: '이메일', GOOGLE: '구글', KAKAO: '카카오', NAVER: '네이버',
  SERVICE_USAGE: '서비스 이용', ACCOUNT_LOGIN: '계정 / 로그인', GROUP_OPERATION: '모임 운영', MATCH_RECORD_MMR: '경기 / 기록 / MMR',
  ERROR_REPORT: '오류 제보', PRIVACY_RIGHTS: '개인정보 권리', REPORT_POLICY: '신고 / 정책', OTHER: '기타',
};
const display = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  const text = String(value);
  if (labels[text]) return labels[text];
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) return new Date(text).toLocaleString('ko-KR');
  return text;
};

function statTarget(label: string) {
  if (label.includes('회원') || label.includes('가입')) return 'users';
  if (label.includes('모임')) return 'groups';
  if (label.includes('일정')) return 'sessions';
  if (label.includes('문의')) return 'inquiries';
  return 'system';
}

export default function AdminDashboardPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { section = 'home' } = useParams();
  const config = adminSections.find(item => item.id === section) ?? adminSections[0];
  const [data, setData] = useState(initial);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [actionText, setActionText] = useState('');
  const [savingItem, setSavingItem] = useState(false);
  const load = useCallback(() => adminApi.section(config.id, keyword, page, {
    role: roleFilter as '' | 'USER' | 'ADMIN', userStatus: userStatusFilter as '' | 'ACTIVE' | 'INACTIVE' | 'DELETED',
    inquiryStatus: inquiryStatusFilter as '' | 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED', category: categoryFilter,
  }).then(setData), [categoryFilter, config.id, inquiryStatusFilter, keyword, page, roleFilter, userStatusFilter]);
  useEffect(() => { setPage(0); setKeyword(''); setRoleFilter(''); setUserStatusFilter(''); setInquiryStatusFilter(''); setCategoryFilter(''); }, [section]);
  useEffect(() => { void load(); }, [load, refreshKey]);
  useEffect(() => connectAdminSocket(() => setRefreshKey(value => value + 1), setSocketConnected), []);
  const columns = useMemo(() => data.items[0] ? Object.keys(data.items[0]) : [], [data.items]);
  const userSection = config.id === 'users';

  const openUser = async (item: Record<string, unknown>) => {
    if (!userSection || typeof item.id !== 'number') return;
    setSelectedUser(await adminApi.userDetail(item.id));
  };
  const updateRole = async (role: 'USER' | 'ADMIN') => {
    if (!selectedUser) return;
    setSavingUser(true);
    try { setSelectedUser(await adminApi.updateUserRole(selectedUser.id, role)); await load(); } finally { setSavingUser(false); }
  };
  const updateStatus = async (status: 'ACTIVE' | 'INACTIVE') => {
    if (!selectedUser) return;
    setSavingUser(true);
    try { setSelectedUser(await adminApi.updateUserStatus(selectedUser.id, status)); await load(); } finally { setSavingUser(false); }
  };
  const deleteUser = async () => {
    if (!selectedUser || !window.confirm(`${selectedUser.이름} 회원을 탈퇴 처리할까요?`)) return;
    setSavingUser(true);
    try { await adminApi.deleteUser(selectedUser.id); setSelectedUser(null); await load(); } finally { setSavingUser(false); }
  };
  const openItem = (item: Record<string, unknown>) => {
    if (userSection) { void openUser(item); return; }
    setSelectedItem(item);
    setActionText(String(item['관리자 메모'] ?? item['메모'] ?? item['무효 사유'] ?? ''));
  };
  const runItemAction = async (action: string) => {
    if (!selectedItem || typeof selectedItem.id !== 'number') return;
    setSavingItem(true);
    try {
      let updated: Record<string, unknown> | null = null;
      if (config.id === 'groups') updated = await adminApi.updateGroupStatus(selectedItem.id, action as 'ACTIVE' | 'INACTIVE');
      if (config.id === 'sessions') updated = await adminApi.cancelSession(selectedItem.id);
      if (config.id === 'matches') updated = await adminApi.invalidateMatch(selectedItem.id, actionText);
      if (config.id === 'inquiries') updated = await adminApi.updateInquiry(selectedItem.id, action as 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED', actionText);
      setSelectedItem(updated); await load();
    } finally { setSavingItem(false); }
  };
  const sendTestNotification = async () => { await adminApi.sendTestNotification(); await load(); };

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.header}><div><h1 className={styles.title}>{config.title}</h1></div><span className={styles.live(socketConnected)}><span /> {socketConnected ? '실시간 연결됨' : '연결 확인 중'}</span></header>
    <nav className={styles.tabBar}>{adminSections.map(item => { const Icon = item.icon; return <Link key={item.id} to={`/admin/${item.id}`} className={styles.tab(item.id === config.id)}><Icon /><span>{item.title}</span></Link>; })}</nav>
    <div className={styles.contentArea}>
        {section === 'home' ? <>
          <section className={styles.hero}><div><span>오늘의 운영 현황</span><h2>서비스 운영 지표를 한눈에 확인하세요</h2><p>연결 상태는 상단 실시간 배지에서, 세부 구성 상태는 시스템 상태 메뉴에서 확인할 수 있습니다.</p></div></section>
          <section className={styles.stats}>{Object.entries(data.stats ?? {}).map(([label, value]) => <Link key={label} to={`/admin/${statTarget(label)}`} className={styles.stat}><span>{label}</span><strong>{display(value)}</strong><small>자세히 보기 <ChevronRight /></small></Link>)}</section>
          <div className={styles.homeGrid}><Mini title="최근 가입 회원" target="users" items={data.items} /><Mini title="최근 생성 모임" target="groups" items={data.secondaryItems ?? []} /></div>
        </> : <>
          {data.stats && Object.keys(data.stats).length > 0 && <section className={styles.stats}>{Object.entries(data.stats).map(([label, value]) => <article key={label} className={styles.infoStat}><span>{label}</span><strong>{display(value)}</strong></article>)}</section>}
          {config.id === 'system' && <section className={styles.systemGuide}><Database /><div><strong>시스템 구성 상태</strong><p>위 항목은 관리자 API 응답과 서버 설정 여부를 기준으로 표시합니다. 실제 관리자 실시간 채널 연결 여부는 화면 상단 배지에서 확인할 수 있습니다.</p></div></section>}
          {config.id !== 'system' && (<>
          <section className={styles.panel}><div className={styles.toolbar}><label className={styles.search}><Search /><Input className={styles.input} value={keyword} placeholder={`${config.title} 검색`} onChange={e => { setKeyword(e.target.value); setPage(0); }} /></label><div className={styles.toolbarActions}>{userSection && <><AdminFilter value={roleFilter || 'ALL'} placeholder="전체 권한" onChange={value => { setRoleFilter(value === 'ALL' ? '' : value); setPage(0); }} options={[['ALL', '전체 권한'], ['USER', '일반 회원'], ['ADMIN', '관리자']]} /><AdminFilter value={userStatusFilter || 'ALL'} placeholder="전체 상태" onChange={value => { setUserStatusFilter(value === 'ALL' ? '' : value); setPage(0); }} options={[['ALL', '전체 상태'], ['ACTIVE', '활성'], ['INACTIVE', '비활성'], ['DELETED', '탈퇴']]} /></>}{config.id === 'inquiries' && <><AdminFilter value={categoryFilter || 'ALL'} placeholder="전체 유형" onChange={value => { setCategoryFilter(value === 'ALL' ? '' : value); setPage(0); }} options={[['ALL', '전체 유형'], ['SERVICE_USAGE', '서비스 이용'], ['ACCOUNT_LOGIN', '계정 / 로그인'], ['GROUP_OPERATION', '모임 운영'], ['MATCH_RECORD_MMR', '경기 / 기록 / MMR'], ['ERROR_REPORT', '오류 제보'], ['REPORT_POLICY', '신고 / 정책'], ['OTHER', '기타']]} /><AdminFilter value={inquiryStatusFilter || 'ALL'} placeholder="전체 상태" onChange={value => { setInquiryStatusFilter(value === 'ALL' ? '' : value); setPage(0); }} options={[['ALL', '전체 상태'], ['RECEIVED', '접수'], ['IN_PROGRESS', '처리 중'], ['RESOLVED', '처리 완료']]} /></>}{config.id === 'notifications' && <Button variant="outline" className={styles.secondaryButton} onClick={() => void sendTestNotification()}>테스트 알림 발송</Button>}<span className={styles.count}>총 {data.totalElements}건</span></div></div>
            <div className={styles.tableWrap}>{data.items.length ? <table className={styles.table}><thead><tr>{columns.map(column => <th key={column} className={styles.th}>{column}</th>)}</tr></thead><tbody>{data.items.map((item, index) => <tr key={String(item.id ?? index)} className={styles.tableRow(true)} tabIndex={0} onClick={() => openItem(item)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') openItem(item); }}>{columns.map(column => <td key={column} className={styles.td} title={display(item[column])}>{display(item[column])}</td>)}</tr>)}</tbody></table> : <div className={styles.empty}><Database /><strong>표시할 데이터가 없습니다</strong><span>운영 데이터가 생성되면 이곳에서 확인할 수 있습니다.</span></div>}</div>
            {config.id !== 'notifications' && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
          </section>
          {config.id === 'notifications' && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} outside />}
          </>)}
        </>}
    </div>
    {selectedUser && <div className={styles.overlay} onMouseDown={() => !savingUser && setSelectedUser(null)}><section className={styles.userModal} onMouseDown={event => event.stopPropagation()}>
      <header className={styles.modalHeader}><div><span className={styles.userAvatar}>{selectedUser['프로필 이미지'] ? <img src={selectedUser['프로필 이미지']} alt="" /> : selectedUser.이름.slice(0, 1)}</span><div><h2>{selectedUser.이름}</h2><p>{selectedUser.이메일}</p></div></div><Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} disabled={savingUser} aria-label="닫기"><X /></Button></header>
      <div className={styles.modalBody}><div className={styles.detailGrid}>{[['회원 ID', selectedUser.id], ['가입 방식', selectedUser['가입 방식']], ['급수', selectedUser.급수], ['복식 MMR', selectedUser['복식 MMR']], ['혼복 MMR', selectedUser['혼복 MMR']], ['가입일', display(selectedUser.가입일)]].map(([label, value]) => <span key={String(label)}><small>{label}</small><strong>{display(value)}</strong></span>)}</div>
        <section className={styles.manageSection}><div className={styles.manageHeading}><UserCog /><div><strong>회원 권한</strong><span>일반 회원 또는 서비스 관리자로 권한을 변경합니다.</span></div></div><div className={styles.optionRow}><button className={styles.option(selectedUser.권한 === 'USER')} disabled={savingUser || session?.id === selectedUser.id} onClick={() => void updateRole('USER')}><Users />일반 회원</button><button className={styles.option(selectedUser.권한 === 'ADMIN')} disabled={savingUser} onClick={() => void updateRole('ADMIN')}><ShieldCheck />관리자</button></div></section>
        <section className={styles.manageSection}><div className={styles.manageHeading}>{selectedUser.상태 === 'ACTIVE' ? <PlayCircle /> : <PauseCircle />}<div><strong>계정 상태</strong><span>정지된 회원은 로그인과 서비스 이용이 제한됩니다.</span></div><em className={styles.statusBadge(selectedUser.상태)}>{selectedUser.상태 === 'ACTIVE' ? '활성' : selectedUser.상태 === 'INACTIVE' ? '정지' : '탈퇴'}</em></div><div className={styles.optionRow}><button className={styles.option(selectedUser.상태 === 'ACTIVE')} disabled={savingUser || selectedUser.상태 === 'DELETED' || session?.id === selectedUser.id} onClick={() => void updateStatus('ACTIVE')}><PlayCircle />활성 처리</button><button className={styles.dangerOption(selectedUser.상태 === 'INACTIVE')} disabled={savingUser || selectedUser.상태 === 'DELETED' || session?.id === selectedUser.id} onClick={() => void updateStatus('INACTIVE')}><PauseCircle />계정 정지</button></div></section>
        <section className={styles.dangerZone}><div><Trash2 /><span><strong>회원 탈퇴 처리</strong><small>계정을 삭제 상태로 전환하며 다시 로그인할 수 없습니다.</small></span></div><Button variant="destructive" disabled={savingUser || selectedUser.상태 === 'DELETED' || session?.id === selectedUser.id} onClick={() => void deleteUser()}>탈퇴 처리</Button></section>
      </div>
    </section></div>}
    {selectedItem && <div className={styles.overlay} onMouseDown={() => !savingItem && setSelectedItem(null)}><section className={styles.userModal} onMouseDown={event => event.stopPropagation()}><header className={styles.modalHeader}><div><span className={styles.userAvatar}><Settings2 /></span><div><h2>{String(selectedItem['모임명'] ?? selectedItem['일정명'] ?? selectedItem['제목'] ?? selectedItem['체크 항목'] ?? `${config.title} 상세`)}</h2><p>{config.description}</p></div></div><Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)} aria-label="닫기"><X /></Button></header><div className={styles.modalBody}>
      <div className={styles.itemDetailGrid}>{Object.entries(selectedItem).filter(([key]) => !['내용', '관리자 메모', '메모', '무효 사유'].includes(key)).map(([key, value]) => <span key={key}><small>{key}</small><strong>{display(value)}</strong></span>)}</div>
      {(config.id === 'matches' || config.id === 'inquiries') && <label className={styles.memoField}><span>{config.id === 'matches' ? '무효 처리 사유' : '관리자 메모'}</span><textarea value={actionText} maxLength={1000} onChange={event => setActionText(event.target.value)} placeholder={config.id === 'matches' ? '경기 무효 처리 사유를 입력하세요.' : '처리 메모를 입력하세요.'} /></label>}
      <div className={styles.itemActions}>
        {config.id === 'groups' && <><Button variant="outline" className={styles.secondaryButton} onClick={() => navigate(`/groups/${selectedItem.id}`)}>모임 페이지 열기</Button><Button disabled={savingItem || selectedItem.상태 === 'ACTIVE'} onClick={() => void runItemAction('ACTIVE')}>활성 처리</Button><Button variant="destructive" disabled={savingItem || selectedItem.상태 === 'INACTIVE'} onClick={() => void runItemAction('INACTIVE')}>비활성 처리</Button></>}
        {config.id === 'sessions' && <><Button variant="outline" className={styles.secondaryButton} onClick={() => navigate(`/groups/${selectedItem['모임 ID']}/schedule?sessionId=${selectedItem.id}`)}>일정 페이지 열기</Button><Button variant="destructive" disabled={savingItem || selectedItem.상태 === 'CANCELLED' || selectedItem.상태 === 'CLOSED'} onClick={() => void runItemAction('cancel')}>일정 취소</Button></>}
        {config.id === 'matches' && <Button variant="destructive" disabled={savingItem || selectedItem.무효 === true || !actionText.trim()} onClick={() => void runItemAction('invalidate')}>경기 무효 처리</Button>}
        {config.id === 'inquiries' && <><Button variant="outline" className={styles.secondaryButton} disabled={savingItem} onClick={() => void runItemAction('RECEIVED')}>접수</Button><Button variant="outline" className={styles.secondaryButton} disabled={savingItem} onClick={() => void runItemAction('IN_PROGRESS')}>처리 중</Button><Button disabled={savingItem} onClick={() => void runItemAction('RESOLVED')}>처리 완료</Button></>}
        {config.id === 'notifications' && typeof selectedItem['이동 경로'] === 'string' && <Button variant="outline" className={styles.secondaryButton} onClick={() => navigate(String(selectedItem['이동 경로']))}>관련 화면 이동</Button>}
        {config.id === 'records' && Boolean(selectedItem['경기 ID']) && <Button variant="outline" className={styles.secondaryButton} onClick={() => navigate('/admin/matches')}>관련 경기 확인</Button>}
      </div>
    </div></section></div>}
  </div></main>;
}

function Mini({ title, target, items }: { title: string; target: string; items: Array<Record<string, unknown>> }) {
  return <section className={styles.miniPanel}><header><h2>{title}</h2><Link to={`/admin/${target}`}>전체 보기 <ChevronRight /></Link></header>{items.length ? items.map((item, index) => <Link to={`/admin/${target}`} className={styles.miniRow} key={String(item.id ?? index)}><span><strong>{display(item['이름'] ?? item['모임명'] ?? item.id)}</strong><small>{display(item['이메일'] ?? item['운영자'] ?? item['생성일'])}</small></span><ChevronRight /></Link>) : <div className={styles.miniEmpty}>표시할 데이터가 없습니다.</div>}</section>;
}

function AdminFilter({ value, placeholder, options, onChange }: { value: string; placeholder: string; options: string[][]; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className={styles.filterSelect}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent className={styles.filterContent}>{options.map(([optionValue, label]) => <SelectItem className={styles.filterItem} key={optionValue} value={optionValue}>{label}</SelectItem>)}</SelectContent></Select>;
}

function Pagination({ page, totalPages, onPageChange, outside = false }: { page: number; totalPages: number; onPageChange: (page: number) => void; outside?: boolean }) {
  return <nav className={outside ? styles.paginationOutside : styles.pagination} aria-label="페이지 이동"><button type="button" className={styles.pageButton()} disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label="이전 페이지"><ChevronLeft /></button>{Array.from({ length: Math.max(1, totalPages) }, (_, i) => <button type="button" key={i} className={styles.pageButton(page === i)} onClick={() => onPageChange(i)}>{i + 1}</button>)}<button type="button" className={styles.pageButton()} disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} aria-label="다음 페이지"><ChevronRight /></button></nav>;
}
