import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Monitor, Smartphone, Tv, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const desktopPages = [
    { name: '메인 페이지', path: '/', description: '서비스 시작 화면과 빠른 액션' },
    { name: '로그인', path: '/login', description: '이메일 로그인 화면' },
    { name: '회원가입', path: '/signup', description: '회원가입 및 프로필 입력' },
    { name: '비밀번호 찾기', path: '/password-reset', description: '이메일 인증을 통한 비밀번호 재설정' },
    { name: '모임 목록', path: '/groups', description: '참여 중인 모임 목록' },
    { name: '모임 상세', path: '/groups/1', description: '모임 정보 및 세션 관리' },
    { name: '전체 멤버', path: '/groups/1/members', description: '모임 멤버 전체 목록 및 통계' },
    { name: '모임 설정', path: '/groups/1/settings', description: '모임 정보 및 설정 관리' },
    { name: '모임 만들기', path: '/groups/new', description: '새로운 모임 생성' },
    { name: '세션 생성', path: '/groups/1/create-session', description: '오늘 운동 세션 만들기' },
    { name: '운영자 대시보드', path: '/sessions/demo/dashboard', description: '세션 운영 및 현황 관리' },
    { name: '참가자 관리', path: '/sessions/demo/participants', description: '참가자 상태 및 메모 관리' },
    { name: '경기 후보 큐', path: '/sessions/demo/queue', description: '자동 매칭 및 경기 생성' },
    { name: '현재 경기', path: '/sessions/demo/current', description: '진행 중인 경기 관리' },
    { name: '경기 결과 입력', path: '/sessions/demo/result/new', description: '경기 결과 및 점수 입력' },
    { name: '경기 결과 수정', path: '/sessions/demo/result/1/edit', description: '저장된 결과 수정' },
    { name: '세션 리포트', path: '/sessions/demo/report', description: '세션 통계 및 요약' },
    { name: '내 기록', path: '/my-record', description: '개인 경기 기록 및 월별 캘린더' },
    { name: '설정', path: '/settings', description: '프로필 및 알림 설정' },
    { name: '페이지 갤러리', path: '/gallery', description: '전체 화면 목록과 테스트 진입점' },
    { name: '404', path: '/not-found-preview', description: '존재하지 않는 경로 안내 화면' },
  ];

  const mobilePages = [
    { name: '메인 페이지', path: '/', description: '모바일 메인 화면' },
    { name: '로그인', path: '/login', description: '모바일 로그인' },
    { name: '회원가입', path: '/signup', description: '모바일 회원가입' },
    { name: '비밀번호 찾기', path: '/password-reset', description: '모바일 비밀번호 재설정' },
    { name: 'QR 참여', path: '/sessions/demo/join', description: '세션 참여 방법 선택' },
    { name: '비회원 참여', path: '/sessions/demo/guest-join', description: '비회원 정보 입력' },
    { name: '출석 체크', path: '/sessions/demo/attendance', description: '도착 확인 및 상태 선택' },
    { name: '지각 예정 등록', path: '/sessions/demo/late', description: '지각 시간 및 사유 입력' },
    { name: '참가자 현황', path: '/sessions/demo/status', description: '내 상태 및 다음 경기' },
    { name: '다음 경기 예정', path: '/sessions/demo/next-match', description: '경기 시작 알림' },
    { name: '오늘 내 운동 기록', path: '/sessions/demo/my-report', description: '당일 경기, 승패, MMR 변화' },
    { name: '내 기록', path: '/my-record', description: '월별 기록과 최근 경기 확인' },
    { name: '설정', path: '/settings', description: '프로필, 알림, PWA 설정' },
  ];

  const largeDisplayPages = [
    { name: '큰 화면 경기판', path: '/sessions/demo/display', description: '체육관 대형 화면용 경기 현황' },
  ];

  return (
    <div className = "min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className = "border-b border-border bg-card">
        <div className = "max-w-7xl mx-auto px-6 py-6">
          <Logo size = "md" className = "justify-center" />
        </div>
      </div>

      <div className = "max-w-7xl mx-auto px-6 py-12">
        <div className = "text-center mb-12">
          <h1 className = "text-4xl font-medium mb-4">셔틀플레이 페이지 갤러리</h1>
          <p className = "text-xl text-muted-foreground">
            전체 화면 구조를 확인하고 테스트하세요
          </p>
        </div>

        <div className = "space-y-12">
          {/* Desktop Pages */}
          <div>
            <div className = "flex items-center gap-4 mb-8">
              <div className = "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Monitor className = "w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className = "text-3xl font-medium">데스크탑 화면</h2>
                <p className = "text-muted-foreground">운영자 및 관리 기능 중심</p>
              </div>
              <Badge className = "ml-auto bg-primary text-primary-foreground">
                {desktopPages.length}개
              </Badge>
            </div>

            <div className = "grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {desktopPages.map((page, idx) => (
                <Link key = {idx} to = {page.path}>
                  <div className = "bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition-all hover:shadow-xl group">
                    <div className = "flex items-start justify-between mb-4">
                      <div className = "flex-1">
                        <h3 className = "text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                          {page.name}
                        </h3>
                        <p className = "text-sm text-muted-foreground line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight className = "w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
                    </div>
                    <div className = "pt-4 border-t border-border">
                      <Button size = "sm" className = "w-full rounded-full" onClick = {(e) => {
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
            <div className = "flex items-center gap-4 mb-8">
              <div className = "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className = "w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className = "text-3xl font-medium">모바일 화면</h2>
                <p className = "text-muted-foreground">참가자 경험 중심</p>
              </div>
              <Badge className = "ml-auto bg-primary text-primary-foreground">
                {mobilePages.length}개
              </Badge>
            </div>

            <div className = "grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mobilePages.map((page, idx) => (
                <Link key = {idx} to = {page.path}>
                  <div className = "bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition-all hover:shadow-xl group">
                    <div className = "flex items-start justify-between mb-4">
                      <div className = "flex-1">
                        <h3 className = "text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                          {page.name}
                        </h3>
                        <p className = "text-sm text-muted-foreground line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight className = "w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
                    </div>
                    <div className = "pt-4 border-t border-border">
                      <Button size = "sm" variant = "outline" className = "w-full rounded-full" onClick = {(e) => {
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

          {/* Large Display */}
          <div>
            <div className = "flex items-center gap-4 mb-8">
              <div className = "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tv className = "w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className = "text-3xl font-medium">큰 화면</h2>
                <p className = "text-muted-foreground">체육관 대형 디스플레이</p>
              </div>
              <Badge className = "ml-auto bg-primary text-primary-foreground">
                {largeDisplayPages.length}개
              </Badge>
            </div>

            <div className = "grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {largeDisplayPages.map((page, idx) => (
                <Link key = {idx} to = {page.path}>
                  <div className = "bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition-all hover:shadow-xl group">
                    <div className = "flex items-start justify-between mb-4">
                      <div className = "flex-1">
                        <h3 className = "text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                          {page.name}
                        </h3>
                        <p className = "text-sm text-muted-foreground line-clamp-2">
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight className = "w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
                    </div>
                    <div className = "pt-4 border-t border-border">
                      <Button size = "sm" variant = "outline" className = "w-full rounded-full" onClick = {(e) => {
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

        <div className = "mt-12 bg-gradient-to-br from-secondary/50 to-transparent rounded-3xl p-8 border border-border text-center">
          <h3 className = "text-xl font-medium mb-3">총 {desktopPages.length + mobilePages.length + largeDisplayPages.length}개 화면</h3>
          <p className = "text-muted-foreground mb-6">
            데스크탑, 모바일, 큰 화면용 레이아웃이 각각 구현되었습니다
          </p>
          <Link to = "/">
            <Button className = "rounded-full">
              메인으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
