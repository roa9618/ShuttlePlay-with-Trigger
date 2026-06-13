import { useEffect, useState } from 'react';
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
import { formatActivityRegion } from '../utils/activityRegion';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  getGroupActivitySummary,
  getGroupOverview,
  getMyGroups,
  type GroupActivitySummaryResponse,
  type GroupListItemResponse,
  type GroupOverviewResponse,
  type GroupRole,
} from '../utils/groupApi';
import { styles } from './GroupListPage.styles';

type FilterType = 'ALL' | GroupRole;

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

function formatRelativeDate(dateTime: string | null) {
  if (!dateTime) {
    return '기록 없음';
  }

  const date = new Date(dateTime);
  const now = new Date();
  const dayDifference = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDifference <= 0) {
    return '오늘';
  }

  if (dayDifference === 1) {
    return '어제';
  }

  if (dayDifference < 7) {
    return `${dayDifference}일 전`;
  }

  return `${Math.floor(dayDifference / 7)}주 전`;
}

function formatCreatedAt(dateTime: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dateTime));
}

const PAGE_SIZE = 5;
const MINIMUM_VISIBLE_ROWS = 3;

const initialOverview: GroupOverviewResponse = {
  nearestSchedule: null,
  frequentGroup: null,
  recentAccessGroup: null,
  totalGroupCount: 0,
  ownerGroupCount: 0,
  memberGroupCount: 0,
  totalActiveMemberCount: 0,
  weeklyScheduleCount: 0,
};

