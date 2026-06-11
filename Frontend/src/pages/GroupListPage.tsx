import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Info,
  MapPin,
  PlusCircle,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react';
import { styles } from './GroupListPage.styles';

type GroupRole = 'OWNER' | 'MEMBER';
type FilterType = 'ALL' | GroupRole;

type GroupSummary = {
  id: number;
  name: string;
  profileImageUrl: string | null;
  role: GroupRole;
  activeMembers: number;
  lastSession: string;
  nextSchedule: string;
  frequentParticipationCount: number;
  recentAccessedAt: string;
  weeklyScheduleCount: number;
  organizerName: string;
  activityRegion: string;
  description: string;
};

const groups: GroupSummary[] = [
  {
    id: 1,
    name: '강남 배드민턴 클럽',
    profileImageUrl: null,
    role: 'OWNER',
    activeMembers: 18,
    lastSession: '2일 전',
    nextSchedule: '목요일 20:00',
    frequentParticipationCount: 12,
    recentAccessedAt: '오늘 14:20',
    weeklyScheduleCount: 2,
    organizerName: '노우현',
    activityRegion: '서울특별시 강남구',
    description: '퇴근 후 복식 위주로 가볍게 운동하는 정기 배드민턴 모임입니다.',
  },
  {
    id: 2,
    name: '서초 셔틀메이트',
    profileImageUrl: null,
    role: 'MEMBER',
    activeMembers: 14,
    lastSession: '4일 전',
    nextSchedule: '토요일 10:00',
    frequentParticipationCount: 8,
    recentAccessedAt: '어제',
    weeklyScheduleCount: 1,
    organizerName: '김민준',
    activityRegion: '서울특별시 서초구',
    description: '초보자도 부담 없이 함께할 수 있는 즐거운 분위기의 모임입니다.',
  },
  {
    id: 3,
    name: '송파 배린이 모임',
    profileImageUrl: null,
    role: 'OWNER',
    activeMembers: 12,
    lastSession: '1주 전',
    nextSchedule: '수요일 19:00',
    frequentParticipationCount: 6,
    recentAccessedAt: '3일 전',
    weeklyScheduleCount: 1,
    organizerName: '노우현',
    activityRegion: '서울특별시 송파구',
    description: '라켓을 처음 잡은 사람도 천천히 적응할 수 있는 입문자 중심 모임입니다.',
  },
  {
    id: 4,
    name: '역삼 주말 배드민턴',
    profileImageUrl: null,
    role: 'MEMBER',
    activeMembers: 24,
    lastSession: '3일 전',
    nextSchedule: '일요일 14:00',
    frequentParticipationCount: 10,
    recentAccessedAt: '지난주',
    weeklyScheduleCount: 1,
    organizerName: '이서연',
    activityRegion: '서울특별시 강남구',
    description: '주말 오후에 남복, 여복, 혼복을 골고루 진행하는 모임입니다.',
  },
  {
    id: 5,
    name: '판교 배드민턴 동호회',
    profileImageUrl: null,
    role: 'OWNER',
    activeMembers: 20,
    lastSession: '5일 전',
    nextSchedule: '금요일 20:00',
    frequentParticipationCount: 14,
    recentAccessedAt: '2일 전',
    weeklyScheduleCount: 2,
    organizerName: '노우현',
    activityRegion: '경기도 성남시',
    description: '혼복 포지션과 로테이션을 함께 연습하는 중급자 중심 모임입니다.',
  },
  {
    id: 6,
    name: '강서 셔틀콕 클럽',
    profileImageUrl: null,
    role: 'MEMBER',
    activeMembers: 16,
    lastSession: '1주 전',
    nextSchedule: '화요일 19:00',
    frequentParticipationCount: 5,
    recentAccessedAt: '1주 전',
    weeklyScheduleCount: 0,
    organizerName: '박지훈',
    activityRegion: '서울특별시 강서구',
    description: '교류전을 준비하며 경기 기록과 조합을 꾸준히 맞춰보는 모임입니다.',
  },
];

