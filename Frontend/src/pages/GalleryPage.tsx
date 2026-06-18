import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Monitor, Smartphone, Tv, ChevronRight, Grid3x3, QrCode } from 'lucide-react';
import { styles } from './GalleryPage.styles';

export default function GalleryPage() {
  const sessionEntryPages = [
    { group: '진입', name: '코드·QR 입력', path: '/session-entry/previews/code-input', description: 'QR 촬영 또는 8자리 코드 입력' },
    { group: '진입', name: 'QR 카메라', path: '/session-entry/previews/camera', description: '실시간 카메라 QR 인식' },
    { group: '참가 확인', name: '등록 여부 선택', path: '/session-entry/previews/registration-choice', description: '이미 등록·신규 등록 선택' },
    { group: '참가 확인', name: '비회원 기본 정보', path: '/session-entry/previews/guest-info', description: '이름·성별·연령·급수 입력' },
    { group: '출석', name: '출석 상태 선택', path: '/session-entry/previews/attendance', description: '도착·지각·불참 선택' },
    { group: '출석', name: '지각 정보 입력', path: '/session-entry/previews/late', description: '예상 지각 시간과 사유 입력' },
    { group: '출석', name: '참가자 현황', path: '/session-entry/previews/status', description: '도착 후 내 상태 확인' },
    ...[
      ['안내', '입장 시간 전', 'too-early'], ['안내', '취소된 일정', 'cancelled'], ['안내', '종료된 일정', 'closed'],
      ['오류', '코드 형식 오류', 'invalid-code-format'], ['오류', '일정 찾을 수 없음', 'session-not-found'], ['오류', '카메라 사용 불가', 'camera-unavailable'],
      ['제한', '모임 게스트 제한', 'group-guest-disabled'], ['제한', '일정 게스트 제한', 'session-guest-disabled'], ['제한', '비회원 링크 제한', 'non-member-link-disabled'],
      ['제한', '참가 등록 마감', 'registration-closed'], ['확인', '등록 정보 없음', 'registration-not-found'], ['제한', '불참 상태 잠금', 'absent-locked'],
      ['제한', '상태 변경 잠금', 'participation-change-locked'], ['확인', '프로필 추가 입력', 'profile-required'], ['확인', '기존 참가 정보 발견', 'existing-registration-found'],
      ['완료', '도착 처리 완료', 'arrival-complete'], ['완료', '지각 전달 완료', 'late-complete'], ['완료', '불참 처리 완료', 'absence-complete'],
    ].map(([group, name, slug]) => ({ group, name, path: `/session-entry/previews/results/${slug}`, description: `${name} 상태의 독립 안내 화면` })),
  ];
  const desktopPages = [
    { name: '메인 페이지', path: '/', description: '서비스 시작 화면과 빠른 액션' },
    { name: '로그인', path: '/login', description: '이메일 로그인 화면' },
    { name: '회원가입', path: '/signup', description: '회원가입 및 프로필 입력' },
    { name: '소셜 기본 정보 입력', path: '/social-signup', description: '소셜 계정 최초 로그인 후 추가 정보 입력' },
    { name: '비밀번호 찾기', path: '/password-reset', description: '이메일 인증을 통한 비밀번호 재설정' },
    { name: '새 비밀번호 설정', path: '/password-reset/confirm', description: '재설정 링크 진입 후 새 비밀번호 입력' },
    { name: '모임 목록', path: '/groups?preview=true', description: '참여 중인 모임 목록' },
    { name: '모임 상세 홈', path: '/groups/1?preview=true', description: '모임 요약, 다가오는 일정, 최근 기록 및 활동 통계' },
    { name: '모임 일정', path: '/groups/1/schedule?preview=true', description: '캘린더와 날짜별 운동 일정 관리' },
    { name: '모임 게시판', path: '/groups/1/board?preview=true', description: '공지사항과 자유 게시판 관리' },
    { name: '모임 멤버', path: '/groups/1/members?preview=true', description: '멤버 통계와 권한 관리' },
    { name: '모임 가입 요청', path: '/groups/1/requests?preview=true', description: '신규 회원 가입 요청 승인 및 거절' },
    { name: '모임 운영 기록', path: '/groups/1/history?preview=true', description: '모임 운영 변경 이력 확인' },
    { name: '모임 설정', path: '/groups/1/settings?preview=true', description: '기본 정보, 가입, 권한 및 삭제 설정' },
    { name: '모임 만들기', path: '/groups/new?preview=true', description: '새로운 모임 생성' },
    { name: '운동 일정 만들기', path: '/groups/1/schedule?createSession=true&preview=true', description: '오늘 진행할 운동 일정을 등록합니다' },
    { name: '운영자 대시보드', path: '/sessions/demo/dashboard', description: '세션 운영 및 현황 관리' },
    { name: '참가자 관리', path: '/sessions/demo/participants', description: '참가자 상태 및 메모 관리' },
    { name: '경기 후보 큐', path: '/sessions/demo/queue', description: '자동 매칭 및 경기 생성' },
    { name: '현재 경기', path: '/sessions/demo/current', description: '진행 중인 경기 관리' },
    { name: '경기 결과 입력', path: '/sessions/demo/result/new', description: '경기 결과 및 점수 입력' },
    { name: '경기 결과 수정', path: '/sessions/demo/result/1/edit', description: '저장된 결과 수정' },
    { name: '세션 리포트', path: '/sessions/demo/report', description: '세션 통계 및 요약' },
    { name: '내 기록', path: '/my-record?preview=true', description: '개인 운동과 경기 기록 요약' },
    { name: 'MMR 변동', path: '/my-record/mmr?preview=true', description: '복식·혼복 MMR 변화 그래프' },
    { name: '전체 경기 기록', path: '/my-record/matches?preview=true', description: '필터와 페이지네이션을 제공하는 경기 이력' },
    { name: '설정', path: '/settings?preview=true', description: '프로필 및 알림 설정' },
    { name: '전체 알림', path: '/notifications?preview=true', description: '알림 목록 확인 및 읽음 처리' },
    { name: '공지사항', path: '/notices?preview=true', description: '서비스 공지 조회와 관리자 작성·수정' },
    { name: '페이지 갤러리', path: '/gallery', description: '전체 화면 목록과 테스트 진입점' },
    { name: '404', path: '/not-found-preview', description: '존재하지 않는 경로 안내 화면' },
  ];

  const adminPages = [
    ['관리자 홈', 'home'], ['회원 관리', 'users'], ['모임 관리', 'groups'],
    ['일정 관리', 'sessions'], ['경기 관리', 'matches'], ['MMR / 기록 관리', 'records'], ['알림 / 푸시 관리', 'notifications'],
    ['문의 / 신고 관리', 'inquiries'], ['운영 로그', 'logs'], ['시스템 상태 관리', 'system'],
  ].map(([name, path]) => ({ name, path: `/admin/${path}`, description: '서비스 전체 관리자 전용 운영 화면' }));

  const mobilePages = [
    { name: '참가자 현황', path: '/sessions/demo/status', description: '내 상태 및 다음 경기' },
    { name: '다음 경기 예정', path: '/sessions/demo/next-match', description: '경기 시작 알림' },
    { name: '오늘 내 운동 기록', path: '/sessions/demo/my-report', description: '당일 경기, 승패, MMR 변화' },
  ];

  const largeDisplayPages = [
    { name: '큰 화면 경기판', path: '/sessions/demo/display', description: '체육관 대형 화면용 경기 현황' },
  ];

  return (
    <div className = {styles.page}>
      <div className = {styles.content2}>
        <div className = {styles.sectionHeader}>
          <h1 className = {styles.pageTitle}>페이지 갤러리</h1>
        </div>

        <div className = {styles.stack}>
          <div>
            <div className={styles.row}><div className={styles.row2}><QrCode className={styles.monitorIcon}/></div><div><h2 className={styles.sectionTitle}>일정 입장 흐름</h2><p className={styles.descriptionText2}>코드 입력부터 출석 완료까지 단계·분기별 독립 화면</p></div><Badge className={styles.badge}>{sessionEntryPages.length}개</Badge></div>
            <div className={styles.statsGrid}>{sessionEntryPages.map(page => <Link key={page.path} to={page.path}><div className={styles.header2}><div className={styles.betweenRow}><div className={styles.row3}><Badge variant="outline" className="mb-2 border-primary/30 text-primary">{page.group}</Badge><h3 className={styles.cardTitle}>{page.name}</h3><p className={styles.descriptionText3}>{page.description}</p></div><ChevronRight className={styles.chevronRightIcon}/></div><div className={styles.footerActions}><Button size="sm" variant="outline" className={styles.fullWidthButton}>화면 보기</Button></div></div></Link>)}</div>
          </div>
          {/* Desktop Pages */}
          <div>
            <div className = {styles.row}>
              <div className = {styles.row2}>
                <Monitor className = {styles.monitorIcon} />
              </div>
              <div>
                <h2 className = {styles.sectionTitle}>데스크탑 화면</h2>
                <p className = {styles.descriptionText2}>운영자 및 관리 기능 중심</p>
              </div>
              <Badge className = {styles.badge}>
                {desktopPages.length}개
              </Badge>
            </div>

            <div className = {styles.statsGrid}>
              {desktopPages.map((page, idx) => (
                <Link key = {idx} to = {page.path}>
                  <div className = {styles.header2}>
                    <div className = {styles.betweenRow}>
                      <div className = {styles.row3}>
                        <h3 className = {styles.cardTitle}>
                          {page.name}
                        </h3>
                        <p className = {styles.descriptionText3}>
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight className = {styles.chevronRightIcon} />
                    </div>
                    <div className = {styles.footerActions}>
                      <Button size = "sm" className = {styles.fullWidthButton} onClick = {(e) => {
                          e.preventDefault();
                          window.location.href = page.path;
                        }}
                      >
                        화면 보기
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Pages */}
          <div>
            <div className={styles.row}>
              <div className={styles.row2}><Grid3x3 className={styles.monitorIcon} /></div>
              <div><h2 className={styles.sectionTitle}>서비스 관리자 화면</h2><p className={styles.descriptionText2}>권한별 서비스 전체 운영 기능</p></div>
              <Badge className={styles.badge}>{adminPages.length}개</Badge>
            </div>
            <div className={styles.statsGrid}>{adminPages.map(page => <Link key={page.path} to={page.path}><div className={styles.header2}><div className={styles.betweenRow}><div className={styles.row3}><h3 className={styles.cardTitle}>{page.name}</h3><p className={styles.descriptionText3}>{page.description}</p></div><ChevronRight className={styles.chevronRightIcon} /></div><div className={styles.footerActions}><Button size="sm" className={styles.fullWidthButton}>화면 보기</Button></div></div></Link>)}</div>
          </div>

          {/* Mobile Pages */}
          <div>
            <div className = {styles.row}>
              <div className = {styles.row2}>
                <Smartphone className = {styles.monitorIcon} />
              </div>
              <div>
                <h2 className = {styles.sectionTitle}>모바일 화면</h2>
                <p className = {styles.descriptionText2}>참가자 현장 경험 중심</p>
              </div>
              <Badge className = {styles.badge}>
                {mobilePages.length}개
              </Badge>
            </div>

            <div className = {styles.statsGrid}>
              {mobilePages.map((page, idx) => (
                <Link key = {idx} to = {page.path}>
                  <div className = {styles.header2}>
                    <div className = {styles.betweenRow}>
                      <div className = {styles.row3}>
                        <h3 className = {styles.cardTitle}>
                          {page.name}
                        </h3>
                        <p className = {styles.descriptionText3}>
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight className = {styles.chevronRightIcon} />
                    </div>
                    <div className = {styles.footerActions}>
                      <Button size = "sm" variant = "outline" className = {styles.fullWidthButton}>
                        화면 보기
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Large Display */}
          <div>
            <div className = {styles.row}>
              <div className = {styles.row2}>
                <Tv className = {styles.monitorIcon} />
              </div>
              <div>
                <h2 className = {styles.sectionTitle}>큰 화면</h2>
                <p className = {styles.descriptionText2}>체육관 대형 디스플레이</p>
              </div>
              <Badge className = {styles.badge}>
                {largeDisplayPages.length}개
              </Badge>
            </div>

            <div className = {styles.statsGrid}>
              {largeDisplayPages.map((page, idx) => (
                <Link key = {idx} to = {page.path}>
                  <div className = {styles.header2}>
                    <div className = {styles.betweenRow}>
                      <div className = {styles.row3}>
                        <h3 className = {styles.cardTitle}>
                          {page.name}
                        </h3>
                        <p className = {styles.descriptionText3}>
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight className = {styles.chevronRightIcon} />
                    </div>
                    <div className = {styles.footerActions}>
                      <Button size = "sm" variant = "outline" className = {styles.fullWidthButton} onClick = {(e) => {
                          e.preventDefault();
                          window.location.href = page.path;
                        }}
                      >
                        화면 보기
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className = {styles.contentBox}>
          <h3 className = {styles.cardTitle2}>총 {sessionEntryPages.length + desktopPages.length + adminPages.length + mobilePages.length + largeDisplayPages.length}개 화면</h3>
          <p className = {styles.descriptionText4}>
            데스크탑, 모바일, 큰 화면용 레이아웃이 각각 구현되었습니다
          </p>
          <Link to = "/">
            <Button className = {styles.roundButton}>
              메인으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
