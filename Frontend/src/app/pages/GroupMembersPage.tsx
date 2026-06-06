import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Search, Filter, Users, Trophy, Calendar } from 'lucide-react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function GroupMembersPage() {
  const { groupId } = useParams();
  const { message, showMessage } = useActionFeedback();

  const allMembers = [
    { name: '김민수', level: 'B', age: '30대', gender: '남', sessions: 24, wins: 42, losses: 28, winRate: 60 },
    { name: '박지영', level: 'A', age: '20대', gender: '여', sessions: 18, wins: 38, losses: 22, winRate: 63 },
    { name: '이준호', level: 'D', age: '40대', gender: '남', sessions: 12, wins: 15, losses: 21, winRate: 42 },
    { name: '최서연', level: 'B', age: '30대', gender: '여', sessions: 21, wins: 35, losses: 30, winRate: 54 },
    { name: '정민재', level: 'B', age: '30대', gender: '남', sessions: 19, wins: 32, losses: 26, winRate: 55 },
    { name: '강수진', level: 'C', age: '20대', gender: '여', sessions: 15, wins: 22, losses: 23, winRate: 49 },
    { name: '오유진', level: 'B', age: '30대', gender: '여', sessions: 20, wins: 34, losses: 28, winRate: 55 },
    { name: '한지우', level: 'A', age: '20대', gender: '남', sessions: 17, wins: 36, losses: 24, winRate: 60 },
    { name: '윤서아', level: 'D', age: '30대', gender: '여', sessions: 10, wins: 12, losses: 18, winRate: 40 },
    { name: '장현우', level: 'B', age: '40대', gender: '남', sessions: 22, wins: 38, losses: 32, winRate: 54 },
    { name: '송민호', level: 'A', age: '30대', gender: '남', sessions: 16, wins: 30, losses: 20, winRate: 60 },
    { name: '임채원', level: 'B', age: '20대', gender: '여', sessions: 14, wins: 24, losses: 22, winRate: 52 },
    { name: '전수현', level: 'C', age: '30대', gender: '여', sessions: 11, wins: 18, losses: 19, winRate: 49 },
    { name: '노태준', level: 'S', age: '30대', gender: '남', sessions: 25, wins: 52, losses: 23, winRate: 69 },
    { name: '홍지민', level: 'B', age: '20대', gender: '여', sessions: 13, wins: 22, losses: 20, winRate: 52 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={`/groups/${groupId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              모임 상세
            </Link>
            <Logo size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-medium mb-2">전체 멤버</h1>
          <p className="text-muted-foreground">
            강남 배드민턴 클럽의 모든 멤버를 확인하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border-2 border-primary/30 rounded-xl p-5 text-center">
            <p className="text-3xl font-medium text-primary mb-1">{allMembers.length}</p>
            <p className="text-sm text-muted-foreground">전체 멤버</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-3xl font-medium text-primary mb-1">{allMembers.filter(m => m.gender === '남').length}</p>
            <p className="text-sm text-muted-foreground">남성</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-3xl font-medium text-primary mb-1">{allMembers.filter(m => m.gender === '여').length}</p>
            <p className="text-sm text-muted-foreground">여성</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-3xl font-medium mb-1">{Math.round(allMembers.reduce((sum, m) => sum + m.sessions, 0) / allMembers.length)}</p>
            <p className="text-sm text-muted-foreground">평균 참여</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="멤버 이름으로 검색"
                className="pl-10 rounded-full"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
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

        {/* Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-medium text-primary">
                    {member.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary text-primary-foreground">{member.level}</Badge>
                    <Badge variant="outline">{member.gender}</Badge>
                    <Badge variant="outline">{member.age}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-medium text-primary">{member.sessions}</p>
                  <p className="text-xs text-muted-foreground">참여</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-medium text-primary">{member.winRate}%</p>
                  <p className="text-xs text-muted-foreground">승률</p>
                </div>
              </div>

              <div className="pt-3 text-center text-sm text-muted-foreground">
                {member.wins}승 {member.losses}패
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="mt-8 bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/40 rounded-3xl p-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-medium mb-2">새로운 멤버를 초대하세요</h3>
              <p className="text-muted-foreground mb-4">
                친구들을 초대하여 함께 배드민턴을 즐겨보세요
              </p>
              <Button className="rounded-full" onClick={() => showMessage('멤버 초대 링크를 준비했습니다.')}>
                멤버 초대하기
              </Button>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-5 py-3 shadow-xl text-sm font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
