import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Filter, MessageSquare, Search, ShieldCheck, UserCheck, UserMinus, X } from 'lucide-react';

interface Participant {
  name: string;
  gender: string;
  level: string;
  age: string;
  status: string;
  type: string;
  doublesMmr: number;
  mixedMmr: number;
  matchCount: number;
  consecutivePlay: number;
  consecutiveRest: number;
  lateEta?: string;
  lateReason?: string;
  noShowCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  actualExperience: string;
  playStyle: string;
  newPlayerCare: boolean;
  caution: string;
  memo?: string;
}

const statusOptions = [
  ['not-arrived', '미출석'],
  ['late', '지각 예정'],
  ['attended', '출석 완료'],
  ['available', '경기 가능'],
  ['waiting', '대기 중'],
  ['next', '다음 경기 예정'],
  ['playing', '경기 중'],
  ['resting', '일시 휴식'],
  ['left', '퇴장'],
  ['absent', '불참'],
];

const statusLabel = (status: string) => statusOptions.find(([value]) => value === status)?.[1] ?? status;

export default function ParticipantManagementPage() {
  const { sessionId } = useParams();

  const [participants, setParticipants] = useState<Participant[]>([
    { name: '김민수', gender: '남', level: 'B', age: '30대', status: 'playing', type: '회원', doublesMmr: 1450, mixedMmr: 1380, matchCount: 4, consecutivePlay: 1, consecutiveRest: 0, noShowCount: 0, lateCount: 1, earlyLeaveCount: 0, actualExperience: '클럽 3년', playStyle: '빡겜', newPlayerCare: true, caution: '무릎 보호', memo: '' },
    { name: '박지영', gender: '여', level: 'A', age: '20대', status: 'next', type: '회원', doublesMmr: 1620, mixedMmr: 1585, matchCount: 3, consecutivePlay: 0, consecutiveRest: 1, noShowCount: 0, lateCount: 0, earlyLeaveCount: 0, actualExperience: '대회 경험 있음', playStyle: '빡겜', newPlayerCare: true, caution: '', memo: '' },
    { name: '이준호', gender: '남', level: 'D', age: '40대', status: 'waiting', type: '회원', doublesMmr: 1120, mixedMmr: 1090, matchCount: 2, consecutivePlay: 0, consecutiveRest: 2, noShowCount: 1, lateCount: 2, earlyLeaveCount: 0, actualExperience: '동호회 1년', playStyle: '즐겜', newPlayerCare: false, caution: '상위 급수와 연속 배정 주의', memo: '' },
    { name: '최서연', gender: '여', level: 'B', age: '30대', status: 'available', type: '회원', doublesMmr: 1420, mixedMmr: 1465, matchCount: 3, consecutivePlay: 0, consecutiveRest: 1, noShowCount: 0, lateCount: 0, earlyLeaveCount: 1, actualExperience: '레슨 2년', playStyle: '즐겜', newPlayerCare: true, caution: '', memo: '' },
    { name: '정민재', gender: '남', level: 'B', age: '30대', status: 'late', type: '회원', doublesMmr: 1395, mixedMmr: 1330, matchCount: 0, consecutivePlay: 0, consecutiveRest: 0, lateEta: '19:40', lateReason: '퇴근 지연', noShowCount: 0, lateCount: 3, earlyLeaveCount: 0, actualExperience: '클럽 2년', playStyle: '빡겜', newPlayerCare: false, caution: '', memo: '' },
    { name: '강수진', gender: '여', level: 'C', age: '20대', status: 'attended', type: '비회원', doublesMmr: 1210, mixedMmr: 1245, matchCount: 1, consecutivePlay: 0, consecutiveRest: 1, noShowCount: 0, lateCount: 0, earlyLeaveCount: 0, actualExperience: '신규 참가', playStyle: '즐겜', newPlayerCare: false, caution: '첫 경기 난이도 완화', memo: '' },
  ]);

  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [selectedParticipantIndex, setSelectedParticipantIndex] = useState<number | null>(null);
  const [memoText, setMemoText] = useState('');

  const updateStatus = (index: number, status: string) => {
    setParticipants((prev) => prev.map((participant, idx) => idx === index ? { ...participant, status } : participant));
  };

  const openMemoModal = (index: number) => {
    setSelectedParticipantIndex(index);
    setMemoText(participants[index].memo || '');
    setMemoModalOpen(true);
  };

  const saveMemo = () => {
    if (selectedParticipantIndex === null) return;
    setParticipants((prev) => prev.map((participant, idx) => idx === selectedParticipantIndex ? { ...participant, memo: memoText } : participant));
    setMemoModalOpen(false);
    setSelectedParticipantIndex(null);
    setMemoText('');
  };

  const stats = [
    ['전체', participants.length],
    ['경기 가능', participants.filter((p) => ['available', 'waiting', 'next'].includes(p.status)).length],
    ['경기 중', participants.filter((p) => p.status === 'playing').length],
    ['지각', participants.filter((p) => p.status === 'late').length],
    ['휴식', participants.filter((p) => p.status === 'resting').length],
    ['퇴장', participants.filter((p) => p.status === 'left').length],
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={`/sessions/${sessionId}/dashboard`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              대시보드
            </Link>
            <Logo size="sm" />
          </div>
          <Button className="rounded-full gap-2">
            <UserCheck className="w-4 h-4" />
            선택 참가자 경기 가능
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-medium mb-2">참가자 관리</h1>
          <p className="text-muted-foreground">
            출석, 지각, 휴식, 퇴장 상태와 운영자 전용 정보를 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-medium text-primary">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="참가자 이름으로 검색" className="pl-10 rounded-full" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48 rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {statusOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-medium">참가자</th>
                  <th className="text-left px-5 py-4 text-sm font-medium">급수·MMR</th>
                  <th className="text-left px-5 py-4 text-sm font-medium">상태</th>
                  <th className="text-left px-5 py-4 text-sm font-medium">운영 지표</th>
                  <th className="text-left px-5 py-4 text-sm font-medium">관리</th>
                  <th className="text-left px-5 py-4 text-sm font-medium">메모</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participants.map((p, idx) => (
                  <tr key={p.name} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{p.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.gender} · {p.age} · {p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <p className="font-medium">{p.level}</p>
                      <p className="text-muted-foreground">복식 {p.doublesMmr} · 혼복 {p.mixedMmr}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={p.status === 'playing' || p.status === 'available' ? 'default' : 'outline'} className={p.status === 'playing' || p.status === 'available' ? 'bg-primary text-primary-foreground' : ''}>
                        {statusLabel(p.status)}
                      </Badge>
                      {p.status === 'late' && (
                        <p className="text-xs text-muted-foreground mt-2">{p.lateEta} 도착 · {p.lateReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <p>경기 {p.matchCount}회 · 연속 경기 {p.consecutivePlay}</p>
                      <p className="text-muted-foreground">연속 휴식 {p.consecutiveRest} · 지각 {p.lateCount} · 노쇼 {p.noShowCount}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Select value={p.status} onValueChange={(value) => updateStatus(idx, value)}>
                          <SelectTrigger className="w-36 rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {p.status === 'late' && (
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => updateStatus(idx, 'available')}>
                            도착 처리
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => updateStatus(idx, 'resting')}>
                          휴식
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full gap-1" onClick={() => updateStatus(idx, 'left')}>
                          <UserMinus className="w-3 h-3" />
                          퇴장
                        </Button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Button variant="ghost" size="sm" className="gap-2" onClick={() => openMemoModal(idx)}>
                        <MessageSquare className="w-4 h-4" />
                        {p.memo ? '수정' : '추가'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-medium">운영자 전용 신뢰도·매너 정보</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {participants.slice(0, 3).map((p) => (
              <div key={p.name} className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">{p.name}</p>
                  <Badge variant="outline">{p.playStyle}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">실제 경험: {p.actualExperience}</p>
                <p className="text-sm text-muted-foreground mb-2">신규 케어 가능: {p.newPlayerCare ? '가능' : '제외'}</p>
                <p className="text-sm">주의: {p.caution || '없음'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {memoModalOpen && selectedParticipantIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-medium">운영자 메모</h3>
                <p className="text-sm text-muted-foreground mt-1">{participants[selectedParticipantIndex].name}</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0" onClick={() => setMemoModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memo">메모 내용</Label>
                <Textarea
                  id="memo"
                  placeholder="실제 구력, 매너, 매칭 주의사항, 선호 성향 등을 적어두세요."
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  className="min-h-32 rounded-xl"
                />
                <p className="text-sm text-muted-foreground">참가자에게 공개되지 않는 운영자 전용 정보입니다.</p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setMemoModalOpen(false)}>
                취소
              </Button>
              <Button className="flex-1 rounded-full" onClick={saveMemo}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
