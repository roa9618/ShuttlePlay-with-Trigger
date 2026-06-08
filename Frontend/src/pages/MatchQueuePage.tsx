import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Sparkles, RefreshCw, Edit, Plus, ShieldAlert, Users } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './MatchQueuePage.styles';

export default function MatchQueuePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);
  const { message, showMessage } = useActionFeedback();

  const queue = [
    {
      teamA: ['김민수', '박지영'],
      teamB: ['이준호', '최서연'],
      mmrDiff: 12,
      balance: '매우 좋음',
      reason: 'MMR이 균형있게 분배되었습니다',
      details: ['혼복 MMR 차이 12', '연속 휴식 2회 참가자 우선', '파트너 중복 없음'],
    },
    {
      teamA: ['정민재', '강수진'],
      teamB: ['오유진', '한지우'],
      mmrDiff: 25,
      balance: '좋음',
      reason: '최근 경기 횟수를 고려한 매칭입니다',
      details: ['총 경기 수가 적은 참가자 포함', '성별 보정 적용', '상대 중복 1회 이하'],
    },
    {
      teamA: ['송민호', '윤서아'],
      teamB: ['장현우', '김나영'],
      mmrDiff: 8,
      balance: '매우 좋음',
      reason: '실력이 비슷한 선수들끼리 매칭되었습니다',
      details: ['B-C 구간 중심', '신규 참가자 첫 경기 보호', '팀 예상 승률 51:49'],
    },
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
          <div className = {styles.row2}>
            <Button className = {styles.roundButton} onClick = {() => showMessage('자동 매칭 후보를 다시 생성했습니다.')}
            >
              <Sparkles className = {styles.arrowLeftIcon} />
              자동 매칭 생성
            </Button>
          </div>
        </div>
      </div>

      <div className = {styles.content}>
        <div className = {styles.sectionHeader}>
          <h1 className = {styles.pageTitle}>경기 후보 큐</h1>
          <p className = {styles.descriptionText}>
            다음 경기 후보를 확인하고 시작하세요
          </p>
        </div>

        <div className = {styles.grid}>
          <div className = {styles.header2}>
            <div className = {styles.row3}>
              <Sparkles className = {styles.sparklesIcon} />
              <h2 className = {styles.sectionTitle}>생성 조건</h2>
            </div>
            <div className = {styles.cardGrid}>
              <div className = {styles.stack}>
                <Label>경기 유형</Label>
                <Select defaultValue = "mixed">
                  <SelectTrigger className = {styles.selectTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "mens">남자 복식</SelectItem>
                    <SelectItem value = "womens">여자 복식</SelectItem>
                    <SelectItem value = "mixed">혼합 복식</SelectItem>
                    <SelectItem value = "open">성별 무관</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className = {styles.stack}>
                <Label>운영 성향</Label>
                <Select defaultValue = "competitive">
                  <SelectTrigger className = {styles.selectTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "casual">즐겜</SelectItem>
                    <SelectItem value = "competitive">빡겜</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className = {styles.statsGrid}>
              <Input className = {styles.selectTrigger} defaultValue = "연속 경기 2회 제한" />
              <Input className = {styles.selectTrigger} defaultValue = "중복 조합 회피" />
              <Input className = {styles.selectTrigger} defaultValue = "신규 참가자 보호" />
            </div>
            <div className = {styles.wrapRow}>
              <Button className = {styles.roundButton} onClick = {() => showMessage('전체 후보를 생성했습니다.')}>
                <Sparkles className = {styles.arrowLeftIcon} />
                전체 후보 생성
              </Button>
              <Button variant = "outline" className = {styles.roundButton} onClick = {() => showMessage('선택 후보를 재생성했습니다.')}>
                <RefreshCw className = {styles.arrowLeftIcon} />
                선택 후보만 재생성
              </Button>
            </div>
          </div>

          <div className = {styles.header2}>
            <div className = {styles.row3}>
              <Users className = {styles.sparklesIcon} />
              <h2 className = {styles.sectionTitle}>수동 조정</h2>
            </div>
            <div className = {styles.cardGrid2}>
              {['강제 포함', '강제 제외', '고정 파트너', '회피 조합'].map((label) => (
                <Button key = {label} variant = "outline" className = {styles.adjustmentButton(selectedAdjustments.includes(label))} onClick = {() => {
                    setSelectedAdjustments((prev) => prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]);
                    showMessage(`${label} 조건을 ${selectedAdjustments.includes(label) ? '해제했습니다.' : '추가했습니다.'}`);
                  }}
                >
                  <Plus className = {styles.arrowLeftIcon} />
                  {label} 추가
                </Button>
              ))}
            </div>
            <div className = {styles.summaryBox}>
              <div className = {styles.mediaRow}>
                <ShieldAlert className = {styles.shieldAlertIcon} />
                <div>
                  <p className = {styles.summaryText}>매칭 실패 없음</p>
                  <p className = {styles.descriptionText2}>
                    조건이 맞지 않는 참가자는 실패 처리하지 않고 대기 상태로 남기며, 다음 코트가 열릴 때 다시 후보에 넣습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className = {styles.stack2}>
          {queue.map((match, idx) => (
            <div key = {idx} className = {styles.header3}>
              <div className = {styles.betweenRow}>
                <div className = {styles.row4}>
                  <div className = {styles.row5}>
                    <Badge className = {styles.badge}>
                      후보 {idx + 1}
                    </Badge>
                    <Badge variant = "outline" className = {
                      match.balance === '매우 좋음'
                        ? 'border-primary text-primary'
                        : 'border-accent text-accent-foreground'
                    }>
                      팀 밸런스: {match.balance}
                    </Badge>
                    <Badge variant = "outline">
                      MMR 차이 {match.mmrDiff}
                    </Badge>
                  </div>

                  <div className = {styles.statsGrid2}>
                    <div className = {styles.summaryBox2}>
                      <p className = {styles.descriptionText3}>A팀</p>
                      <div className = {styles.stack}>
                        {match.teamA.map((player, pIdx) => (
                          <div key = {pIdx} className = {styles.row6}>
                            <div className = {styles.row7}>
                              <span className = {styles.labelText}>
                                {player[0]}
                              </span>
                            </div>
                            <span className = {styles.summaryText}>{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className = {styles.centeredBlock}>
                      <span className = {styles.mutedText}>vs</span>
                    </div>

                    <div className = {styles.summaryBox2}>
                      <p className = {styles.descriptionText3}>B팀</p>
                      <div className = {styles.stack}>
                        {match.teamB.map((player, pIdx) => (
                          <div key = {pIdx} className = {styles.row6}>
                            <div className = {styles.row7}>
                              <span className = {styles.labelText}>
                                {player[0]}
                              </span>
                            </div>
                            <span className = {styles.summaryText}>{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className = {styles.summaryBox3}>
                    <p className = {styles.descriptionText2}>
                      <span className = {styles.labelText2}>매칭 설명:</span> {match.reason}
                    </p>
                    <div className = {styles.wrapRow2}>
                      {match.details.map((detail) => (
                        <Badge key = {detail} variant = "outline">{detail}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className = {styles.stack3}>
                  <Button className = {styles.roundButton2} onClick = {() => {
                      navigate(`/sessions/${sessionId}/current`);
                    }}
                  >
                    경기 시작
                  </Button>
                  <Button variant = "outline" size = "sm" className = {styles.roundButton} onClick = {() => showMessage(`후보 ${idx + 1} 참가자 교체 모드를 열었습니다.`)}
                  >
                    <Edit className = {styles.arrowLeftIcon} />
                    참가자 교체
                  </Button>
                  <Button variant = "outline" size = "sm" className = {styles.roundButton} onClick = {() => showMessage(`후보 ${idx + 1}의 A/B팀을 교체했습니다.`)}
                  >
                    팀 교체
                  </Button>
                  <Button variant = "outline" size = "sm" className = {styles.roundButton} onClick = {() => showMessage(`후보 ${idx + 1}을 재생성했습니다.`)}
                  >
                    <RefreshCw className = {styles.arrowLeftIcon} />
                    재생성
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {queue.length === 0 && (
          <div className = {styles.summaryBox4}>
            <Sparkles className = {styles.sparklesIcon2} />
            <h3 className = {styles.cardTitle}>경기 후보가 없습니다</h3>
            <p className = {styles.descriptionText4}>
              자동 매칭을 사용하여 새로운 경기를 생성하세요
            </p>
            <Button className = {styles.roundButton} onClick = {() => showMessage('자동 매칭 후보를 생성했습니다.')}
            >
              <Sparkles className = {styles.arrowLeftIcon} />
              자동 매칭 생성
            </Button>
          </div>
        )}
        {message && (
          <div className = {styles.floatingNotice}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
