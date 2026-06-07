import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Play, CheckCircle, Clock, QrCode, Monitor, Sparkles, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';

export default function OrganizerDashboardPage() {
  const { sessionId } = useParams();
  const { message, showMessage } = useActionFeedback();
  const [lateParticipants, setLateParticipants] = useState([
    { name: '정민재', eta: '19:40', reason: '퇴근 지연', status: '지각 예정' },
    { name: '문별이', eta: '19:50', reason: '대중교통 지연', status: '지각 예정' },
  ]);

  const currentMatches = [
    { court: 1, teamA: ['김민수', '박지영'], teamB: ['이준호', '최서연'] },
    { court: 2, teamA: ['정민재', '강수진'], teamB: ['오유진', '한지우'] },
    { court: 3, teamA: ['송민호', '윤서아'], teamB: ['장현우', '김나영'] },
    { court: 4, teamA: ['최지훈', '서예린'], teamB: ['박준영', '이수민'] },
  ];

  const matchQueue = [
    { teamA: ['강태양', '문별이'], teamB: ['임나윤', '조유진'], mmr: 12 },
    { teamA: ['백승호', '신지원'], teamB: ['홍예슬', '안준서'], mmr: 8 },
  ];

  const pendingResults = [
    { court: 1, players: '김민수/박지영 vs 이준호/최서연' },
    { court: 3, players: '송민호/윤서아 vs 장현우/김나영' },
  ];

  return (
    <div className = "min-h-screen bg-background">
      {/* Sticky Header */}
      <div className = "border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className = "px-6 py-4 flex items-center justify-between">
          <div className = "flex items-center gap-4">
            <Logo size = "sm" />
            <div className = "h-6 w-px bg-border" />
            <div>
              <h1 className = "text-lg font-medium">6월 3일 (화) 저녁 운동</h1>
              <p className = "text-sm text-muted-foreground">19:00 - 22:00</p>
            </div>
          </div>
          <div className = "flex items-center gap-2">
            <Link to = {`/sessions/${sessionId}/display`}>
              <Button variant = "outline" size = "sm" className = "rounded-full gap-2">
                <Monitor className = "w-4 h-4" />
                큰 화면
              </Button>
            </Link>
          <Button variant = "outline" size = "sm" className = "rounded-full gap-2" onClick = {() => showMessage('초대 QR을 준비했습니다.')}
          >
              <QrCode className = "w-4 h-4" />
              초대 QR
            </Button>
            <Button variant = "destructive" size = "sm" className = "rounded-full" onClick = {() => showMessage('세션 종료 전 확인이 필요합니다.')}>
              종료
            </Button>
          </div>
        </div>

        <div className = "grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            ['미출석', '1명'],
            ['불참', '1명'],
            ['경기 가능', '6명'],
            ['일시 휴식', '2명'],
            ['퇴장', '0명'],
            ['결과 미입력', '2경기'],
          ].map(([label, value]) => (
            <div key = {label} className = "bg-card border border-border rounded-xl p-4">
              <p className = "text-xs text-muted-foreground">{label}</p>
              <p className = "text-xl font-medium mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className = "p-6">
        <div className = "bg-card border-2 border-primary/20 rounded-3xl p-6 mb-6">
          <div className = "flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className = "text-2xl font-medium">오늘 운영</h2>
              <p className = "text-muted-foreground">왼쪽부터 차례대로 진행합니다.</p>
            </div>
            <Badge className = "bg-primary text-primary-foreground">진행 중</Badge>
          </div>
          <div className = "grid md:grid-cols-3 gap-4">
            <Link to = {`/sessions/${sessionId}/participants`}>
              <div className = "h-full rounded-2xl border border-border bg-secondary/30 p-5 hover:border-primary transition-colors">
                <div className = "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium mb-4">1</div>
                <h3 className = "text-xl font-medium mb-2">출석 확인</h3>
                <p className = "text-sm text-muted-foreground">도착, 지각, 휴식 상태를 정리합니다.</p>
              </div>
            </Link>
            <Link to = {`/sessions/${sessionId}/queue`}>
              <div className = "h-full rounded-2xl border border-border bg-secondary/30 p-5 hover:border-primary transition-colors">
                <div className = "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium mb-4">2</div>
                <h3 className = "text-xl font-medium mb-2">경기 만들기</h3>
                <p className = "text-sm text-muted-foreground">후보를 확인하고 코트에 배정합니다.</p>
              </div>
            </Link>
            <Link to = {`/sessions/${sessionId}/result/new`}>
              <div className = "h-full rounded-2xl border border-border bg-secondary/30 p-5 hover:border-primary transition-colors">
                <div className = "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium mb-4">3</div>
                <h3 className = "text-xl font-medium mb-2">결과 입력</h3>
                <p className = "text-sm text-muted-foreground">끝난 경기의 승패와 점수를 저장합니다.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 1. 세션 상태 요약 - 가장 먼저 */}
        <div className = "grid grid-cols-5 gap-4 mb-6">
          <div className = "bg-card border-2 border-primary/30 rounded-2xl p-5">
            <div className = "flex items-center gap-3 mb-3">
              <UserCheck className = "w-5 h-5 text-primary" />
              <p className = "text-sm font-medium">출석</p>
            </div>
            <p className = "text-3xl font-medium">14명</p>
            <p className = "text-xs text-muted-foreground mt-1">전체 16명</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-5">
            <div className = "flex items-center gap-3 mb-3">
              <Play className = "w-5 h-5 text-primary" />
              <p className = "text-sm font-medium">경기 중</p>
            </div>
            <p className = "text-3xl font-medium">8명</p>
            <p className = "text-xs text-muted-foreground mt-1">4개 코트</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-5">
            <div className = "flex items-center gap-3 mb-3">
              <Clock className = "w-5 h-5 text-muted-foreground" />
              <p className = "text-sm font-medium">대기 중</p>
            </div>
            <p className = "text-3xl font-medium">6명</p>
            <p className = "text-xs text-muted-foreground mt-1">다음 순서</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-5">
            <div className = "flex items-center gap-3 mb-3">
              <UserX className = "w-5 h-5 text-accent-foreground" />
              <p className = "text-sm font-medium">지각</p>
            </div>
            <p className = "text-3xl font-medium">2명</p>
            <p className = "text-xs text-muted-foreground mt-1">10분 내 도착</p>
          </div>

          <div className = "bg-card border border-border rounded-2xl p-5">
            <div className = "flex items-center gap-3 mb-3">
              <CheckCircle className = "w-5 h-5 text-primary" />
              <p className = "text-sm font-medium">완료 경기</p>
            </div>
            <p className = "text-3xl font-medium">12개</p>
            <p className = "text-xs text-muted-foreground mt-1">평균 3회/명</p>
          </div>
        </div>

        {/* 2. 빠른 액션 바 */}
        <div className = "bg-secondary/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <p className = "text-sm font-medium mr-2">빠른 작업:</p>
          <Link to = {`/sessions/${sessionId}/queue`}>
            <Button className = "rounded-full gap-2">
              <Sparkles className = "w-4 h-4" />
              자동 매칭 생성
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/participants`}>
            <Button variant = "outline" className = "rounded-full">
              출석 처리
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/participants`}>
            <Button variant = "outline" className = "rounded-full">
              지각자 확인
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/queue`}>
            <Button variant = "outline" className = "rounded-full">
              후보 수정
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/report`}>
            <Button variant = "outline" className = "rounded-full">
              세션 리포트
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/participants`}>
            <Button variant = "outline" className = "rounded-full gap-2">
              <Users className = "w-4 h-4" />
              참가자 관리
            </Button>
          </Link>
        </div>

        <div className = "grid grid-cols-3 gap-6">
          {/* Left: 현재 경기 + 다음 큐 */}
          <div className = "col-span-2 space-y-6">
            {/* 3. 현재 진행 중 경기 */}
            <div>
              <div className = "flex items-center justify-between mb-4">
                <h2 className = "text-xl font-medium">현재 경기</h2>
                <Link to = {`/sessions/${sessionId}/current`}>
                  <Button variant = "ghost" size = "sm" className = "text-primary">
                    상세보기
                  </Button>
                </Link>
              </div>

              <div className = "grid grid-cols-2 gap-4">
                {currentMatches.map((match) => (
                  <div key = {match.court} className = "bg-card border border-border rounded-2xl p-5">
                    <div className = "flex items-center justify-between mb-4">
                      <Badge className = "bg-primary text-primary-foreground">
                        {match.court}번 코트
                      </Badge>
                      <Badge variant = "outline" className = "text-xs">복식</Badge>
                    </div>

                    <div className = "space-y-2 mb-4">
                      <div className = "text-sm">
                        <p className = "font-medium">{match.teamA.join(' · ')}</p>
                      </div>
                      <p className = "text-center text-xs text-muted-foreground">vs</p>
                      <div className = "text-sm">
                        <p className = "font-medium">{match.teamB.join(' · ')}</p>
                      </div>
                    </div>

                    <div className = "grid grid-cols-2 gap-2">
                      <Link to = {`/sessions/${sessionId}/result/new`}>
                        <Button size = "sm" variant = "outline" className = "w-full rounded-lg">
                          결과 입력
                        </Button>
                      </Link>
                      <Link to = {`/sessions/${sessionId}/result/${match.court}/edit`}>
                        <Button size = "sm" variant = "ghost" className = "w-full rounded-lg">
                          수정
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 다음 경기 후보 큐 */}
            <div>
              <div className = "flex items-center justify-between mb-4">
                <h2 className = "text-xl font-medium">다음 경기 후보</h2>
                <div className = "flex gap-2">
                  <Link to = {`/sessions/${sessionId}/queue`}>
                    <Button variant = "ghost" size = "sm" className = "text-primary">
                      전체보기
                    </Button>
                  </Link>
                  <Link to = {`/sessions/${sessionId}/queue`}>
                    <Button size = "sm" className = "rounded-full gap-2">
                    <Sparkles className = "w-4 h-4" />
                    자동 생성
                    </Button>
                  </Link>
                </div>
              </div>

              <div className = "space-y-3">
                {matchQueue.map((match, idx) => (
                  <div key = {idx} className = "bg-card border border-border rounded-2xl p-4">
                    <div className = "flex items-center justify-between">
                      <div className = "flex items-center gap-3 flex-1">
                        <Badge variant = "outline">후보 {idx + 1}</Badge>
                        <div className = "text-sm">
                          <span className = "font-medium">{match.teamA.join(' · ')}</span>
                          <span className = "text-muted-foreground mx-2">vs</span>
                          <span className = "font-medium">{match.teamB.join(' · ')}</span>
                        </div>
                        <Badge variant = "outline" className = "text-xs">MMR +{match.mmr}</Badge>
                      </div>
                      <Link to = {`/sessions/${sessionId}/current`}>
                        <Button size = "sm" className = "rounded-full">
                          시작
                        </Button>
                      </Link>
                      <Link to = {`/sessions/${sessionId}/queue`}>
                        <Button size = "sm" variant = "outline" className = "rounded-full">
                          교체
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}

                {matchQueue.length === 0 && (
                  <div className = "bg-secondary/20 rounded-2xl p-8 text-center">
                    <p className = "text-muted-foreground mb-3">경기 후보가 없습니다</p>
                    <Link to = {`/sessions/${sessionId}/queue`}>
                      <Button size = "sm" className = "rounded-full gap-2">
                      <Sparkles className = "w-4 h-4" />
                      자동 매칭 생성
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: 결과 입력 대기 + 참가자 */}
          <div className = "space-y-6">
            {/* 5. 결과 입력 대기 (눈에 띄게) */}
            {pendingResults.length > 0 && (
              <div className = "bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/40 rounded-2xl p-6">
                <div className = "flex items-center gap-3 mb-4">
                  <AlertCircle className = "w-6 h-6 text-accent-foreground" />
                  <div>
                    <h3 className = "font-medium text-accent-foreground">결과 입력 대기</h3>
                    <p className = "text-sm text-accent-foreground/80">{pendingResults.length}개 경기</p>
                  </div>
                </div>

                <div className = "space-y-2 mb-4">
                  {pendingResults.map((result, idx) => (
                    <div key = {idx} className = "text-sm bg-card/50 rounded-lg p-3">
                      <Badge variant = "outline" className = "mb-1">{result.court}번 코트</Badge>
                      <p className = "text-xs text-muted-foreground">{result.players}</p>
                    </div>
                  ))}
                </div>

                <Link to = {`/sessions/${sessionId}/result/new`}>
                  <Button className = "w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                    지금 입력하기
                  </Button>
                </Link>
              </div>
            )}

            {/* 6. 참가자 간단 목록 */}
            <div className = "bg-card border border-border rounded-2xl p-5">
              <div className = "flex items-center justify-between mb-4">
                <h3 className = "font-medium">참가자</h3>
                <Link to = {`/sessions/${sessionId}/participants`}>
                  <Button variant = "ghost" size = "sm" className = "text-primary -mr-2">
                    관리
                  </Button>
                </Link>
              </div>

              <div className = "space-y-2 max-h-[500px] overflow-y-auto">
                {[
                  { name: '김민수', status: 'playing', court: 1 },
                  { name: '박지영', status: 'playing', court: 1 },
                  { name: '이준호', status: 'waiting' },
                  { name: '최서연', status: 'waiting' },
                  { name: '정민재', status: 'late' },
                  { name: '강수진', status: 'waiting' },
                ].map((p, idx) => (
                  <div key = {idx} className = "flex items-center justify-between py-2">
                    <div className = "flex items-center gap-2">
                      <div className = "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className = "text-xs font-medium text-primary">{p.name[0]}</span>
                      </div>
                      <span className = "text-sm">{p.name}</span>
                    </div>
                    {p.status === 'playing' && (
                      <Badge className = "bg-primary text-primary-foreground text-xs">
                        {p.court}번
                      </Badge>
                    )}
                    {p.status === 'waiting' && (
                      <Badge variant = "outline" className = "text-xs">대기</Badge>
                    )}
                    {p.status === 'late' && (
                      <Badge variant = "outline" className = "text-xs border-accent">지각</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className = "bg-card border border-border rounded-2xl p-5">
              <h3 className = "font-medium mb-4">지각 예정</h3>
              <div className = "space-y-3">
                {lateParticipants.map((late) => (
                  <div key = {late.name} className = "rounded-xl bg-secondary/40 p-4">
                    <div className = "flex items-center justify-between mb-2">
                      <p className = "font-medium">{late.name}</p>
                      <Badge variant = "outline">{late.status === '지각 예정' ? `${late.eta} 도착` : late.status}</Badge>
                    </div>
                    <p className = "text-sm text-muted-foreground mb-3">{late.reason}</p>
                    <div className = "flex gap-2">
                      <Button size = "sm" variant = "outline" className = "rounded-full" onClick = {() => {
                          setLateParticipants((prev) => prev.map((item) => item.name === late.name ? { ...item, status: '도착 완료' } : item));
                          showMessage(`${late.name} 도착 처리했습니다.`);
                        }}
                      >
                        도착 처리
                      </Button>
                      <Button size = "sm" className = "rounded-full" onClick = {() => {
                          setLateParticipants((prev) => prev.map((item) => item.name === late.name ? { ...item, status: '경기 가능' } : item));
                          showMessage(`${late.name}님을 경기 가능 상태로 변경했습니다.`);
                        }}
                      >
                        경기 가능
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-5 py-3 shadow-xl text-sm font-medium z-50">
          {message}
        </div>
      )}
    </div>
  );
}
