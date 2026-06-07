import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Calendar, Clock, Play, Settings, Users } from 'lucide-react';
import { useState } from 'react';

export default function CreateSessionPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '6월 3일 (화) 운동',
    date: '2026-06-03',
    startTime: '19:00',
    endTime: '22:00',
    courts: '4',
    sessionType: 'regular',
    matchType: 'mixed',
    playStyle: 'competitive',
    quickAddMembers: true,
    allowGuestJoin: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/sessions/demo/dashboard`);
  };

  return (
    <div className = "min-h-screen bg-background">
      <div className = "border-b border-border bg-card">
        <div className = "max-w-4xl mx-auto px-4 md:px-8 py-4">
          <Link to = {`/groups/${groupId}`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className = "w-4 h-4" />
            모임으로 돌아가기
          </Link>
        </div>
      </div>

      <div className = "max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className = "text-center mb-12">
          <div className = "w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center mb-6">
            <Calendar className = "w-10 h-10 text-primary" />
          </div>
          <h1 className = "text-4xl font-medium mb-3">세션 만들기</h1>
          <p className = "text-lg text-muted-foreground">
            오늘의 배드민턴 세션 정보를 입력하세요
          </p>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <form onSubmit = {handleSubmit} className = "space-y-8">
            {/* 기본 정보 */}
            <div>
              <h2 className = "text-xl font-medium mb-6 flex items-center gap-3">
                <div className = "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className = "w-4 h-4 text-primary" />
                </div>
                기본 정보
              </h2>

              <div className = "space-y-6">
                <div className = "space-y-2">
                  <Label htmlFor = "session-name">세션명 *</Label>
                  <Input id = "session-name" type = "text" placeholder = "예: 6월 3일 일요일 운동" className = "rounded-xl h-12" value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className = "grid md:grid-cols-3 gap-4">
                  <div className = "space-y-2 md:col-span-1">
                    <Label htmlFor = "date">날짜 *</Label>
                    <Input id = "date" type = "date" className = "rounded-xl h-12" value = {formData.date} onChange = {(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className = "space-y-2">
                    <Label htmlFor = "start-time">시작 시간 *</Label>
                    <div className = "relative">
                      <Clock className = "absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id = "start-time" type = "time" className = "rounded-xl h-12 pl-11" value = {formData.startTime} onChange = {(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className = "space-y-2">
                    <Label htmlFor = "end-time">종료 시간 *</Label>
                    <div className = "relative">
                      <Clock className = "absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id = "end-time" type = "time" className = "rounded-xl h-12 pl-11" value = {formData.endTime} onChange = {(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className = "space-y-2">
                  <Label htmlFor = "session-type">세션 구분</Label>
                  <Select value = {formData.sessionType} onValueChange = {(value) => setFormData({ ...formData, sessionType: value })}
                  >
                    <SelectTrigger id = "session-type" className = "rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value = "regular">정기 운동</SelectItem>
                      <SelectItem value = "casual">번개 운동</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className = "space-y-2">
                  <Label htmlFor = "courts">코트 수 *</Label>
                  <Select value = {formData.courts} onValueChange = {(value) => setFormData({ ...formData, courts: value })}
                  >
                    <SelectTrigger id = "courts" className = "rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value = "1">1개</SelectItem>
                      <SelectItem value = "2">2개</SelectItem>
                      <SelectItem value = "3">3개</SelectItem>
                      <SelectItem value = "4">4개</SelectItem>
                      <SelectItem value = "5">5개</SelectItem>
                      <SelectItem value = "6">6개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 경기 설정 */}
            <div className = "border-t border-border pt-8">
              <h2 className = "text-xl font-medium mb-6 flex items-center gap-3">
                <div className = "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className = "w-4 h-4 text-primary" />
                </div>
                경기 설정
              </h2>

              <div className = "space-y-6">
                <div className = "space-y-2">
                  <Label htmlFor = "match-type">기본 경기 유형</Label>
                  <Select value = {formData.matchType} onValueChange = {(value) => setFormData({ ...formData, matchType: value })}
                  >
                    <SelectTrigger id = "match-type" className = "rounded-xl h-12">
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
                  <Label htmlFor = "play-style">기본 플레이 스타일</Label>
                  <Select value = {formData.playStyle} onValueChange = {(value) => setFormData({ ...formData, playStyle: value })}
                  >
                    <SelectTrigger id = "play-style" className = "rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                  <SelectContent>
                      <SelectItem value = "casual">즐겜</SelectItem>
                      <SelectItem value = "competitive">빡겜</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className = "text-sm text-muted-foreground">
                    빡겜은 MMR 밸런스를 더 강하게 보고, 즐겜은 대기 시간과 중복 조합을 더 크게 봅니다
                  </p>
                </div>

                <div className = "grid md:grid-cols-2 gap-4">
                  <div className = "rounded-2xl border border-border p-5 flex items-center justify-between">
                    <div className = "flex items-center gap-3">
                      <Users className = "w-5 h-5 text-primary" />
                      <div>
                        <p className = "font-medium">기존 멤버 빠른 추가</p>
                        <p className = "text-sm text-muted-foreground">모임 멤버를 오늘 세션 후보로 불러옵니다</p>
                      </div>
                    </div>
                    <Switch checked = {formData.quickAddMembers} onCheckedChange = {(checked) => setFormData({ ...formData, quickAddMembers: checked })}
                    />
                  </div>

                  <div className = "rounded-2xl border border-border p-5 flex items-center justify-between">
                    <div>
                      <p className = "font-medium">비회원 링크 참여</p>
                      <p className = "text-sm text-muted-foreground">QR 또는 공유 링크로 게스트 참가를 허용합니다</p>
                    </div>
                    <Switch checked = {formData.allowGuestJoin} onCheckedChange = {(checked) => setFormData({ ...formData, allowGuestJoin: checked })}
                    />
                  </div>
                </div>

                <div className = "bg-secondary/30 rounded-2xl p-6">
                  <h3 className = "font-medium mb-3">세션을 만들면</h3>
                  <ul className = "space-y-2 text-sm text-muted-foreground">
                    <li className = "flex items-start gap-2">
                      <div className = "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>참가자를 초대하고 출석을 관리할 수 있어요</span>
                    </li>
                    <li className = "flex items-start gap-2">
                      <div className = "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>자동 매칭으로 빠르게 경기를 시작할 수 있어요</span>
                    </li>
                    <li className = "flex items-start gap-2">
                      <div className = "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>경기 결과를 입력하고 MMR을 자동 계산해요</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className = "border-t border-border pt-8 flex gap-4">
              <Link to = {`/groups/${groupId}`} className = "flex-1">
                <Button type = "button" variant = "outline" className = "w-full rounded-full h-12" size = "lg"
                >
                  취소
                </Button>
              </Link>
              <Button type = "submit" className = "flex-1 rounded-full h-12 shadow-lg shadow-primary/20" size = "lg"
              >
                <Play className = "w-5 h-5 mr-2" />
                세션 만들기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
