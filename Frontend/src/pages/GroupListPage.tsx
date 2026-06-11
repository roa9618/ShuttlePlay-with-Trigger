import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Info,
  Layers3,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  Star,
  TimerReset,
  TrendingUp,
  Users,
  UsersRound,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { styles } from './GroupListPage.styles';

type GroupRole = 'OWNER' | 'MEMBER';
type FilterType = 'ALL' | GroupRole;

type GroupSummary = {
  id: number;
  name: string;
  profileImageUrl: string | null;
  role: GroupRole;
  activeMembers: number;
  lastParticipation: string;
  nextScheduleAt: string | null;
  frequentParticipationCount: number;
  recentAccessedAt: string;
  weeklyScheduleCount: number;
  organizerName: string;
  activityRegion: string;
  description: string;
  createdAt: string;
  monthlyParticipationRate: number;
  recentFourWeekParticipationCount: number;
  averageParticipationInterval: string;
  recentFourWeekScheduleCount: number;
  averageAttendance: number;
  peakActivityTime: string;
  operationNotice: string;
};

function getStartOfWeek(date: Date) {
  const startOfWeek = new Date(date);
  const currentDay = startOfWeek.getDay();

  const distanceFromMonday = currentDay === 0
    ? -6
    : 1 - currentDay;

  startOfWeek.setDate(
    startOfWeek.getDate() + distanceFromMonday,
  );

  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

function getEndOfWeek(date: Date) {
  const endOfWeek = getStartOfWeek(date);

  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
}

function createCurrentWeekSchedule(
  dayOfWeek: number,
  hour: number,
  minute = 0,
) {
  const currentDate = new Date();
  const startOfWeek = getStartOfWeek(currentDate);

  const dayOffset = dayOfWeek === 0
    ? 6
    : dayOfWeek - 1;

  const scheduleDate = new Date(startOfWeek);

  scheduleDate.setDate(
    startOfWeek.getDate() + dayOffset,
  );

  scheduleDate.setHours(hour, minute, 0, 0);

  return scheduleDate.toISOString();
}

function getUpcomingThisWeekScheduleDate(
  scheduleAt: string | null,
  now = new Date(),
) {
  if (!scheduleAt) {
    return null;
  }

  const scheduleDate = new Date(scheduleAt);

  if (Number.isNaN(scheduleDate.getTime())) {
    return null;
  }

  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);

  const isInCurrentWeek = scheduleDate >= startOfWeek
    && scheduleDate <= endOfWeek;

  const isUpcoming = scheduleDate >= now;

  if (!isInCurrentWeek || !isUpcoming) {
    return null;
  }

  return scheduleDate;
}

function formatScheduleLabel(scheduleDate: Date) {
  const dayLabels = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ];

  const dayLabel = dayLabels[scheduleDate.getDay()];

  const hours = scheduleDate
    .getHours()
    .toString()
    .padStart(2, '0');

  const minutes = scheduleDate
    .getMinutes()
    .toString()
    .padStart(2, '0');

  return `${dayLabel} ${hours}:${minutes}`;
}

function getThisWeekScheduleLabel(scheduleAt: string | null) {
  const scheduleDate = getUpcomingThisWeekScheduleDate(scheduleAt);

  if (!scheduleDate) {
    return null;
  }

  return formatScheduleLabel(scheduleDate);
}

function getRoleLabel(role: GroupRole) {
  return role === 'OWNER'
    ? '운영자'
    : '멤버';
}

function getGroupInitial(name: string) {
  return name.trim().slice(0, 1);
}

