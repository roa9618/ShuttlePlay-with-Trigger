import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Sparkles, RefreshCw, Edit, Plus, ShieldAlert, Users } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function MatchQueuePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);
  const { message, showMessage } = useActionFeedback();

  const queue = [
    {
      teamA: ['김민수', '박지영'],
      teamB: ['이준호', '최서연'],
      mmrDiff: 12,
      balance: '매우 좋음',
      reason: 'MMR이 균형있게 분배되었습니다',
      details: ['혼복 MMR 차이 12', '연속 휴식 2회 참가자 우선', '파트너 중복 없음'],
    },
    {
      teamA: ['정민재', '강수진'],
      teamB: ['오유진', '한지우'],
      mmrDiff: 25,
      balance: '좋음',
      reason: '최근 경기 횟수를 고려한 매칭입니다',
      details: ['총 경기 수가 적은 참가자 포함', '성별 보정 적용', '상대 중복 1회 이하'],
    },
    {
      teamA: ['송민호', '윤서아'],
      teamB: ['장현우', '김나영'],
      mmrDiff: 8,
      balance: '매우 좋음',
      reason: '실력이 비슷한 선수들끼리 매칭되었습니다',
      details: ['B-C 구간 중심', '신규 참가자 첫 경기 보호', '팀 예상 승률 51:49'],
    },
  ];

  return (
    <div className = "min-h-screen bg-background">
      <div className = "border-b border-border bg-card">
        <div className = "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className = "flex items-center gap-6">
            <Link to = {`/sessions/${sessionId}/dashboard`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className = "w-4 h-4" />
              대시보드
            </Link>
            <Logo size = "sm" />
          </div>
          <div className = "flex gap-2">
            <Button className = "rounded-full gap-2" onClick = {() => showMessage('자동 매칭 후보를 다시 생성했습니다.')}
            >
              <Sparkles className = "w-4 h-4" />
              자동 매칭 생성
            </Button>
          </div>
        </div>
      </div>

      <div className = "max-w-7xl mx-auto px-6 py-8">
        <div className = "mb-8">
          <h1 className = "text-4xl font-medium mb-2">경기 후보 큐</h1>
          <p className = "text-muted-foreground">
            다음 경기 후보를 확인하고 시작하세요
          </p>
        </div>

        <div className = "grid lg:grid-cols-[0.9fr_1.1fr] gap-6 mb-8">
          <div className = "bg-card border border-border rounded-3xl p-6 space-y-5">
            <div className = "flex items-center gap-3">
              <Sparkles className = "w-5 h-5 text-primary" />
              <h2 className = "text-2xl font-medium">생성 조건</h2>
            </div>
            <div className = "grid sm:grid-cols-2 gap-4">
              <div className = "space-y-2">
                <Label>경기 유형</Label>
                <Select defaultValue = "mixed">
                  <SelectTrigger className = "rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "mens">남자 복식</SelectItem>
                    <SelectItem value = "womens">여자 복식</SelectItem>
                    <SelectItem value = "mixed">혼합 복식</SelectItem>
                    <SelectItem value = "open">성별 무관</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className = "space-y-2">
                <Label>운영 성향</Label>
                <Select defaultValue = "competitive">
                  <SelectTrigger className = "rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "casual">즐겜</SelectItem>
                    <SelectItem value = "competitive">빡겜</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className = "grid sm:grid-cols-3 gap-3">
              <Input className = "rounded-xl" defaultValue = "연속 경기 2회 제한" />
              <Input className = "rounded-xl" defaultValue = "중복 조합 회피" />
              <Input className = "rounded-xl" defaultValue = "신규 참가자 보호" />
            </div>
            <div className = "flex flex-wrap gap-2">
              <Button className = "rounded-full gap-2" onClick = {() => showMessage('전체 후보를 생성했습니다.')}>
                <Sparkles className = "w-4 h-4" />
                전체 후보 생성
              </Button>
              <Button variant = "outline" className = "rounded-full gap-2" onClick = {() => showMessage('선택 후보를 재생성했습니다.')}>
                <RefreshCw className = "w-4 h-4" />
                선택 후보만 재생성
              </Button>
            </div>
          </div>

          <div className = "bg-card border border-border rounded-3xl p-6 space-y-5">
            <div className = "flex items-center gap-3">
              <Users className = "w-5 h-5 text-primary" />
              <h2 className = "text-2xl font-medium">수동 조정</h2>
            </div>
            <div className = "grid sm:grid-cols-2 gap-3">
              {['강제 포함', '강제 제외', '고정 파트너', '회피 조합'].map((label) => (
                <Button key = {label} variant = "outline" className = {`rounded-xl justify-start gap-2 h-12 ${selectedAdjustments.includes(label) ? 'border-primary bg-primary/5' : ''}`} onClick = {() => {
                    setSelectedAdjustments((prev) => prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]);
                    showMessage(`${label} 조건을 ${selectedAdjustments.includes(label) ? '해제했습니다.' : '추가했습니다.'}`);
                  }}
                >
                  <Plus className = "w-4 h-4" />
                  {label} 추가
                </Button>
              ))}
            </div>
            <div className = "rounded-2xl bg-secondary/40 p-4">
              <div className = "flex items-start gap-3">
                <ShieldAlert className = "w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className = "font-medium">매칭 실패 없음</p>
                  <p className = "text-sm text-muted-foreground">
                    조건이 맞지 않는 참가자는 실패 처리하지 않고 대기 상태로 남기며, 다음 코트가 열릴 때 다시 후보에 넣습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className = "space-y-4">
          {queue.map((match, idx) => (
            <div key = {idx} className = "bg-card border border-border rounded-2xl p-6">
              <div className = "flex items-start justify-between mb-6">
                <div className = "flex-1">
                  <div className = "flex items-center gap-4 mb-4">
                    <Badge className = "bg-primary text-primary-foreground">
                      후보 {idx + 1}
                    </Badge>
                    <Badge variant = "outline" className = {
                      match.balance === '매우 좋음'
                        ? 'border-primary text-primary'
                        : 'border-accent text-accent-foreground'
                    }>
                      팀 밸런스: {match.balance}
                    </Badge>
                    <Badge variant = "outline">
                      MMR 차이 {match.mmrDiff}
                    </Badge>
                  </div>

                  <div className = "grid grid-cols-3 gap-6 items-center">
                    <div className = "bg-secondary rounded-xl p-4">
                      <p className = "text-xs text-muted-foreground mb-2">A팀</p>
                      <div className = "space-y-2">
                        {match.teamA.map((player, pIdx) => (
                          <div key = {pIdx} className = "flex items-center gap-2">
                            <div className = "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className = "text-xs font-medium text-primary">
                                {player[0]}
                              </span>
                            </div>
                            <span className = "font-medium">{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className = "text-center">
                      <span className = "text-2xl font-medium text-muted-foreground">vs</span>
                    </div>

                    <div className = "bg-secondary rounded-xl p-4">
                      <p className = "text-xs text-muted-foreground mb-2">B팀</p>
                      <div className = "space-y-2">
                        {match.teamB.map((player, pIdx) => (
                          <div key = {pIdx} className = "flex items-center gap-2">
                            <div className = "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className = "text-xs font-medium text-primary">
                                {player[0]}
                              </span>
                            </div>
                            <span className = "font-medium">{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className = "mt-4 bg-secondary/50 rounded-xl p-4">
                    <p className = "text-sm text-muted-foreground">
                      <span className = "font-medium text-foreground">매칭 설명:</span> {match.reason}
                    </p>
                    <div className = "flex flex-wrap gap-2 mt-3">
                      {match.details.map((detail) => (
                        <Badge key = {detail} variant = "outline">{detail}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className = "flex flex-col gap-3 ml-6">
                  <Button className = "rounded-full whitespace-nowrap" onClick = {() => {
                      navigate(`/sessions/${sessionId}/current`);
                    }}
                  >
                    경기 시작
                  </Button>
                  <Button variant = "outline" size = "sm" className = "rounded-full gap-2" onClick = {() => showMessage(`후보 ${idx + 1} 참가자 교체 모드를 열었습니다.`)}
                  >
                    <Edit className = "w-4 h-4" />
                    참가자 교체
                  </Button>
                  <Button variant = "outline" size = "sm" className = "rounded-full gap-2" onClick = {() => showMessage(`후보 ${idx + 1}의 A/B팀을 교체했습니다.`)}
                  >
                    팀 교체
                  </Button>
                  <Button variant = "outline" size = "sm" className = "rounded-full gap-2" onClick = {() => showMessage(`후보 ${idx + 1}을 재생성했습니다.`)}
                  >
                    <RefreshCw className = "w-4 h-4" />
                    재생성
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {queue.length === 0 && (
          <div className = "bg-secondary rounded-2xl p-12 text-center">
            <Sparkles className = "w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className = "font-medium mb-2">경기 후보가 없습니다</h3>
            <p className = "text-muted-foreground mb-6">
              자동 매칭을 사용하여 새로운 경기를 생성하세요
            </p>
            <Button className = "rounded-full gap-2" onClick = {() => showMessage('자동 매칭 후보를 생성했습니다.')}
            >
              <Sparkles className = "w-4 h-4" />
              자동 매칭 생성
            </Button>
          </div>
        )}
        {message && (
          <div className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-5 py-3 shadow-xl text-sm font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
