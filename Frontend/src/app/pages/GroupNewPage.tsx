import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Users, MapPin, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

export default function GroupNewPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    defaultTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/groups');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <Link to="/groups" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            모임 목록으로
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-medium mb-3">새로운 모임 만들기</h1>
          <p className="text-lg text-muted-foreground">
            친구들과 함께 배드민턴 모임을 시작하세요
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 */}
            <div>
              <h2 className="text-xl font-medium mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                기본 정보
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">모임 이름 *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="예: 강남 배드민턴 클럽"
                    className="rounded-xl h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    모임을 잘 나타내는 이름을 지어주세요
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">주요 활동 장소 *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="예: 강남구민회관"
                      className="rounded-xl h-12 pl-11"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    주로 운동하는 체육관이나 장소를 입력하세요
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">모임 소개 (선택)</Label>
                  <Textarea
                    id="description"
                    placeholder="모임의 분위기나 특징을 자유롭게 소개해주세요"
                    className="rounded-xl resize-none"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                운영 정보
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultTime">기본 운동 시간 (선택)</Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="defaultTime"
                      type="text"
                      placeholder="예: 화요일, 목요일 19:00 - 21:00"
                      className="rounded-xl h-12 pl-11"
                      value={formData.defaultTime}
                      onChange={(e) => setFormData({ ...formData, defaultTime: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    정기적으로 운동하는 요일과 시간을 입력하세요
                  </p>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-6">
                  <h3 className="font-medium mb-3">모임을 만들면</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>세션을 만들고 참가자를 초대할 수 있어요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>자동 매칭으로 빠르게 경기를 생성할 수 있어요</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>모든 참가자의 기록과 통계를 관리할 수 있어요</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8 flex gap-4">
              <Link to="/groups" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full h-12"
                  size="lg"
                >
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 rounded-full h-12 shadow-lg shadow-primary/20"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                모임 만들기
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            모임을 만들면 자동으로 운영자가 됩니다. 나중에 다른 멤버를 운영자로 추가할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
