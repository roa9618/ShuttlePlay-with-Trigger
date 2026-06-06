import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, User, Bell, Palette, LogOut, Wifi, Smartphone } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function SettingsPage() {
  const { message, showMessage } = useActionFeedback();
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="px-4 py-6">
        <Logo size="sm" className="justify-center" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          홈으로
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-medium mb-3">설정</h1>
          <p className="text-muted-foreground">
            프로필과 서비스 설정을 관리하세요
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-medium">프로필 설정</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-4xl font-medium text-primary">김</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  defaultValue="김민수"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="minsu@example.com"
                  className="rounded-xl"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">성별</Label>
                  <Select defaultValue="male">
                    <SelectTrigger id="gender" className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">나이대</Label>
                  <Select defaultValue="30s">
                    <SelectTrigger id="age" className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20s">20대</SelectItem>
                      <SelectItem value="30s">30대</SelectItem>
                      <SelectItem value="40s">40대</SelectItem>
                      <SelectItem value="50s">50대</SelectItem>
                      <SelectItem value="60s">60대 이상</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">급수</Label>
                <Select defaultValue="B">
                  <SelectTrigger id="level" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="SS">SS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-medium">알림 설정</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">다음 경기 알림</p>
                  <p className="text-sm text-muted-foreground">
                    내 차례가 되면 알림을 받습니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">세션 시작 알림</p>
                  <p className="text-sm text-muted-foreground">
                    오늘 세션이 시작될 때 알림을 받습니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">결과 입력 알림</p>
                  <p className="text-sm text-muted-foreground">
                    경기 결과 입력이 필요할 때 알림을 받습니다
                  </p>
                </div>
                <Switch />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {['상단 배너', '토스트', '모달', '소리', '진동', '다음 경기 카드 강조'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <span className="text-sm">{item}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Smartphone className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-medium">PWA·푸시 설정</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-secondary/40 p-5">
                <p className="font-medium mb-1">홈 화면 설치</p>
                <p className="text-sm text-muted-foreground mb-4">앱 설치 없이 홈 화면에서 바로 실행합니다.</p>
                <Button variant="outline" className="rounded-full" onClick={() => setInstallGuideOpen((open) => !open)}>
                  설치 안내 보기
                </Button>
                {installGuideOpen && (
                  <p className="text-sm text-muted-foreground mt-3">
                    브라우저 공유 메뉴에서 홈 화면에 추가를 선택하면 바로 실행할 수 있습니다.
                  </p>
                )}
              </div>
              <div className="rounded-2xl bg-secondary/40 p-5">
                <p className="font-medium mb-1">푸시 알림 권한</p>
                <p className="text-sm text-muted-foreground mb-4">다음 경기, 경기 시작, 출석 요청을 받습니다.</p>
                <Button className="rounded-full" onClick={() => showMessage('푸시 알림 권한을 요청했습니다.')}>
                  권한 요청
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Wifi className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-medium">실시간 동기화</h2>
            </div>

            <div className="space-y-3">
              {[
                ['초기 데이터', 'REST로 최근 세션 상태를 불러옴', '정상'],
                ['WebSocket', '출석, 상태, 매칭 큐, 결과 변경 이벤트 수신', '연결됨'],
                ['재연결', '연결이 끊기면 REST 재동기화 후 재구독', '대기'],
                ['폴링 대체', 'WebSocket 장애 시 주기적으로 상태 갱신', '꺼짐'],
              ].map(([title, desc, status]) => (
                <div key={title} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-medium">테마 설정</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">테마</Label>
              <Select defaultValue="light">
                <SelectTrigger id="theme" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">라이트 모드</SelectItem>
                  <SelectItem value="dark">다크 모드</SelectItem>
                  <SelectItem value="auto">시스템 설정</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-8 border-t border-border space-y-4">
            {message && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm text-primary">
                {message}
              </div>
            )}
            <Button className="w-full rounded-full" size="lg" onClick={() => showMessage('변경사항을 저장했습니다.')}>
              변경사항 저장
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-full gap-2 text-destructive hover:text-destructive"
              size="lg"
              onClick={() => showMessage('로그아웃했습니다.')}
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
