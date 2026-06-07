import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { MapPin, Users, Calendar, Share2, Settings, ArrowLeft, QrCode } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();

  const copyInviteLink = async () => {
    const link = `https://shuttleplay.app/groups/${groupId}/invite`;
    await navigator.clipboard?.writeText(link);
    showMessage('초대 링크를 복사했습니다.');
  };

  const recentSessions = [
    { date: '2026.06.01 (일)', time: '14:00-17:00', participants: 16 },
    { date: '2026.05.29 (목)', time: '19:00-22:00', participants: 12 },
    { date: '2026.05.25 (일)', time: '14:00-17:00', participants: 18 },
  ];

  const members = [
    { name: '김민수', level: 'B', sessions: 24 },
    { name: '박지영', level: 'A', sessions: 18 },
    { name: '이준호', level: 'D', sessions: 12 },
    { name: '최서연', level: 'B', sessions: 21 },
  ];

  return (
    <div className = "min-h-screen bg-background">
      <div className = "max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <Link to = "/groups" className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          모임 목록
        </Link>

        {/* Header Card */}
        <div className = "bg-gradient-to-br from-card to-secondary/10 border-2 border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <div className = "flex items-start justify-between mb-8">
            <div className = "flex items-start gap-6">
              <div className = "w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <Users className = "w-10 h-10 text-primary" />
              </div>
              <div className = "space-y-4">
                <div>
                  <h1 className = "text-4xl mb-3">강남 배드민턴 클럽</h1>
                  <div className = "space-y-2 text-muted-foreground">
                    <div className = "flex items-center gap-2">
                      <MapPin className = "w-4 h-4" />
                      <span>강남구민회관</span>
                    </div>
                    <div className = "flex items-center gap-2">
                      <Users className = "w-4 h-4" />
                      <span>멤버 24명</span>
                    </div>
                    <div className = "flex items-center gap-2">
                      <Calendar className = "w-4 h-4" />
                      <span>최근 운동 2일 전</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link to = {`/groups/${groupId}/settings`}>
              <Button variant = "outline" size = "icon" className = "rounded-full flex-shrink-0"
              >
                <Settings className = "w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className = "grid md:grid-cols-2 gap-4">
            <Link to = {`/groups/${groupId}/create-session`} className = "block">
              <Button className = "w-full rounded-full h-12 shadow-lg shadow-primary/20" size = "lg">
                <Calendar className = "w-5 h-5 mr-2" />
                오늘 세션 만들기
              </Button>
            </Link>
            <Button variant = "outline" size = "lg" className = "rounded-full h-12 gap-2" onClick = {copyInviteLink}
            >
              <Share2 className = "w-5 h-5" />
              멤버 초대하기
            </Button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
          <div className = "flex items-center justify-between">
            <h2 className = "text-2xl font-medium">최근 운동 기록</h2>
            <Button variant = "ghost" size = "sm" className = "text-primary" onClick = {() => navigate('/sessions/demo/report')}
            >
              전체 보기
            </Button>
          </div>
          <div className = "grid gap-3">
            {recentSessions.map((session, idx) => (
              <div key = {idx} onClick = {() => navigate('/sessions/demo/report')} className = "bg-gradient-to-r from-secondary/50 to-transparent rounded-2xl p-5 border border-border hover:border-primary transition-all group cursor-pointer"
              >
                <div className = "flex items-center justify-between">
                  <div className = "flex items-center gap-4">
                    <div className = "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className = "w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className = "font-medium text-lg mb-1">{session.date}</p>
                      <p className = "text-sm text-muted-foreground">{session.time}</p>
                    </div>
                  </div>
                  <div className = "flex items-center gap-3">
                    <div className = "text-right">
                      <p className = "text-sm text-muted-foreground">참가 인원</p>
                      <p className = "text-lg font-medium text-primary">{session.participants}명</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
          <div className = "flex items-center justify-between">
            <h2 className = "text-2xl font-medium">멤버 목록</h2>
            <Link to = {`/groups/${groupId}/members`}>
              <Button variant = "ghost" size = "sm" className = "text-primary"
              >
                전체 보기
              </Button>
            </Link>
          </div>
          <div className = "grid md:grid-cols-2 gap-3">
            {members.map((member, idx) => (
              <div key = {idx} className = "bg-gradient-to-r from-secondary/50 to-transparent rounded-2xl p-5 border border-border hover:border-primary transition-all"
              >
                <div className = "flex items-center gap-4">
                  <div className = "w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className = "text-lg font-medium text-primary">
                      {member.name[0]}
                    </span>
                  </div>
                  <div className = "flex-1">
                    <p className = "font-medium text-lg">{member.name}</p>
                    <p className = "text-sm text-muted-foreground">{member.level}</p>
                  </div>
                  <div className = "text-right">
                    <p className = "text-sm text-muted-foreground">참여</p>
                    <p className = "font-medium text-primary">{member.sessions}회</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        <div className = "bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/40 rounded-3xl p-8">
          <div className = "flex items-start gap-6">
            <div className = "w-16 h-16 rounded-2xl bg-accent/30 flex items-center justify-center flex-shrink-0">
              <QrCode className = "w-8 h-8 text-accent-foreground" />
            </div>
            <div className = "flex-1">
              <h3 className = "text-xl font-medium mb-2">새로운 멤버 초대하기</h3>
              <p className = "text-muted-foreground mb-6">
                QR 코드나 초대 링크를 공유하여 친구들을 모임에 초대하세요
              </p>
              <div className = "flex gap-3">
                <Button className = "rounded-full gap-2" onClick = {() => showMessage('초대 QR 코드를 준비했습니다.')}
                >
                  <QrCode className = "w-4 h-4" />
                  QR 코드 생성
                </Button>
                <Button variant = "outline" className = "rounded-full gap-2" onClick = {copyInviteLink}
                >
                  <Share2 className = "w-4 h-4" />
                  링크 복사
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-5 py-3 shadow-xl text-sm font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
