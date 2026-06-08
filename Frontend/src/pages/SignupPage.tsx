import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './SignupPage.styles';

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
    <div className = {styles.page}>
      {/* Background Pattern */}
      <div className = {styles.decorativeShape} />

      {/* Decorative Elements */}
      <div className = {styles.decorativeShape2}>
        <ShuttlecockIcon size = {120} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape3}>
        <ShuttlecockIcon size = {80} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape4}>
        <Sparkles className = {styles.sparklesIcon} />
      </div>

      <div className = {styles.stack}>
        <div className = {styles.stack2}>
          <div className = {styles.row}>
            <Logo size = "lg" />
          </div>
          <div className = {styles.stack3}>
            <h1 className = {styles.pageTitle}>회원가입</h1>
            <p className = {styles.descriptionText}>
              셔틀플레이와 함께 시작하세요
            </p>
          </div>
        </div>

        <div className = {styles.header}>
          <form onSubmit = {handleSubmit} className = {styles.form}>
            <div className = {styles.cardGrid}>
              <div className = {styles.stack3}>
                <Label htmlFor = "name">이름</Label>
                <Input id = "name" type = "text" placeholder = "이름을 입력하세요" className = {styles.input} value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className = {styles.stack3}>
                <Label htmlFor = "email">이메일</Label>
                <Input id = "email" type = "email" placeholder = "이메일을 입력하세요" className = {styles.input} value = {formData.email} onChange = {(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className = {styles.cardGrid}>
              <div className = {styles.stack3}>
                <Label htmlFor = "password">비밀번호</Label>
                <Input id = "password" type = "password" placeholder = "비밀번호를 입력하세요" className = {styles.input} value = {formData.password} onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className = {styles.stack3}>
                <Label htmlFor = "password-confirm">비밀번호 확인</Label>
                <Input id = "password-confirm" type = "password" placeholder = "다시 입력하세요" className = {styles.input} value = {formData.passwordConfirm} onChange = {(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className = {styles.cardGrid}>
              <div className = {styles.stack3}>
                <Label htmlFor = "gender">성별</Label>
                <Select value = {formData.gender} onValueChange = {(value) => setFormData({ ...formData, gender: value })} required>
                  <SelectTrigger id = "gender" className = {styles.input}>
                    <SelectValue placeholder = "선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "male">남성</SelectItem>
                    <SelectItem value = "female">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.stack3}>
                <Label htmlFor = "age">나이대</Label>
                <Select value = {formData.age} onValueChange = {(value) => setFormData({ ...formData, age: value })} required>
                  <SelectTrigger id = "age" className = {styles.input}>
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

            <div className = {styles.stack3}>
              <Label htmlFor = "level">급수</Label>
              <Select value = {formData.level} onValueChange = {(value) => setFormData({ ...formData, level: value })} required>
                <SelectTrigger id = "level" className = {styles.input}>
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
              <div className = {styles.contentBox}>
                {message}
              </div>
            )}
            <Button type = "submit" className = {styles.submitButton} size = "lg">
              회원가입 완료
            </Button>
          </form>
        </div>

        <div className = {styles.centeredBlock}>
          <span className = {styles.mutedText}>이미 회원이신가요? </span>
          <Link to = "/login" className = {styles.primaryLink}>
            로그인
          </Link>
        </div>

      </div>
    </div>
  );
}
