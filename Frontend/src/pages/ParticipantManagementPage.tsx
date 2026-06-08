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
import { styles } from './ParticipantManagementPage.styles';

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
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.headerInner}>
          <div className = {styles.row}>
            <Link to = {`/sessions/${sessionId}/dashboard`} className = {styles.backLink}>
              <ArrowLeft className = {styles.arrowLeftIcon} />
              대시보드
            </Link>
            <Logo size = "sm" />
          </div>
          <Button className = {styles.roundButton}>
            <UserCheck className = {styles.arrowLeftIcon} />
            선택 참가자 경기 가능
          </Button>
        </div>
      </div>

      <div className = {styles.content}>
        <div className = {styles.sectionHeader}>
          <h1 className = {styles.pageTitle}>참가자 관리</h1>
          <p className = {styles.descriptionText}>
            출석, 지각, 휴식, 퇴장 상태와 운영자 전용 정보를 관리합니다.
          </p>
        </div>

        <div className = {styles.cardGrid}>
          {stats.map(([label, value]) => (
            <div key = {label} className = {styles.header2}>
              <p className = {styles.summaryText}>{value}</p>
              <p className = {styles.descriptionText2}>{label}</p>
            </div>
          ))}
        </div>

        <div className = {styles.header3}>
          <div className = {styles.stack}>
            <div className = {styles.row2}>
              <Search className = {styles.searchIcon} />
              <Input placeholder = "참가자 이름으로 검색" className = {styles.input} />
            </div>
            <Select defaultValue = "all">
              <SelectTrigger className = {styles.selectTrigger}>
                <Filter className = {styles.filterIcon} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value = "all">전체</SelectItem>
                {statusOptions.map(([value, label]) => (
                  <SelectItem key = {value} value = {value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className = {styles.header4}>
          <div className = {styles.tableScroll}>
            <table className = {styles.table}>
              <thead className = {styles.tableHead}>
                <tr>
                  <th className = {styles.tableHeaderCell}>참가자</th>
                  <th className = {styles.tableHeaderCell}>급수·MMR</th>
                  <th className = {styles.tableHeaderCell}>상태</th>
                  <th className = {styles.tableHeaderCell}>운영 지표</th>
                  <th className = {styles.tableHeaderCell}>관리</th>
                  <th className = {styles.tableHeaderCell}>메모</th>
                </tr>
              </thead>
              <tbody className = {styles.tableBody}>
                {participants.map((p, idx) => (
                  <tr key = {p.name} className = {styles.tableRow}>
                    <td className = {styles.tableCell}>
                      <div className = {styles.row3}>
                        <div className = {styles.row4}>
                          <span className = {styles.labelText}>{p.name[0]}</span>
                        </div>
                        <div>
                          <p className = {styles.summaryText2}>{p.name}</p>
                          <p className = {styles.descriptionText3}>{p.gender} · {p.age} · {p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className = {styles.tableCell2}>
                      <p className = {styles.summaryText2}>{p.level}</p>
                      <p className = {styles.descriptionText}>복식 {p.doublesMmr} · 혼복 {p.mixedMmr}</p>
                    </td>
                    <td className = {styles.tableCell}>
                      <Badge variant = {p.status === 'playing' || p.status === 'available' ? 'default' : 'outline'} className = {styles.statusBadge(p.status === 'playing' || p.status === 'available')}>
                        {statusLabel(p.status)}
                      </Badge>
                      {p.status === 'late' && (
                        <p className = {styles.descriptionText4}>{p.lateEta} 도착 · {p.lateReason}</p>
                      )}
                    </td>
                    <td className = {styles.tableCell2}>
                      <p>경기 {p.matchCount}회 · 연속 경기 {p.consecutivePlay}</p>
                      <p className = {styles.descriptionText}>연속 휴식 {p.consecutiveRest} · 지각 {p.lateCount} · 노쇼 {p.noShowCount}</p>
                    </td>
                    <td className = {styles.tableCell}>
                      <div className = {styles.wrapRow}>
                        <Select value = {p.status} onValueChange = {(value) => updateStatus(idx, value)}>
                          <SelectTrigger className = {styles.selectTrigger2}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(([value, label]) => (
                              <SelectItem key = {value} value = {value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {p.status === 'late' && (
                          <Button variant = "outline" size = "sm" className = {styles.roundButton2} onClick = {() => updateStatus(idx, 'available')}>
                            도착 처리
                          </Button>
                        )}
                        <Button variant = "outline" size = "sm" className = {styles.roundButton2} onClick = {() => updateStatus(idx, 'resting')}>
                          휴식
                        </Button>
                        <Button variant = "outline" size = "sm" className = {styles.roundButton3} onClick = {() => updateStatus(idx, 'left')}>
                          <UserMinus className = {styles.userMinusIcon} />
                          퇴장
                        </Button>
                      </div>
                    </td>
                    <td className = {styles.tableCell}>
                      <Button variant = "ghost" size = "sm" className = {styles.actionButton} onClick = {() => openMemoModal(idx)}>
                        <MessageSquare className = {styles.arrowLeftIcon} />
                        {p.memo ? '수정' : '추가'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className = {styles.header5}>
          <div className = {styles.row3}>
            <ShieldCheck className = {styles.shieldCheckIcon} />
            <h2 className = {styles.sectionTitle}>운영자 전용 신뢰도·매너 정보</h2>
          </div>
          <div className = {styles.statsGrid}>
            {participants.slice(0, 3).map((p) => (
              <div key = {p.name} className = {styles.contentBox}>
                <div className = {styles.betweenRow}>
                  <p className = {styles.summaryText2}>{p.name}</p>
                  <Badge variant = "outline">{p.playStyle}</Badge>
                </div>
                <p className = {styles.descriptionText5}>실제 경험: {p.actualExperience}</p>
                <p className = {styles.descriptionText5}>신규 케어 가능: {p.newPlayerCare ? '가능' : '제외'}</p>
                <p className = {styles.paragraphText}>주의: {p.caution || '없음'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {memoModalOpen && selectedParticipantIndex !== null && (
        <div className = {styles.modalOverlay}>
          <div className = {styles.header6}>
            <div className = {styles.betweenRow2}>
              <div>
                <h3 className = {styles.sectionTitle}>운영자 메모</h3>
                <p className = {styles.descriptionText6}>{participants[selectedParticipantIndex].name}</p>
              </div>
              <Button variant = "ghost" size = "sm" className = {styles.roundButton4} onClick = {() => setMemoModalOpen(false)}>
                <X className = {styles.xIcon} />
              </Button>
            </div>
            <div className = {styles.stack2}>
              <div className = {styles.stack3}>
                <Label htmlFor = "memo">메모 내용</Label>
                <Textarea id = "memo" placeholder = "실제 구력, 매너, 매칭 주의사항, 선호 성향 등을 적어두세요." value = {memoText} onChange = {(e) => setMemoText(e.target.value)} className = {styles.textareaIcon}
                />
                <p className = {styles.descriptionText2}>참가자에게 공개되지 않는 운영자 전용 정보입니다.</p>
              </div>
            </div>
            <div className = {styles.footerActions}>
              <Button variant = "outline" className = {styles.roundButton5} onClick = {() => setMemoModalOpen(false)}>
                취소
              </Button>
              <Button className = {styles.roundButton5} onClick = {saveMemo}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