const groups: GroupSummary[] = [
  {
    id: 1,
    name: '강남 배드민턴 클럽',
    profileImageUrl: null,
    role: 'OWNER',
    activeMembers: 18,
    lastParticipation: '2일 전',
    nextScheduleAt: createCurrentWeekSchedule(4, 20),
    frequentParticipationCount: 12,
    recentAccessedAt: '오늘 14:20',
    weeklyScheduleCount: 2,
    organizerName: '노우현',
    activityRegion: '서울특별시 강남구',
    description: '퇴근 후 복식 위주로 가볍게 운동하는 정기 배드민턴 모임입니다.',
    createdAt: '2025. 03. 15.',
    monthlyParticipationRate: 86,
    recentFourWeekParticipationCount: 7,
    averageParticipationInterval: '4일',
    recentFourWeekScheduleCount: 8,
    averageAttendance: 14,
    peakActivityTime: '목요일 20시',
    operationNotice: '정기 운동 참석 여부는 운동 하루 전까지 등록해주세요.',
  },
  {
    id: 2,
    name: '서초 셔틀메이트',
    profileImageUrl: null,
    role: 'MEMBER',
    activeMembers: 14,
    lastParticipation: '4일 전',
    nextScheduleAt: createCurrentWeekSchedule(6, 10),
    frequentParticipationCount: 8,
    recentAccessedAt: '어제',
    weeklyScheduleCount: 1,
    organizerName: '김민준',
    activityRegion: '서울특별시 서초구',
    description: '초보자도 부담 없이 함께할 수 있는 즐거운 분위기의 모임입니다.',
    createdAt: '2025. 05. 08.',
    monthlyParticipationRate: 67,
    recentFourWeekParticipationCount: 4,
    averageParticipationInterval: '7일',
    recentFourWeekScheduleCount: 4,
    averageAttendance: 11,
    peakActivityTime: '토요일 10시',
    operationNotice: '처음 참여하는 멤버에게는 당일 경기 방식과 로테이션을 안내합니다.',
  },
  {
    id: 3,
    name: '송파 배린이 모임',
    profileImageUrl: null,
    role: 'OWNER',
    activeMembers: 12,
    lastParticipation: '1주 전',
    nextScheduleAt: createCurrentWeekSchedule(3, 19),
    frequentParticipationCount: 6,
    recentAccessedAt: '3일 전',
    weeklyScheduleCount: 1,
    organizerName: '노우현',
    activityRegion: '서울특별시 송파구',
    description: '라켓을 처음 잡은 사람도 천천히 적응할 수 있는 입문자 중심 모임입니다.',
    createdAt: '2025. 07. 21.',
    monthlyParticipationRate: 52,
    recentFourWeekParticipationCount: 3,
    averageParticipationInterval: '9일',
    recentFourWeekScheduleCount: 4,
    averageAttendance: 9,
    peakActivityTime: '수요일 19시',
    operationNotice: '개인 라켓 대여가 필요한 경우 운동 시작 전에 운영자에게 알려주세요.',
  },
  {
    id: 4,
    name: '역삼 주말 배드민턴',
    profileImageUrl: null,
    role: 'MEMBER',
    activeMembers: 24,
    lastParticipation: '3일 전',
    nextScheduleAt: createCurrentWeekSchedule(0, 14),
    frequentParticipationCount: 10,
    recentAccessedAt: '지난주',
    weeklyScheduleCount: 1,
    organizerName: '이서연',
    activityRegion: '서울특별시 강남구',
    description: '주말 오후에 남복, 여복, 혼복을 골고루 진행하는 모임입니다.',
    createdAt: '2024. 11. 02.',
    monthlyParticipationRate: 75,
    recentFourWeekParticipationCount: 6,
    averageParticipationInterval: '5일',
    recentFourWeekScheduleCount: 5,
    averageAttendance: 18,
    peakActivityTime: '일요일 14시',
    operationNotice: '경기 조합은 당일 참여 인원과 급수를 기준으로 운영자가 배정합니다.',
  },
  {
    id: 5,
    name: '판교 배드민턴 동호회',
    profileImageUrl: null,
    role: 'OWNER',
    activeMembers: 20,
    lastParticipation: '5일 전',
    nextScheduleAt: createCurrentWeekSchedule(5, 20),
    frequentParticipationCount: 14,
    recentAccessedAt: '2일 전',
    weeklyScheduleCount: 2,
    organizerName: '노우현',
    activityRegion: '경기도 성남시',
    description: '혼복 포지션과 로테이션을 함께 연습하는 중급자 중심 모임입니다.',
    createdAt: '2024. 09. 12.',
    monthlyParticipationRate: 82,
    recentFourWeekParticipationCount: 9,
    averageParticipationInterval: '3일',
    recentFourWeekScheduleCount: 9,
    averageAttendance: 16,
    peakActivityTime: '금요일 20시',
    operationNotice: '정기 운동 외에도 교류전과 자체 게임 일정을 수시로 등록하고 있습니다.',
  },
  {
    id: 6,
    name: '강서 셔틀콕 클럽',
    profileImageUrl: null,
    role: 'MEMBER',
    activeMembers: 16,
    lastParticipation: '1주 전',
    nextScheduleAt: null,
    frequentParticipationCount: 5,
    recentAccessedAt: '1주 전',
    weeklyScheduleCount: 0,
    organizerName: '박지훈',
    activityRegion: '서울특별시 강서구',
    description: '교류전을 준비하며 경기 기록과 조합을 꾸준히 맞춰보는 모임입니다.',
    createdAt: '2025. 01. 19.',
    monthlyParticipationRate: 38,
    recentFourWeekParticipationCount: 2,
    averageParticipationInterval: '13일',
    recentFourWeekScheduleCount: 3,
    averageAttendance: 12,
    peakActivityTime: '토요일 18시',
    operationNotice: '교류전 참가자는 공지에 안내된 마감일까지 참가 신청을 완료해주세요.',
  },
];

