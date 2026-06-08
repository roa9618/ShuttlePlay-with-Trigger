import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sparkles } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './PasswordResetPage.styles';

export default function PasswordResetConfirmPage() {
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      showMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    showMessage('비밀번호가 변경되었습니다.');
    window.setTimeout(() => navigate('/login'), 500);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.decorativeShape} />
      <div className = {styles.decorativeShape2}>
        <ShuttlecockIcon size = {120} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape3}>
        <ShuttlecockIcon size = {80} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape4}>
        <Sparkles className = {styles.sparklesIcon} />
      </div>

      <div className = {styles.authPanel}>
        <div className = {styles.sectionHeader}>
          <div className = {styles.row}>
            <Logo size = "lg" />
          </div>
          <div className = {styles.stack}>
            <h1 className = {styles.pageTitle}>새 비밀번호 설정</h1>
            <p className = {styles.descriptionText}>
              앞으로 사용할 비밀번호를 입력해주세요
            </p>
          </div>
        </div>

        <div className = {styles.header}>
          <form onSubmit = {handleSubmit} className = {styles.form}>
            <div className = {styles.stack}>
              <Label htmlFor = "password">새 비밀번호</Label>
              <Input id = "password" type = "password" placeholder = "새 비밀번호를 입력하세요" value = {formData.password} onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
                required className = {styles.roundedControl}
              />
            </div>

            <div className = {styles.stack}>
              <Label htmlFor = "password-confirm">새 비밀번호 확인</Label>
              <Input id = "password-confirm" type = "password" placeholder = "새 비밀번호를 다시 입력하세요" value = {formData.passwordConfirm} onChange = {(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                required className = {styles.roundedControl}
              />
            </div>

            {message && (
              <div className = {styles.contentBox}>
                {message}
              </div>
            )}

            <Button type = "submit" className = {styles.submitButton} size = "lg">
              비밀번호 변경하기
            </Button>
          </form>
        </div>

        <div className = {styles.centeredBlock}>
          <span className = {styles.mutedText}>비밀번호가 기억나셨나요? </span>
          <Link to = "/login" className = {styles.primaryLink}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