export default function GroupListPage() {
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState<GroupListItemResponse[]>([]);
  const [overview, setOverview] = useState(initialOverview);
  const [pageCount, setPageCount] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<GroupActivitySummaryResponse | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      try {
        const response = await getGroupOverview();

        if (!ignore) {
          setOverview(response);
        }
      } catch {
        if (!ignore) {
          setOverview(initialOverview);
        }
      }
    };

    loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const timer = window.setTimeout(async () => {
      try {
        const response = await getMyGroups({
          keyword: keyword.trim(),
          role: filterType === 'ALL'
            ? null
            : filterType,
          page: currentPage - 1,
          size: PAGE_SIZE,
        });

        if (!ignore) {
          setGroups(response.items);
          setPageCount(Math.max(1, response.totalPages));
        }
      } catch {
        if (!ignore) {
          setGroups([]);
          setPageCount(1);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [currentPage, filterType, keyword]);

  const safeCurrentPage = Math.min(currentPage, pageCount);
  const nearestSchedule = overview.nearestSchedule;
  const frequentGroup = overview.frequentGroup;
  const recentAccessGroup = overview.recentAccessGroup;

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (nextFilterType: FilterType) => {
    setFilterType(nextFilterType);
    setCurrentPage(1);
  };

  const handleGroupInfoClick = async (groupId: number) => {
    try {
      const response = await getGroupActivitySummary(groupId);

      setSelectedGroup(response);
    } catch {
      setSelectedGroup(null);
    }
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
                to = {`/groups/${nearestSchedule.groupId}`}
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
                      new Date(nearestSchedule.scheduleAt ?? ''),
                    )}
                  </strong>

                  <p className = {styles.highlightDescription}>
                    {nearestSchedule.groupName}
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

            {frequentGroup ? (
              <Link
                to = {`/groups/${frequentGroup.groupId}`}
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
                  {frequentGroup.groupName}
                </strong>

                <p className = {styles.highlightDescription}>
                  총 {frequentGroup.participationCount ?? 0}회 참여
                </p>
              </div>

              <ChevronRight className = {styles.highlightChevron} />
              </Link>
            ) : (
              <div className = {styles.highlightItemUnavailable}>
                <div className = {styles.highlightIconBox}>
                  <Star className = {styles.highlightIcon} />
                </div>

                <div className = {styles.highlightContent}>
                  <span className = {styles.highlightLabel}>
                    자주 참여한 모임
                  </span>

                  <strong className = {styles.highlightValue}>
                    모임 없음
                  </strong>

                  <p className = {styles.highlightDescription}>
                    아직 참여한 모임이 없습니다.
                  </p>
                </div>
              </div>
            )}

            {recentAccessGroup ? (
              <Link
                to = {`/groups/${recentAccessGroup.groupId}`}
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
                  {recentAccessGroup.groupName}
                </strong>

                <p className = {styles.highlightDescription}>
                  {formatRelativeDate(recentAccessGroup.accessedAt)} 접속
                </p>
              </div>

              <ChevronRight className = {styles.highlightChevron} />
              </Link>
            ) : (
              <div className = {styles.highlightItemUnavailable}>
                <div className = {styles.highlightIconBox}>
                  <Clock3 className = {styles.highlightIcon} />
                </div>

                <div className = {styles.highlightContent}>
                  <span className = {styles.highlightLabel}>
                    최근 접속한 모임
                  </span>

                  <strong className = {styles.highlightValue}>
                    모임 없음
                  </strong>

                  <p className = {styles.highlightDescription}>
                    최근 접속한 모임이 없습니다.
                  </p>
                </div>
              </div>
            )}
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
                  <strong>{overview.totalGroupCount}</strong>
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
                  <strong>{overview.totalActiveMemberCount}</strong>
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
                  <strong>{overview.weeklyScheduleCount}</strong>
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
                  <strong>{overview.ownerGroupCount}</strong>
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
                  <span>{overview.totalGroupCount}</span>
                </button>

                <button
                  type = "button"
                  className = {styles.filterButton(
                    filterType === 'OWNER',
                  )}
                  onClick = {() => handleFilterChange('OWNER')}
                >
                  운영자
                  <span>{overview.ownerGroupCount}</span>
                </button>

                <button
                  type = "button"
                  className = {styles.filterButton(
                    filterType === 'MEMBER',
                  )}
                  onClick = {() => handleFilterChange('MEMBER')}
                >
                  멤버
                  <span>{overview.memberGroupCount}</span>
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
              {groups.map((group) => {
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
                      <img
                        src = {group.profileImageUrl ?? '/shuttleplay-maskable-icon-512.png'}
                        alt = ""
                        className = {styles.groupProfileImage}
                      />

                      <div className = {styles.groupTextBox}>
                        <h2 className = {styles.groupName}>
                          {group.name}
                        </h2>

                        <div className = {styles.groupMetaBox}>
                          <p className = {styles.groupRegion}>
                            <MapPin className = {styles.regionIcon} />
                            {formatActivityRegion(group.activityRegion)}
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
                      <span>{formatRelativeDate(group.lastParticipationAt)}</span>
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
                        onClick = {() => handleGroupInfoClick(group.id)}
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

              {groups.length === 0 ? (
                <div className = {styles.emptyRow}>
                  <p>조건에 맞는 모임이 없습니다.</p>
                  <span>검색어를 지우거나 필터를 변경해주세요.</span>
                </div>
              ) : (
                Array.from({
                  length: Math.max(0, MINIMUM_VISIBLE_ROWS - groups.length),
                }).map((_, index) => (
                  <div
                    key = {`empty-group-row-${index}`}
                    className = {styles.emptyGroupRow}
                    aria-hidden = "true"
                  />
                ))
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
                <img
                  src = {selectedGroup.profileImageUrl ?? '/shuttleplay-maskable-icon-512.png'}
                  alt = ""
                  className = {styles.modalProfileImage}
                />

                <div className = {styles.modalTitleContent}>
                  <h2 className = {styles.modalTitle}>
                    {selectedGroup.name}
                  </h2>

                  <p className = {styles.modalRegion}>
                    <MapPin className = {styles.modalRegionIcon} />
                    {formatActivityRegion(selectedGroup.activityRegion)}
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
                      {selectedGroup.averageParticipationIntervalDays}일
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
                    {formatCreatedAt(selectedGroup.createdAt)} 개설
                  </em>
                </div>

                <p>{selectedGroup.operationNotice ?? '등록된 운영 안내가 없습니다.'}</p>
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
                <Link to = {`/groups/${selectedGroup.groupId}`}>
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