const PAGE_SIZE = 5;

function getRoleLabel(role: GroupRole) {
  return role === 'OWNER' ? '운영자' : '멤버';
}

function getGroupInitial(name: string) {
  return name.trim().slice(0, 1);
}

export default function GroupListPage() {
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);

  const filteredGroups = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesKeyword = !normalizedKeyword
        || group.name.toLowerCase().includes(normalizedKeyword)
        || group.activityRegion.toLowerCase().includes(normalizedKeyword)
        || group.description.toLowerCase().includes(normalizedKeyword);

      const matchesFilter = filterType === 'ALL' || group.role === filterType;

      return matchesKeyword && matchesFilter;
    });
  }, [keyword, filterType]);

  const pageCount = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);

  const pagedGroups = filteredGroups.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const ownerCount = groups.filter((group) => group.role === 'OWNER').length;
  const memberCount = groups.length - ownerCount;

  const totalActiveMembers = groups.reduce(
    (sum, group) => sum + group.activeMembers,
    0,
  );

  const weeklyScheduleCount = groups.reduce(
    (sum, group) => sum + group.weeklyScheduleCount,
    0,
  );

  const nearestScheduleGroup = groups[0];

  const frequentGroup = groups.reduce((current, group) => (
    group.frequentParticipationCount > current.frequentParticipationCount
      ? group
      : current
  ), groups[0]);

  const recentAccessGroup = groups[1];

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (nextFilterType: FilterType) => {
    setFilterType(nextFilterType);
    setCurrentPage(1);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.backgroundGlowTop} />
      <div className = {styles.backgroundGlowBottom} />

      <div className = {styles.pageShell}>
        <header className = {styles.header}>
          <h1 className = {styles.title}>내 모임</h1>

          <Button asChild className = {styles.createButton}>
            <Link to = "/groups/new">
              <PlusCircle className = {styles.buttonIcon} />
              모임 만들기
            </Link>
          </Button>
        </header>

        <main className = {styles.main}>
          <section className = {styles.highlightPanel}>
            <article className = {styles.highlightItem}>
              <div className = {styles.highlightIconBox}>
                <CalendarDays className = {styles.highlightIcon} />
              </div>

              <div className = {styles.highlightContent}>
                <span className = {styles.highlightLabel}>가까운 일정</span>
                <strong className = {styles.highlightValue}>
                  {nearestScheduleGroup.nextSchedule}
                </strong>
                <p className = {styles.highlightDescription}>
                  {nearestScheduleGroup.name}
                </p>
              </div>
            </article>

            <article className = {styles.highlightItem}>
              <div className = {styles.highlightIconBox}>
                <Star className = {styles.highlightIcon} />
              </div>

              <div className = {styles.highlightContent}>
                <span className = {styles.highlightLabel}>자주 참여한 모임</span>
                <strong className = {styles.highlightValue}>
                  {frequentGroup.name}
                </strong>
                <p className = {styles.highlightDescription}>
                  총 {frequentGroup.frequentParticipationCount}회 참여
                </p>
              </div>
            </article>

            <article className = {styles.highlightItem}>
              <div className = {styles.highlightIconBox}>
                <Clock3 className = {styles.highlightIcon} />
              </div>

              <div className = {styles.highlightContent}>
                <span className = {styles.highlightLabel}>최근 접속한 모임</span>
                <strong className = {styles.highlightValue}>
                  {recentAccessGroup.name}
                </strong>
                <p className = {styles.highlightDescription}>
                  {recentAccessGroup.recentAccessedAt} 접속
                </p>
              </div>
            </article>
          </section>

          <section className = {styles.overviewPanel}>
            <article className = {styles.overviewItem}>
              <span>전체 모임</span>
              <div>
                <strong>{groups.length}</strong>
                <em>개</em>
              </div>
            </article>

            <article className = {styles.overviewItem}>
              <span>활동 멤버</span>
              <div>
                <strong>{totalActiveMembers}</strong>
                <em>명</em>
              </div>
            </article>

            <article className = {styles.overviewItem}>
              <span>이번 주 일정</span>
              <div>
                <strong>{weeklyScheduleCount}</strong>
                <em>개</em>
              </div>
            </article>

            <article className = {styles.overviewItem}>
              <span>운영 권한</span>
              <div>
                <strong>{ownerCount}</strong>
                <em>개</em>
              </div>
            </article>
          </section>

          <section className = {styles.listPanel}>
            <div className = {styles.toolbar}>
              <div className = {styles.searchBox}>
                <Search className = {styles.searchIcon} />

                <Input
                  value = {keyword}
                  onChange = {(event) => handleKeywordChange(event.target.value)}
                  placeholder = "모임명, 활동 지역, 모임 소개 검색"
                  className = {styles.searchInput}
                />
              </div>

              <div className = {styles.filterGroup}>
                <button
                  type = "button"
                  className = {styles.filterButton(filterType === 'ALL')}
                  onClick = {() => handleFilterChange('ALL')}
                >
                  전체
                  <span>{groups.length}</span>
                </button>

                <button
                  type = "button"
                  className = {styles.filterButton(filterType === 'OWNER')}
                  onClick = {() => handleFilterChange('OWNER')}
                >
                  운영자
                  <span>{ownerCount}</span>
                </button>

                <button
                  type = "button"
                  className = {styles.filterButton(filterType === 'MEMBER')}
                  onClick = {() => handleFilterChange('MEMBER')}
                >
                  멤버
                  <span>{memberCount}</span>
                </button>
              </div>
            </div>

            <div className = {styles.listHeader}>
              <span>모임</span>
              <span>역할</span>
              <span>활동 멤버</span>
              <span>최근 운동</span>
              <span aria-hidden = "true" />
            </div>

            <div className = {styles.groupList}>
              {pagedGroups.map((group) => (
                <div key = {group.id} className = {styles.groupRow}>
                  <Link
                    to = {`/groups/${group.id}`}
                    className = {styles.groupMain}
                  >
                    {group.profileImageUrl ? (
                      <img
                        src = {group.profileImageUrl}
                        alt = ""
                        className = {styles.groupProfileImage}
                      />
                    ) : (
                      <div className = {styles.groupInitial}>
                        {getGroupInitial(group.name)}
                      </div>
                    )}

                    <div className = {styles.groupTextBox}>
                      <h2 className = {styles.groupName}>
                        {group.name}
                      </h2>

                      <div className = {styles.groupMetaBox}>
                        <p className = {styles.groupRegion}>
                          <MapPin className = {styles.regionIcon} />
                          {group.activityRegion}
                        </p>

                        <p className = {styles.groupDescription}>
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className = {styles.roleCell}>
                    <Badge
                      variant = "outline"
                      className = {styles.roleBadge(group.role)}
                    >
                      {group.role === 'OWNER' && (
                        <Crown className = {styles.roleIcon} />
                      )}
                      {getRoleLabel(group.role)}
                    </Badge>
                  </div>

                  <div className = {styles.memberCell}>
                    <Users className = {styles.cellIcon} />
                    <strong>{group.activeMembers}</strong>
                    <span>명</span>
                  </div>

                  <div className = {styles.recentCell}>
                    <Clock3 className = {styles.cellIcon} />
                    <span>{group.lastSession}</span>
                  </div>

                  <div className = {styles.actionCell}>
                    <Button
                      type = "button"
                      size = "sm"
                      variant = "outline"
                      className = {styles.infoButton}
                      onClick = {() => setSelectedGroup(group)}
                    >
                      <Info className = {styles.actionIcon} />
                      모임 정보
                    </Button>

                    <Button
                      asChild
                      size = "sm"
                      className = {styles.enterButton}
                    >
                      <Link to = {`/groups/${group.id}`}>
                        입장
                        <ChevronRight className = {styles.chevronIcon} />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              {filteredGroups.length === 0 && (
                <div className = {styles.emptyRow}>
                  <p>조건에 맞는 모임이 없습니다.</p>
                  <span>검색어를 지우거나 필터를 변경해주세요.</span>
                </div>
              )}
            </div>

            <div className = {styles.paginationBar}>
              <div className = {styles.paginationControls}>
                <button
                  type = "button"
                  className = {styles.paginationArrowButton}
                  disabled = {safeCurrentPage === 1}
                  onClick = {() => setCurrentPage((page) => Math.max(1, page - 1))}
                  aria-label = "이전 페이지"
                >
                  <ChevronLeft className = {styles.paginationIcon} />
                </button>

                {Array.from(
                  { length: pageCount },
                  (_, index) => index + 1,
                ).map((pageNumber) => (
                  <button
                    key = {pageNumber}
                    type = "button"
                    className = {styles.pageNumberButton(
                      pageNumber === safeCurrentPage,
                    )}
                    onClick = {() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type = "button"
                  className = {styles.paginationArrowButton}
                  disabled = {safeCurrentPage === pageCount}
                  onClick = {() => setCurrentPage((page) => Math.min(
                    pageCount,
                    page + 1,
                  ))}
                  aria-label = "다음 페이지"
                >
                  <ChevronRight className = {styles.paginationIcon} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {selectedGroup && (
        <div
          className = {styles.modalOverlay}
          onClick = {() => setSelectedGroup(null)}
        >
          <section
            className = {styles.modalPanel}
            onClick = {(event) => event.stopPropagation()}
          >
            <div className = {styles.modalHeader}>
              <div className = {styles.modalTitleBox}>
                {selectedGroup.profileImageUrl ? (
                  <img
                    src = {selectedGroup.profileImageUrl}
                    alt = ""
                    className = {styles.modalProfileImage}
                  />
                ) : (
                  <div className = {styles.modalInitial}>
                    {getGroupInitial(selectedGroup.name)}
                  </div>
                )}

                <div>
                  <h2 className = {styles.modalTitle}>
                    {selectedGroup.name}
                  </h2>

                  <Badge
                    variant = "outline"
                    className = {styles.roleBadge(selectedGroup.role)}
                  >
                    {selectedGroup.role === 'OWNER' && (
                      <Crown className = {styles.roleIcon} />
                    )}
                    {getRoleLabel(selectedGroup.role)}
                  </Badge>
                </div>
              </div>

              <button
                type = "button"
                className = {styles.modalCloseButton}
                onClick = {() => setSelectedGroup(null)}
              >
                <X className = {styles.modalCloseIcon} />
              </button>
            </div>

            <div className = {styles.modalInfoGrid}>
              <div className = {styles.modalInfoItem}>
                <span>활동 멤버</span>
                <strong>{selectedGroup.activeMembers}명</strong>
              </div>

              <div className = {styles.modalInfoItem}>
                <span>최근 운동</span>
                <strong>{selectedGroup.lastSession}</strong>
              </div>

              <div className = {styles.modalInfoItem}>
                <span>가까운 일정</span>
                <strong>{selectedGroup.nextSchedule}</strong>
              </div>

              <div className = {styles.modalInfoItem}>
                <span>운영자</span>
                <strong>{selectedGroup.organizerName}</strong>
              </div>
            </div>

            <div className = {styles.modalRegionBox}>
              <span>활동 지역</span>
              <p>
                <MapPin className = {styles.modalRegionIcon} />
                {selectedGroup.activityRegion}
              </p>
            </div>

            <div className = {styles.modalDescriptionBox}>
              <span>모임 소개</span>
              <p>{selectedGroup.description}</p>
            </div>

            <div className = {styles.modalFooter}>
              <Button
                type = "button"
                variant = "outline"
                className = {styles.modalSubButton}
                onClick = {() => setSelectedGroup(null)}
              >
                닫기
              </Button>

              <Button asChild className = {styles.modalMainButton}>
                <Link to = {`/groups/${selectedGroup.id}`}>
                  모임으로 이동
                </Link>
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}