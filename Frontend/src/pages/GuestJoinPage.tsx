import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, UserPlus, User, Award } from 'lucide-react';
import { useState } from 'react';

export default function GuestJoinPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    level: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/sessions/${sessionId}/attendance`);
  };

  return (
    <div className = "min-h-screen bg-background">
      <div className = "border-b border-border bg-card px-4 py-4">
        <Logo size = "md" className = "justify-center" />
      </div>

      <div className = "max-w-2xl mx-auto px-4 py-12 space-y-8">
        <Link to = {`/sessions/${sessionId}/join`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          돌아가기
        </Link>

        <div className = "text-center space-y-4">
          <div className = "w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto flex items-center justify-center mb-4">
            <UserPlus className = "w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className = "text-4xl font-medium mb-3">비회원 참여</h1>
            <p className = "text-lg text-muted-foreground">
              간단한 정보만 입력하면 바로 참여할 수 있어요
            </p>
          </div>
        </div>

        <div className = "bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <form onSubmit = {handleSubmit} className = "space-y-8">
            <div>
              <h2 className = "text-xl font-medium mb-6 flex items-center gap-3">
                <div className = "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className = "w-4 h-4 text-primary" />
                </div>
                기본 정보
              </h2>

              <div className = "space-y-6">
                <div className = "space-y-2">
                  <Label htmlFor = "name">이름 *</Label>
                  <Input id = "name" type = "text" placeholder = "이름을 입력하세요" className = "rounded-xl h-12" value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className = "grid grid-cols-2 gap-4">
                  <div className = "space-y-2">
                    <Label htmlFor = "gender">성별 *</Label>
                    <Select value = {formData.gender} onValueChange = {(value) => setFormData({ ...formData, gender: value })}
                      required
                    >
                      <SelectTrigger id = "gender" className = "rounded-xl h-12">
                        <SelectValue placeholder = "선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value = "male">남성</SelectItem>
                        <SelectItem value = "female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className = "space-y-2">
                    <Label htmlFor = "age">나이대 *</Label>
                    <Select value = {formData.age} onValueChange = {(value) => setFormData({ ...formData, age: value })}
                      required
                    >
                      <SelectTrigger id = "age" className = "rounded-xl h-12">
                        <SelectValue placeholder = "선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value = "20s">20대</SelectItem>
                        <SelectItem value = "30s">30대</SelectItem>
                        <SelectItem value = "40s">40대</SelectItem>
                        <SelectItem value = "50s">50대</SelectItem>
                        <SelectItem value = "60s">60대 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className = "border-t border-border pt-8">
              <h2 className = "text-xl font-medium mb-6 flex items-center gap-3">
                <div className = "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className = "w-4 h-4 text-primary" />
                </div>
                실력 정보
              </h2>

              <div className = "space-y-6">
                <div className = "space-y-2">
                  <Label htmlFor = "level">급수 *</Label>
                  <Select value = {formData.level} onValueChange = {(value) => setFormData({ ...formData, level: value })}
                    required
                  >
                    <SelectTrigger id = "level" className = "rounded-xl h-12">
                      <SelectValue placeholder = "선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value = "E">E</SelectItem>
                      <SelectItem value = "D">D</SelectItem>
                      <SelectItem value = "C">C</SelectItem>
                      <SelectItem value = "B">B</SelectItem>
                      <SelectItem value = "A">A</SelectItem>
                      <SelectItem value = "S">S</SelectItem>
                    <SelectItem value = "SS">SS</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className = "text-sm text-muted-foreground">
                    실력에 맞는 매칭을 위해 정확하게 선택해주세요
                  </p>
                </div>

                <div className = "bg-secondary/30 rounded-2xl p-6">
                  <h3 className = "font-medium mb-3">급수 선택 가이드</h3>
                  <ul className = "space-y-2 text-sm text-muted-foreground">
                    <li className = "flex items-start gap-2">
                      <div className = "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span><strong>E/D:</strong> 시작 또는 기초 단계</span>
                    </li>
                    <li className = "flex items-start gap-2">
                      <div className = "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span><strong>C/B/A:</strong> 기본 랠리와 경기 운영이 가능한 단계</span>
                    </li>
                    <li className = "flex items-start gap-2">
                      <div className = "w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span><strong>S/SS:</strong> 상위 실력 또는 대회 경험이 많은 단계</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className = "border-t border-border pt-8 space-y-4">
              <Button type = "submit" className = "w-full rounded-full h-12 shadow-lg shadow-primary/20" size = "lg">
                <UserPlus className = "w-5 h-5 mr-2" />
                참여하기
              </Button>
              <Link to = {`/sessions/${sessionId}/join`} className = "block">
                <Button type = "button" variant = "outline" className = "w-full rounded-full h-12" size = "lg">
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </div>

        <div className = "bg-gradient-to-br from-secondary/50 to-transparent rounded-2xl p-8 text-center border border-border">
          <h3 className = "font-medium mb-2">다음에도 ShuttlePlay를 사용하실 예정이라면</h3>
          <p className = "text-sm text-muted-foreground mb-6">
            회원가입하면 내 기록을 관리하고 더 편하게 사용할 수 있어요
          </p>
          <Link to = "/signup">
            <Button variant = "outline" className = "rounded-full gap-2">
              <UserPlus className = "w-4 h-4" />
              회원가입하고 더 편하게 사용하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
