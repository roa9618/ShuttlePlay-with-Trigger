import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Users, Calendar, PlusCircle, TrendingUp, Play, Award } from 'lucide-react';

export default function GroupListPage() {
  const groups = [
    { id: 1, name: '강남 배드민턴 클럽', location: '강남구민회관', members: 24, lastSession: '2일 전', sessions: 48, activeMembers: 18 },
    { id: 2, name: '서초 셔틀메이트', location: '서초체육관', members: 18, lastSession: '4일 전', sessions: 32, activeMembers: 14 },
    { id: 3, name: '송파 배린이 모임', location: '송파구민센터', members: 15, lastSession: '1주 전', sessions: 28, activeMembers: 12 },
    { id: 4, name: '역삼 주말 배드민턴', location: '역삼체육관', members: 32, lastSession: '3일 전', sessions: 56, activeMembers: 24 },
    { id: 5, name: '판교 배드민턴 동호회', location: '판교체육관', members: 28, lastSession: '5일 전', sessions: 42, activeMembers: 20 },
    { id: 6, name: '강서 셔틀콕 클럽', location: '강서구민센터', members: 22, lastSession: '1주 전', sessions: 38, activeMembers: 16 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">내 모임</h1>
            <p className="text-muted-foreground text-lg">
              참여 중인 배드민턴 모임을 관리하세요
            </p>
          </div>
          <Link to="/groups/new">
            <Button className="rounded-full gap-2 h-12 px-6 shadow-lg shadow-primary/20">
              <PlusCircle className="w-5 h-5" />
              모임 만들기
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">참여 중인 모임</p>
            <p className="text-4xl font-medium">{groups.length}개</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Play className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">총 세션</p>
            <p className="text-4xl font-medium">
              {groups.reduce((sum, g) => sum + g.sessions, 0)}회
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Award className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">총 멤버</p>
            <p className="text-4xl font-medium">
              {groups.reduce((sum, g) => sum + g.members, 0)}명
            </p>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-2 gap-6">
        {groups.map((group) => (
          <Link
            key={group.id}
            to={`/groups/${group.id}`}
            className="block group"
          >
            <div className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary transition-all hover:shadow-xl">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-secondary/50 to-transparent p-6 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{group.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-medium text-primary">{group.members}</p>
                    <p className="text-xs text-muted-foreground mt-1">총 멤버</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-2xl font-medium text-primary">{group.activeMembers}</p>
                    <p className="text-xs text-muted-foreground mt-1">활동 멤버</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-primary">{group.sessions}</p>
                    <p className="text-xs text-muted-foreground mt-1">총 세션</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">최근 운동</span>
                  </div>
                  <Badge variant="outline">{group.lastSession}</Badge>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/groups/${group.id}/create-session`;
                    }}
                  >
                    세션 만들기
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/groups/${group.id}`;
                    }}
                  >
                    모임 정보
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Add New Group Card */}
        <Link to="/groups/new" className="block">
          <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 hover:border-primary transition-colors cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center">
              <PlusCircle className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">새로운 모임 만들기</h3>
              <p className="text-muted-foreground">
                친구들과 함께 배드민턴 모임을 시작하세요
              </p>
            </div>
            <Button className="rounded-full gap-2">
              <PlusCircle className="w-4 h-4" />
              모임 만들기
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
