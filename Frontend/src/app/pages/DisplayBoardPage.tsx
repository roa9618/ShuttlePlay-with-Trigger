import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { QrCode } from 'lucide-react';

export default function DisplayBoardPage() {
  const currentMatches = [
    {
      court: 1,
      teamA: ['김민수', '박지영'],
      teamB: ['이준호', '최서연'],
    },
    {
      court: 2,
      teamA: ['정민재', '강수진'],
      teamB: ['오유진', '한지우'],
    },
    {
      court: 3,
      teamA: ['송민호', '윤서아'],
      teamB: ['장현우', '김나영'],
    },
    {
      court: 4,
      teamA: ['최지훈', '서예린'],
      teamB: ['박준영', '이수민'],
    },
  ];

  const nextMatches = [
    {
      teamA: ['강태양', '문별이'],
      teamB: ['임나윤', '조유진'],
    },
    {
      teamA: ['백승호', '신지원'],
      teamB: ['홍예슬', '안준서'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 p-8">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="lg" />
            <div>
              <h1 className="text-3xl mb-1">6월 3일 (화) 운동</h1>
              <p className="text-xl text-muted-foreground">19:00 - 22:00</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-medium text-primary">21:24</p>
            <p className="text-lg text-muted-foreground">현재 시간</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-4xl">현재 경기</h2>
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
              진행 중
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {currentMatches.map((match) => (
              <div
                key={match.court}
                className="bg-card border-2 border-border rounded-3xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
                    <span className="text-4xl font-medium text-primary-foreground">
                      {match.court}
                    </span>
                  </div>
                  <p className="text-3xl font-medium">번 코트</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-secondary rounded-2xl p-6">
                    <p className="text-lg text-muted-foreground mb-4">A팀</p>
                    <div className="space-y-3">
                      {match.teamA.map((player, idx) => (
                        <p key={idx} className="text-3xl font-medium">
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-4xl font-medium text-muted-foreground">vs</span>
                  </div>

                  <div className="bg-secondary rounded-2xl p-6">
                    <p className="text-lg text-muted-foreground mb-4">B팀</p>
                    <div className="space-y-3">
                      {match.teamB.map((player, idx) => (
                        <p key={idx} className="text-3xl font-medium">
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-4xl mb-6">다음 경기</h2>

          <div className="grid grid-cols-2 gap-6">
            {nextMatches.map((match, idx) => (
              <div
                key={idx}
                className="bg-card/50 border border-border rounded-3xl p-8"
              >
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <div className="space-y-2">
                      {match.teamA.map((player, pIdx) => (
                        <p key={pIdx} className="text-xl font-medium">
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-3xl font-medium text-muted-foreground">vs</span>
                  </div>

                  <div className="bg-secondary/50 rounded-xl p-4">
                    <div className="space-y-2">
                      {match.teamB.map((player, pIdx) => (
                        <p key={pIdx} className="text-xl font-medium">
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent/20 border-2 border-accent rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <QrCode className="w-16 h-16 text-accent-foreground" />
              <div>
                <h3 className="text-3xl font-medium text-accent-foreground mb-2">
                  참여하기
                </h3>
                <p className="text-xl text-accent-foreground/80">
                  QR 코드를 스캔하여 오늘 운동에 참여하세요
                </p>
              </div>
            </div>
            <div className="w-32 h-32 bg-card rounded-2xl flex items-center justify-center">
              <QrCode className="w-20 h-20 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