const PAGE_SIZE = 5;

export default function GroupListPage() {
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);

  const filteredGroups = useMemo(() => {
    const normalizedKeyword = keyword
      .trim()
      .toLowerCase();

    return groups.filter((group) => {
      const matchesKeyword = !normalizedKeyword
        || group.name.toLowerCase().includes(normalizedKeyword)
        || group.activityRegion.toLowerCase().includes(normalizedKeyword)
        || group.description.toLowerCase().includes(normalizedKeyword);

      const matchesFilter = filterType === 'ALL'
        || group.role === filterType;

      return matchesKeyword && matchesFilter;
    });
  }, [keyword, filterType]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredGroups.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    pageCount,
  );

  const pagedGroups = filteredGroups.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const ownerCount = groups.filter(
    (group) => group.role === 'OWNER',
  ).length;

  const memberCount = groups.length - ownerCount;

  const totalActiveMembers = groups.reduce(
    (sum, group) => sum + group.activeMembers,
    0,
  );

  const weeklyScheduleCount = groups.reduce(
    (sum, group) => sum + group.weeklyScheduleCount,
    0,
  );

  const nearestSchedule = useMemo(() => {
    const scheduleGroups = groups
      .map((group) => ({
        group,
        scheduleDate: getUpcomingThisWeekScheduleDate(
          group.nextScheduleAt,
        ),
      }))
      .filter(
        (
          item,
        ): item is {
          group: GroupSummary;
          scheduleDate: Date;
        } => item.scheduleDate !== null,
      )
      .sort(
        (first, second) => (
          first.scheduleDate.getTime()
          - second.scheduleDate.getTime()
        ),
      );

    return scheduleGroups[0] ?? null;
  }, []);

  const frequentGroup = groups.reduce((current, group) => (
    group.frequentParticipationCount
      > current.frequentParticipationCount
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
          <h1 className = {styles.title}>
            내 모임
          </h1>

          <Button
            asChild
            className = {styles.createButton}
          >
            <Link to = "/groups/new">
              <PlusCircle className = {styles.buttonIcon} />
              모임 만들기
            </Link>
          </Button>
        </header>

        <main className = {styles.main}>
          <section className = {styles.highlightPanel}>
            {nearestSchedule ? (
              <Link
                to = {`/groups/${nearestSchedule.group.id}`}
                className = {styles.highlightItem}
              >
                <div className = {styles.highlightIconBox}>
                  <CalendarDays className = {styles.highlightIcon} />
                </div>

                <div className = {styles.highlightContent}>
                  <span className = {styles.highlightLabel}>
                    가까운 일정
                  </span>

                  <strong className = {styles.highlightValue}>
                    {formatScheduleLabel(
                      nearestSchedule.scheduleDate,
                    )}
                  </strong>

                  <p className = {styles.highlightDescription}>
                    {nearestSchedule.group.name}
                  </p>
                </div>

                <ChevronRight className = {styles.highlightChevron} />
              </Link>
            ) : (
              <div className = {styles.highlightItemUnavailable}>
                <div className = {styles.highlightIconBox}>
                  <CalendarDays className = {styles.highlightIcon} />
                </div>

                <div className = {styles.highlightContent}>
                  <span className = {styles.highlightLabel}>
                    가까운 일정
                  </span>

                  <strong className = {styles.highlightValue}>
                    일정 없음
                  </strong>

                  <p className = {styles.highlightDescription}>
                    이번 주 예정된 운동이 없습니다.
                  </p>
                </div>
              </div>
            )}

            <Link
              to = {`/groups/${frequentGroup.id}`}
              className = {styles.highlightItem}
            >
              <div className = {styles.highlightIconBox}>
                <Star className = {styles.highlightIcon} />
              </div>

              <div className = {styles.highlightContent}>
                <span className = {styles.highlightLabel}>
                  자주 참여한 모임
                </span>

                <strong className = {styles.highlightValue}>
                  {frequentGroup.name}
                </strong>

                <p className = {styles.highlightDescription}>
                  총 {frequentGroup.frequentParticipationCount}회 참여
                </p>
              </div>

              <ChevronRight className = {styles.highlightChevron} />
            </Link>

            <Link
              to = {`/groups/${recentAccessGroup.id}`}
              className = {styles.highlightItem}
            >
              <div className = {styles.highlightIconBox}>
                <Clock3 className = {styles.highlightIcon} />
              </div>

              <div className = {styles.highlightContent}>
                <span className = {styles.highlightLabel}>
                  최근 접속한 모임
                </span>

                <strong className = {styles.highlightValue}>
                  {recentAccessGroup.name}
                </strong>

                <p className = {styles.highlightDescription}>
                  {recentAccessGroup.recentAccessedAt} 접속
                </p>
              </div>

              <ChevronRight className = {styles.highlightChevron} />
            </Link>
          </section>

          <section className = {styles.overviewPanel}>
            <article className = {styles.overviewItem}>
              <div className = {styles.overviewIconBox}>
                <Layers3 className = {styles.overviewIcon} />
              </div>

              <div className = {styles.overviewContent}>
                <span className = {styles.overviewLabel}>
                  전체 모임
                </span>

                <div className = {styles.overviewValue}>
                  <strong>{groups.length}</strong>
                  <em>개</em>
                </div>
              </div>
            </article>

            <article className = {styles.overviewItem}>
              <div className = {styles.overviewIconBox}>
                <UsersRound className = {styles.overviewIcon} />
              </div>

              <div className = {styles.overviewContent}>
                <span className = {styles.overviewLabel}>
                  활동 멤버
                </span>

                <div className = {styles.overviewValue}>
                  <strong>{totalActiveMembers}</strong>
                  <em>명</em>
                </div>
              </div>
            </article>

            <article className = {styles.overviewItem}>
              <div className = {styles.overviewIconBox}>
                <CalendarRange className = {styles.overviewIcon} />
              </div>

              <div className = {styles.overviewContent}>
                <span className = {styles.overviewLabel}>
                  이번 주 일정
                </span>

                <div className = {styles.overviewValue}>
                  <strong>{weeklyScheduleCount}</strong>
                  <em>개</em>
                </div>
              </div>
            </article>

            <article className = {styles.overviewItem}>
              <div className = {styles.overviewIconBox}>
                <ShieldCheck className = {styles.overviewIcon} />
              </div>

              <div className = {styles.overviewContent}>
                <span className = {styles.overviewLabel}>
                  운영 권한
                </span>

                <div className = {styles.overviewValue}>
                  <strong>{ownerCount}</strong>
                  <em>개</em>
                </div>
              </div>
            </article>
          </section>

          <section className = {styles.listPanel}>
            <div className = {styles.toolbar}>
              <div className = {styles.searchBox}>
                <Search className = {styles.searchIcon} />

                <Input
                  value = {keyword}
                  onChange = {(event) => (
                    handleKeywordChange(event.target.value)
                  )}
                  placeholder = "모임명, 활동 지역, 모임 소개 검색"
                  className = {styles.searchInput}
                />
              </div>

              <div className = {styles.filterGroup}>
                <button
                  type = "button"
                  className = {styles.filterButton(
                    filterType === 'ALL',
                  )}
                  onClick = {() => handleFilterChange('ALL')}
                >
                  전체
                  <span>{groups.length}</span>
                </button>

                <button
                  type = "button"
                  className = {styles.filterButton(
                    filterType === 'OWNER',
                  )}
                  onClick = {() => handleFilterChange('OWNER')}
                >
                  운영자
                  <span>{ownerCount}</span>
                </button>

                <button
                  type = "button"
                  className = {styles.filterButton(
                    filterType === 'MEMBER',
                  )}
                  onClick = {() => handleFilterChange('MEMBER')}
                >
                  멤버
                  <span>{memberCount}</span>
                </button>
              </div>
            </div>

            <div className = {styles.listHeader}>
              <span className = {styles.groupHeader}>
                모임
              </span>

              <span className = {styles.metricHeader}>
                활동 멤버
              </span>

              <span className = {styles.metricHeader}>
                최근 운동
              </span>

              <div className = {styles.scheduleHeaderCell}>
                <span className = {styles.scheduleHeaderText}>
                  가까운 일정
                </span>
              </div>

              <span aria-hidden = "true" />
            </div>

            <div className = {styles.groupList}>
              {pagedGroups.map((group) => {
                const scheduleLabel = getThisWeekScheduleLabel(
                  group.nextScheduleAt,
                );

                return (
                  <div
                    key = {group.id}
                    className = {styles.groupRow}
                  >
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

                    <div className = {styles.memberCell}>
                      <Users className = {styles.cellIcon} />
                      <span>{group.activeMembers}명</span>
                    </div>

                    <div className = {styles.recentCell}>
                      <Clock3 className = {styles.cellIcon} />
                      <span>{group.lastParticipation}</span>
                    </div>

                    <div className = {styles.scheduleCell}>
                      <div className = {styles.scheduleContent}>
                        <CalendarDays className = {styles.cellIcon} />

                        <span
                          className = {!scheduleLabel
                            ? styles.emptyScheduleText
                            : undefined}
                        >
                          {scheduleLabel ?? '일정 없음'}
                        </span>
                      </div>
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
                );
              })}

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
                  onClick = {() => setCurrentPage((page) => (
                    Math.max(1, page - 1)
                  ))}
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
                  onClick = {() => setCurrentPage((page) => (
                    Math.min(pageCount, page + 1)
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

                <div className = {styles.modalTitleContent}>
                  <h2 className = {styles.modalTitle}>
                    {selectedGroup.name}
                  </h2>

                  <p className = {styles.modalRegion}>
                    <MapPin className = {styles.modalRegionIcon} />
                    {selectedGroup.activityRegion}
                  </p>
                </div>
              </div>

              <button
                type = "button"
                className = {styles.modalCloseButton}
                onClick = {() => setSelectedGroup(null)}
                aria-label = "모달 닫기"
              >
                <X className = {styles.modalCloseIcon} />
              </button>
            </div>

            <section className = {styles.modalSection}>
              <div className = {styles.modalSectionHeader}>
                <h3 className = {styles.modalSectionTitle}>
                  내 활동 분석
                </h3>

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

              <div className = {styles.modalAnalysisGrid}>
                <div className = {styles.modalAnalysisItem}>
                  <TrendingUp className = {styles.modalAnalysisIcon} />

                  <div>
                    <span>이번 달 참여율</span>
                    <strong>
                      {selectedGroup.monthlyParticipationRate}%
                    </strong>
                  </div>
                </div>

                <div className = {styles.modalAnalysisItem}>
                  <CalendarCheck2 className = {styles.modalAnalysisIcon} />

                  <div>
                    <span>최근 4주 참여</span>
                    <strong>
                      {selectedGroup.recentFourWeekParticipationCount}회
                    </strong>
                  </div>
                </div>

                <div className = {styles.modalAnalysisItem}>
                  <TimerReset className = {styles.modalAnalysisIcon} />

                  <div>
                    <span>평균 참여 간격</span>
                    <strong>
                      {selectedGroup.averageParticipationInterval}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className = {styles.modalSection}>
              <h3 className = {styles.modalSectionTitle}>
                모임 활동 분석
              </h3>

              <div className = {styles.modalDetailList}>
                <div className = {styles.modalDetailRow}>
                  <span>최근 4주 일정</span>

                  <strong>
                    {selectedGroup.recentFourWeekScheduleCount}회
                  </strong>
                </div>

                <div className = {styles.modalDetailRow}>
                  <span>평균 참여 인원</span>

                  <strong>
                    {selectedGroup.averageAttendance}명
                  </strong>
                </div>

                <div className = {styles.modalDetailRow}>
                  <span>활발한 운동 시간</span>

                  <strong>
                    {selectedGroup.peakActivityTime}
                  </strong>
                </div>
              </div>
            </section>

            <div className = {styles.modalOperationBox}>
              <Activity className = {styles.modalOperationIcon} />

              <div className = {styles.modalOperationContent}>
                <div className = {styles.modalOperationHeader}>
                  <span>운영 안내</span>

                  <em>
                    운영자 {selectedGroup.organizerName}
                    {' · '}
                    {selectedGroup.createdAt} 개설
                  </em>
                </div>

                <p>{selectedGroup.operationNotice}</p>
              </div>
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

              <Button
                asChild
                className = {styles.modalMainButton}
              >
                <Link to = {`/groups/${selectedGroup.id}`}>
                  모임 입장
                </Link>
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}