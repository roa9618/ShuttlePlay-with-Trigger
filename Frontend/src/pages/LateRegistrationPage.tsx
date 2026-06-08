import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Clock, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { styles } from './LateRegistrationPage.styles';

export default function LateRegistrationPage() {
  const { sessionId } = useParams();
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const quickOptions = [
    { label: '10분 늦음', value: 10 },
    { label: '20분 늦음', value: 20 },
    { label: '30분 늦음', value: 30 },
    { label: '1시간 늦음', value: 60 },
  ];

  return (
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = {`/sessions/${sessionId}/attendance`} className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          돌아가기
        </Link>

        <div className = {styles.stack}>
          <div className = {styles.row}>
            <Clock className = {styles.clockIcon} />
          </div>
          <h1 className = {styles.pageTitle}>지각 예정 등록</h1>
          <p className = {styles.descriptionText}>
            예상 도착 시간을 알려주세요
          </p>
        </div>

        <div className = {styles.header}>
          <div>
            <Label className = {styles.labelIcon}>얼마나 늦으실 것 같나요?</Label>
            <div className = {styles.cardGrid}>
              {quickOptions.map((option) => (
                <Button key = {option.value} type = "button" variant = "outline" size = "default" onClick = {() => setSelectedMinutes(option.value)} className = {styles.minuteOptionButton(selectedMinutes === option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className = {styles.stack2}>
            <Label htmlFor = "reason">지각 사유 (선택)</Label>
            <Textarea id = "reason" placeholder = "간단히 사유를 입력해주세요" className = {styles.textareaIcon} rows = {3} value = {reason} onChange = {(e) => setReason(e.target.value)}
            />
            <p className = {styles.descriptionText2}>
              운영자와 다른 참가자들에게 공유됩니다
            </p>
          </div>

          <div className = {styles.footerActions}>
            <Link to = {`/sessions/${sessionId}/status`}>
              <Button className = {styles.fullWidthButton} size = "lg">
                등록하기
              </Button>
            </Link>
            <Link to = {`/sessions/${sessionId}/attendance`}>
              <Button variant = "outline" className = {styles.fullWidthButton} size = "lg">
                취소
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
