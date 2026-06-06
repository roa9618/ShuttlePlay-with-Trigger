import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Clock, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="px-4 py-6">
        <Logo size="sm" className="justify-center" />
      </div>

      <div className="max-w-md mx-auto px-4 pb-12 space-y-8">
        <Link to={`/sessions/${sessionId}/attendance`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Link>

        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-medium mb-3">지각 예정 등록</h1>
          <p className="text-muted-foreground">
            예상 도착 시간을 알려주세요
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <div>
            <Label className="mb-3 block">얼마나 늦으실 것 같나요?</Label>
            <div className="grid grid-cols-2 gap-3">
              {quickOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setSelectedMinutes(option.value)}
                  className={`rounded-full h-auto py-4 ${
                    selectedMinutes === option.value ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">지각 사유 (선택)</Label>
            <Textarea
              id="reason"
              placeholder="간단히 사유를 입력해주세요"
              className="rounded-xl resize-none"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              운영자와 다른 참가자들에게 공유됩니다
            </p>
          </div>

          <div className="border-t border-border pt-6 space-y-3">
            <Link to={`/sessions/${sessionId}/status`}>
              <Button className="w-full rounded-full" size="lg">
                등록하기
              </Button>
            </Link>
            <Link to={`/sessions/${sessionId}/attendance`}>
              <Button variant="outline" className="w-full rounded-full" size="lg">
                취소
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
