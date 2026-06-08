import Logo from '../components/Logo';
import { Badge } from '../components/ui/badge';
import { QrCode } from 'lucide-react';
import { styles } from './DisplayBoardPage.styles';

export default function DisplayBoardPage() {
  const currentMatches = [
    {
      court: 1,
      teamA: ['김민수', '박지영'],
      teamB: ['이준호', '최서연'],
    },
    {
      court: 2,
      teamA: ['정민재', '강수진'],
      teamB: ['오유진', '한지우'],
    },
    {
      court: 3,
      teamA: ['송민호', '윤서아'],
      teamB: ['장현우', '김나영'],
    },
    {
      court: 4,
      teamA: ['최지훈', '서예린'],
      teamB: ['박준영', '이수민'],
    },
  ];

  const nextMatches = [
    {
      teamA: ['강태양', '문별이'],
      teamB: ['임나윤', '조유진'],
    },
    {
      teamA: ['백승호', '신지원'],
      teamB: ['홍예슬', '안준서'],
    },
  ];

  return (
    <div className = {styles.page}>
      <div className = {styles.content}>
        <div className = {styles.betweenRow}>
          <div className = {styles.row}>
            <Logo size = "lg" />
            <div>
              <h1 className = {styles.pageTitle}>6월 3일 (화) 운동</h1>
              <p className = {styles.descriptionText}>19:00 - 22:00</p>
            </div>
          </div>
          <div className = {styles.rightAlignedBlock}>
            <p className = {styles.summaryText}>21:24</p>
            <p className = {styles.descriptionText2}>현재 시간</p>
          </div>
        </div>

        <div>
          <div className = {styles.row2}>
            <h2 className = {styles.sectionTitle}>현재 경기</h2>
            <Badge className = {styles.badge}>
              진행 중
            </Badge>
          </div>

          <div className = {styles.cardGrid}>
            {currentMatches.map((match) => (
              <div key = {match.court} className = {styles.header}
              >
                <div className = {styles.row3}>
                  <div className = {styles.row4}>
                    <span className = {styles.labelText}>
                      {match.court}
                    </span>
                  </div>
                  <p className = {styles.summaryText2}>번 코트</p>
                </div>

                <div className = {styles.stack}>
                  <div className = {styles.summaryBox}>
                    <p className = {styles.descriptionText3}>A팀</p>
                    <div className = {styles.stack2}>
                      {match.teamA.map((player, idx) => (
                        <p key = {idx} className = {styles.summaryText2}>
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className = {styles.centeredBlock}>
                    <span className = {styles.mutedText}>vs</span>
                  </div>

                  <div className = {styles.summaryBox}>
                    <p className = {styles.descriptionText3}>B팀</p>
                    <div className = {styles.stack2}>
                      {match.teamB.map((player, idx) => (
                        <p key = {idx} className = {styles.summaryText2}>
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className = {styles.sectionTitle2}>다음 경기</h2>

          <div className = {styles.cardGrid}>
            {nextMatches.map((match, idx) => (
              <div key = {idx} className = {styles.header2}
              >
                <div className = {styles.statsGrid}>
                  <div className = {styles.summaryBox2}>
                    <div className = {styles.stack3}>
                      {match.teamA.map((player, pIdx) => (
                        <p key = {pIdx} className = {styles.summaryText3}>
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className = {styles.centeredBlock2}>
                    <span className = {styles.mutedText2}>vs</span>
                  </div>

                  <div className = {styles.summaryBox2}>
                    <div className = {styles.stack3}>
                      {match.teamB.map((player, pIdx) => (
                        <p key = {pIdx} className = {styles.summaryText3}>
                          {player}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className = {styles.contentBox}>
          <div className = {styles.betweenRow}>
            <div className = {styles.row}>
              <QrCode className = {styles.qrCodeIcon} />
              <div>
                <h3 className = {styles.cardTitle}>
                  참여하기
                </h3>
                <p className = {styles.paragraphText}>
                  QR 코드를 스캔하여 오늘 운동에 참여하세요
                </p>
              </div>
            </div>
            <div className = {styles.row5}>
              <QrCode className = {styles.qrCodeIcon2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
