import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Play, CheckCircle, Clock, QrCode, Monitor, Sparkles, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './OrganizerDashboardPage.styles';

export default function OrganizerDashboardPage() {
  const { sessionId } = useParams();
  const { message, showMessage } = useActionFeedback();
  const [lateParticipants, setLateParticipants] = useState([
    { name: '정민재', eta: '19:40', reason: '퇴근 지연', status: '지각 예정' },
    { name: '문별이', eta: '19:50', reason: '대중교통 지연', status: '지각 예정' },
  ]);

  const currentMatches = [
    { court: 1, teamA: ['김민수', '박지영'], teamB: ['이준호', '최서연'] },
    { court: 2, teamA: ['정민재', '강수진'], teamB: ['오유진', '한지우'] },
    { court: 3, teamA: ['송민호', '윤서아'], teamB: ['장현우', '김나영'] },
    { court: 4, teamA: ['최지훈', '서예린'], teamB: ['박준영', '이수민'] },
  ];

  const matchQueue = [
    { teamA: ['강태양', '문별이'], teamB: ['임나윤', '조유진'], mmr: 12 },
    { teamA: ['백승호', '신지원'], teamB: ['홍예슬', '안준서'], mmr: 8 },
  ];

  const pendingResults = [
    { court: 1, players: '김민수/박지영 vs 이준호/최서연' },
    { court: 3, players: '송민호/윤서아 vs 장현우/김나영' },
  ];

  return (
    <div className = {styles.page}>
      {/* Sticky Header */}
      <div className = {styles.header}>
        <div className = {styles.betweenRow}>
          <div className = {styles.row}>
            <Logo size = "sm" />
            <div className = {styles.verticalDivider} />
            <div>
              <h1 className = {styles.pageTitle}>6월 3일 (화) 저녁 운동</h1>
              <p className = {styles.descriptionText}>19:00 - 22:00</p>
            </div>
          </div>
          <div className = {styles.row2}>
            <Link to = {`/sessions/${sessionId}/display`}>
              <Button variant = "outline" size = "sm" className = {styles.roundButton}>
                <Monitor className = {styles.monitorIcon} />
                큰 화면
              </Button>
            </Link>
          <Button variant = "outline" size = "sm" className = {styles.roundButton} onClick = {() => showMessage('초대 QR을 준비했습니다.')}
          >
              <QrCode className = {styles.monitorIcon} />
              초대 QR
            </Button>
            <Button variant = "destructive" size = "sm" className = {styles.roundButton2} onClick = {() => showMessage('세션 종료 전 확인이 필요합니다.')}>
              종료
            </Button>
          </div>
        </div>

        <div className = {styles.statsGrid}>
          {[
            ['미출석', '1명'],
            ['불참', '1명'],
            ['경기 가능', '6명'],
            ['일시 휴식', '2명'],
            ['퇴장', '0명'],
            ['결과 미입력', '2경기'],
          ].map(([label, value]) => (
            <div key = {label} className = {styles.header2}>
              <p className = {styles.descriptionText2}>{label}</p>
              <p className = {styles.summaryText}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className = {styles.contentBox}>
        <div className = {styles.panel}>
          <div className = {styles.betweenRow2}>
            <div>
              <h2 className = {styles.sectionTitle}>오늘 운영</h2>
              <p className = {styles.descriptionText3}>왼쪽부터 차례대로 진행합니다.</p>
            </div>
            <Badge className = {styles.badge}>진행 중</Badge>
          </div>
          <div className = {styles.statsGrid2}>
            <Link to = {`/sessions/${sessionId}/participants`}>
              <div className = {styles.summaryBox}>
                <div className = {styles.row3}>1</div>
                <h3 className = {styles.cardTitle}>출석 확인</h3>
                <p className = {styles.descriptionText}>도착, 지각, 휴식 상태를 정리합니다.</p>
              </div>
            </Link>
            <Link to = {`/sessions/${sessionId}/queue`}>
              <div className = {styles.summaryBox}>
                <div className = {styles.row3}>2</div>
                <h3 className = {styles.cardTitle}>경기 만들기</h3>
                <p className = {styles.descriptionText}>후보를 확인하고 코트에 배정합니다.</p>
              </div>
            </Link>
            <Link to = {`/sessions/${sessionId}/result/new`}>
              <div className = {styles.summaryBox}>
                <div className = {styles.row3}>3</div>
                <h3 className = {styles.cardTitle}>결과 입력</h3>
                <p className = {styles.descriptionText}>끝난 경기의 승패와 점수를 저장합니다.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 1. 세션 상태 요약 - 가장 먼저 */}
        <div className = {styles.grid}>
          <div className = {styles.card}>
            <div className = {styles.row4}>
              <UserCheck className = {styles.userCheckIcon} />
              <p className = {styles.summaryText2}>출석</p>
            </div>
            <p className = {styles.summaryText3}>14명</p>
            <p className = {styles.descriptionText4}>전체 16명</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row4}>
              <Play className = {styles.userCheckIcon} />
              <p className = {styles.summaryText2}>경기 중</p>
            </div>
            <p className = {styles.summaryText3}>8명</p>
            <p className = {styles.descriptionText4}>4개 코트</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row4}>
              <Clock className = {styles.clockIcon} />
              <p className = {styles.summaryText2}>대기 중</p>
            </div>
            <p className = {styles.summaryText3}>6명</p>
            <p className = {styles.descriptionText4}>다음 순서</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row4}>
              <UserX className = {styles.userXIcon} />
              <p className = {styles.summaryText2}>지각</p>
            </div>
            <p className = {styles.summaryText3}>2명</p>
            <p className = {styles.descriptionText4}>10분 내 도착</p>
          </div>

          <div className = {styles.header3}>
            <div className = {styles.row4}>
              <CheckCircle className = {styles.userCheckIcon} />
              <p className = {styles.summaryText2}>완료 경기</p>
            </div>
            <p className = {styles.summaryText3}>12개</p>
            <p className = {styles.descriptionText4}>평균 3회/명</p>
          </div>
        </div>

        {/* 2. 빠른 액션 바 */}
        <div className = {styles.row5}>
          <p className = {styles.summaryText4}>빠른 작업:</p>
          <Link to = {`/sessions/${sessionId}/queue`}>
            <Button className = {styles.roundButton}>
              <Sparkles className = {styles.monitorIcon} />
              자동 매칭 생성
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/participants`}>
            <Button variant = "outline" className = {styles.roundButton2}>
              출석 처리
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/participants`}>
            <Button variant = "outline" className = {styles.roundButton2}>
              지각자 확인
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/queue`}>
            <Button variant = "outline" className = {styles.roundButton2}>
              후보 수정
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/report`}>
            <Button variant = "outline" className = {styles.roundButton2}>
              세션 리포트
            </Button>
          </Link>
          <Link to = {`/sessions/${sessionId}/participants`}>
            <Button variant = "outline" className = {styles.roundButton}>
              <Users className = {styles.monitorIcon} />
              참가자 관리
            </Button>
          </Link>
        </div>

        <div className = {styles.statsGrid3}>
          {/* Left: 현재 경기 + 다음 큐 */}
          <div className = {styles.stack}>
            {/* 3. 현재 진행 중 경기 */}
            <div>
              <div className = {styles.betweenRow3}>
                <h2 className = {styles.sectionTitle2}>현재 경기</h2>
                <Link to = {`/sessions/${sessionId}/current`}>
                  <Button variant = "ghost" size = "sm" className = {styles.actionButton}>
                    상세보기
                  </Button>
                </Link>
              </div>

              <div className = {styles.cardGrid}>
                {currentMatches.map((match) => (
                  <div key = {match.court} className = {styles.header3}>
                    <div className = {styles.betweenRow3}>
                      <Badge className = {styles.badge}>
                        {match.court}번 코트
                      </Badge>
                      <Badge variant = "outline" className = {styles.badge2}>복식</Badge>
                    </div>

                    <div className = {styles.stack2}>
                      <div className = {styles.smallText}>
                        <p className = {styles.summaryText5}>{match.teamA.join(' · ')}</p>
                      </div>
                      <p className = {styles.descriptionText5}>vs</p>
                      <div className = {styles.smallText}>
                        <p className = {styles.summaryText5}>{match.teamB.join(' · ')}</p>
                      </div>
                    </div>

                    <div className = {styles.cardGrid2}>
                      <Link to = {`/sessions/${sessionId}/result/new`}>
                        <Button size = "sm" variant = "outline" className = {styles.fullWidthButton}>
                          결과 입력
                        </Button>
                      </Link>
                      <Link to = {`/sessions/${sessionId}/result/${match.court}/edit`}>
                        <Button size = "sm" variant = "ghost" className = {styles.fullWidthButton}>
                          수정
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 다음 경기 후보 큐 */}
            <div>
              <div className = {styles.betweenRow3}>
                <h2 className = {styles.sectionTitle2}>다음 경기 후보</h2>
                <div className = {styles.row6}>
                  <Link to = {`/sessions/${sessionId}/queue`}>
                    <Button variant = "ghost" size = "sm" className = {styles.actionButton}>
                      전체보기
                    </Button>
                  </Link>
                  <Link to = {`/sessions/${sessionId}/queue`}>
                    <Button size = "sm" className = {styles.roundButton}>
                    <Sparkles className = {styles.monitorIcon} />
                    자동 생성
                    </Button>
                  </Link>
                </div>
              </div>

              <div className = {styles.stack3}>
                {matchQueue.map((match, idx) => (
                  <div key = {idx} className = {styles.header4}>
                    <div className = {styles.betweenRow4}>
                      <div className = {styles.row7}>
                        <Badge variant = "outline">후보 {idx + 1}</Badge>
                        <div className = {styles.smallText}>
                          <span className = {styles.summaryText5}>{match.teamA.join(' · ')}</span>
                          <span className = {styles.mutedText}>vs</span>
                          <span className = {styles.summaryText5}>{match.teamB.join(' · ')}</span>
                        </div>
                        <Badge variant = "outline" className = {styles.badge2}>MMR +{match.mmr}</Badge>
                      </div>
                      <Link to = {`/sessions/${sessionId}/current`}>
                        <Button size = "sm" className = {styles.roundButton2}>
                          시작
                        </Button>
                      </Link>
                      <Link to = {`/sessions/${sessionId}/queue`}>
                        <Button size = "sm" variant = "outline" className = {styles.roundButton2}>
                          교체
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}

                {matchQueue.length === 0 && (
                  <div className = {styles.summaryBox2}>
                    <p className = {styles.descriptionText6}>경기 후보가 없습니다</p>
                    <Link to = {`/sessions/${sessionId}/queue`}>
                      <Button size = "sm" className = {styles.roundButton}>
                      <Sparkles className = {styles.monitorIcon} />
                      자동 매칭 생성
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: 결과 입력 대기 + 참가자 */}
          <div className = {styles.stack4}>
            {/* 5. 결과 입력 대기 (눈에 띄게) */}
            {pendingResults.length > 0 && (
              <div className = {styles.contentBox2}>
                <div className = {styles.row8}>
                  <AlertCircle className = {styles.alertCircleIcon} />
                  <div>
                    <h3 className = {styles.cardTitle2}>결과 입력 대기</h3>
                    <p className = {styles.paragraphText}>{pendingResults.length}개 경기</p>
                  </div>
                </div>

                <div className = {styles.stack2}>
                  {pendingResults.map((result, idx) => (
                    <div key = {idx} className = {styles.contentBox3}>
                      <Badge variant = "outline" className = {styles.badge3}>{result.court}번 코트</Badge>
                      <p className = {styles.descriptionText2}>{result.players}</p>
                    </div>
                  ))}
                </div>

                <Link to = {`/sessions/${sessionId}/result/new`}>
                  <Button className = {styles.fullWidthButton2}>
                    지금 입력하기
                  </Button>
                </Link>
              </div>
            )}

            {/* 6. 참가자 간단 목록 */}
            <div className = {styles.header3}>
              <div className = {styles.betweenRow3}>
                <h3 className = {styles.summaryText5}>참가자</h3>
                <Link to = {`/sessions/${sessionId}/participants`}>
                  <Button variant = "ghost" size = "sm" className = {styles.actionButton2}>
                    관리
                  </Button>
                </Link>
              </div>

              <div className = {styles.stack5}>
                {[
                  { name: '김민수', status: 'playing', court: 1 },
                  { name: '박지영', status: 'playing', court: 1 },
                  { name: '이준호', status: 'waiting' },
                  { name: '최서연', status: 'waiting' },
                  { name: '정민재', status: 'late' },
                  { name: '강수진', status: 'waiting' },
                ].map((p, idx) => (
                  <div key = {idx} className = {styles.betweenRow5}>
                    <div className = {styles.row2}>
                      <div className = {styles.row9}>
                        <span className = {styles.labelText}>{p.name[0]}</span>
                      </div>
                      <span className = {styles.smallText}>{p.name}</span>
                    </div>
                    {p.status === 'playing' && (
                      <Badge className = {styles.badge4}>
                        {p.court}번
                      </Badge>
                    )}
                    {p.status === 'waiting' && (
                      <Badge variant = "outline" className = {styles.badge2}>대기</Badge>
                    )}
                    {p.status === 'late' && (
                      <Badge variant = "outline" className = {styles.badge5}>지각</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className = {styles.header3}>
              <h3 className = {styles.cardTitle3}>지각 예정</h3>
              <div className = {styles.stack3}>
                {lateParticipants.map((late) => (
                  <div key = {late.name} className = {styles.summaryBox3}>
                    <div className = {styles.betweenRow6}>
                      <p className = {styles.summaryText5}>{late.name}</p>
                      <Badge variant = "outline">{late.status === '지각 예정' ? `${late.eta} 도착` : late.status}</Badge>
                    </div>
                    <p className = {styles.descriptionText7}>{late.reason}</p>
                    <div className = {styles.row6}>
                      <Button size = "sm" variant = "outline" className = {styles.roundButton2} onClick = {() => {
                          setLateParticipants((prev) => prev.map((item) => item.name === late.name ? { ...item, status: '도착 완료' } : item));
                          showMessage(`${late.name} 도착 처리했습니다.`);
                        }}
                      >
                        도착 처리
                      </Button>
                      <Button size = "sm" className = {styles.roundButton2} onClick = {() => {
                          setLateParticipants((prev) => prev.map((item) => item.name === late.name ? { ...item, status: '경기 가능' } : item));
                          showMessage(`${late.name}님을 경기 가능 상태로 변경했습니다.`);
                        }}
                      >
                        경기 가능
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className = {styles.floatingNotice}>
          {message}
        </div>
      )}
    </div>
  );
}
