import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Award, Heart } from 'lucide-react';
import { useState } from 'react';
import { useActionFeedback } from '../hooks/useActionFeedback';

export default function SignupPage() {
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    gender: '',
    age: '',
    level: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      showMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    showMessage('회원가입이 완료되었습니다.');
    window.setTimeout(() => navigate('/login'), 500);
  };
  return (
    <div className = "min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className = "absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/20 to-background" />

      {/* Decorative Elements */}
      <div className = "absolute top-20 right-20 opacity-10">
        <Award className = "w-24 h-24 text-primary" />
      </div>
      <div className = "absolute bottom-20 left-20 opacity-10">
        <Heart className = "w-16 h-16 text-primary" />
      </div>
      <div className = "absolute top-1/2 right-10 opacity-5">
        <ShuttlecockIcon size = {100} className = "text-primary" />
      </div>

      <div className = "w-full max-w-md space-y-8 relative z-10">
        <Link to = "/" className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className = "w-4 h-4" />
          돌아가기
        </Link>

        <div className = "text-center space-y-6">
          <div className = "flex justify-center">
            <Logo size = "lg" />
          </div>
          <div className = "space-y-2">
            <h1 className = "text-3xl font-medium">회원가입</h1>
            <p className = "text-lg text-muted-foreground">
              ShuttlePlay와 함께 시작하세요
            </p>
          </div>
        </div>

        <div className = "bg-card/80 backdrop-blur-sm border-2 border-border rounded-3xl p-10 shadow-2xl shadow-primary/10">
          <form onSubmit = {handleSubmit} className = "space-y-5">
            <div className = "space-y-2">
              <Label htmlFor = "name">이름</Label>
              <Input id = "name" type = "text" placeholder = "이름을 입력하세요" className = "rounded-xl h-11" value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className = "space-y-2">
              <Label htmlFor = "email">이메일</Label>
              <Input id = "email" type = "email" placeholder = "이메일을 입력하세요" className = "rounded-xl h-11" value = {formData.email} onChange = {(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className = "space-y-2">
              <Label htmlFor = "password">비밀번호</Label>
              <Input id = "password" type = "password" placeholder = "비밀번호를 입력하세요" className = "rounded-xl h-11" value = {formData.password} onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className = "space-y-2">
              <Label htmlFor = "password-confirm">비밀번호 확인</Label>
              <Input id = "password-confirm" type = "password" placeholder = "비밀번호를 다시 입력하세요" className = "rounded-xl h-11" value = {formData.passwordConfirm} onChange = {(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                required
              />
            </div>

            <div className = "grid grid-cols-2 gap-4">
              <div className = "space-y-2">
                <Label htmlFor = "gender">성별</Label>
                <Select value = {formData.gender} onValueChange = {(value) => setFormData({ ...formData, gender: value })} required>
                  <SelectTrigger id = "gender" className = "rounded-xl h-11">
                    <SelectValue placeholder = "선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "male">남성</SelectItem>
                    <SelectItem value = "female">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = "space-y-2">
                <Label htmlFor = "age">나이대</Label>
                <Select value = {formData.age} onValueChange = {(value) => setFormData({ ...formData, age: value })} required>
                  <SelectTrigger id = "age" className = "rounded-xl h-11">
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

            <div className = "space-y-2">
              <Label htmlFor = "level">급수</Label>
              <Select value = {formData.level} onValueChange = {(value) => setFormData({ ...formData, level: value })} required>
                <SelectTrigger id = "level" className = "rounded-xl h-11">
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
            </div>

            {message && (
              <div className = "rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm text-primary">
                {message}
              </div>
            )}
            <Button type = "submit" className = "w-full rounded-full shadow-lg shadow-primary/20" size = "lg">
              회원가입 완료
            </Button>
          </form>
        </div>

        <div className = "text-center">
          <span className = "text-muted-foreground">이미 회원이신가요? </span>
          <Link to = "/login" className = "text-primary hover:underline font-medium">
            로그인
          </Link>
        </div>

        {/* Decorative Badge */}
        <div className = "flex justify-center">
          <div className = "bg-gradient-to-r from-secondary/50 to-primary/10 rounded-full px-6 py-3 border border-border/50 backdrop-blur-sm">
            <div className = "flex items-center gap-2 text-sm">
              <ShuttlecockIcon size = {16} className = "text-primary" />
              <span className = "text-muted-foreground">함께하는 배드민턴의 즐거움</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
