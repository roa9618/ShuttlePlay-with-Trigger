import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Calendar, Clock, Play, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { styles } from './CreateSessionPage.styles';

export default function CreateSessionPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '6월 3일 (화) 운동',
    date: '2026-06-03',
    startTime: '19:00',
    endTime: '22:00',
    courts: '4',
    sessionType: 'regular',
    matchType: 'mixed',
    playStyle: 'competitive',
    quickAddMembers: true,
    allowGuestJoin: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/sessions/demo/dashboard`);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.content}>
          <Link to = {`/groups/${groupId}`} className = {styles.backLink}>
            <ArrowLeft className = {styles.arrowLeftIcon} />
            모임으로 돌아가기
          </Link>
        </div>
      </div>

      <div className = {styles.content2}>
        <div className = {styles.sectionHeader}>
          <div className = {styles.row}>
            <Calendar className = {styles.calendarIcon} />
          </div>
          <h1 className = {styles.pageTitle}>세션 만들기</h1>
          <p className = {styles.descriptionText}>
            오늘의 배드민턴 세션 정보를 입력하세요
          </p>
        </div>

        <div className = {styles.header2}>
          <form onSubmit = {handleSubmit} className = {styles.form}>
            {/* 기본 정보 */}
            <div>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <Calendar className = {styles.calendarIcon2} />
                </div>
                기본 정보
              </h2>

              <div className = {styles.stack}>
                <div className = {styles.stack2}>
                  <Label htmlFor = "session-name">세션명 *</Label>
                  <Input id = "session-name" type = "text" placeholder = "예: 6월 3일 일요일 운동" className = {styles.input} value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className = {styles.statsGrid}>
                  <div className = {styles.stack3}>
                    <Label htmlFor = "date">날짜 *</Label>
                    <Input id = "date" type = "date" className = {styles.input} value = {formData.date} onChange = {(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className = {styles.stack2}>
                    <Label htmlFor = "start-time">시작 시간 *</Label>
                    <div className = {styles.inputWrapper}>
                      <Clock className = {styles.clockIcon} />
                      <Input id = "start-time" type = "time" className = {styles.input2} value = {formData.startTime} onChange = {(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className = {styles.stack2}>
                    <Label htmlFor = "end-time">종료 시간 *</Label>
                    <div className = {styles.inputWrapper}>
                      <Clock className = {styles.clockIcon} />
                      <Input id = "end-time" type = "time" className = {styles.input2} value = {formData.endTime} onChange = {(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className = {styles.stack2}>
                  <Label htmlFor = "session-type">세션 구분</Label>
                  <Select value = {formData.sessionType} onValueChange = {(value) => setFormData({ ...formData, sessionType: value })}
                  >
                    <SelectTrigger id = "session-type" className = {styles.input}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value = "regular">정기 운동</SelectItem>
                      <SelectItem value = "casual">번개 운동</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className = {styles.stack2}>
                  <Label htmlFor = "courts">코트 수 *</Label>
                  <Select value = {formData.courts} onValueChange = {(value) => setFormData({ ...formData, courts: value })}
                  >
                    <SelectTrigger id = "courts" className = {styles.input}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value = "1">1개</SelectItem>
                      <SelectItem value = "2">2개</SelectItem>
                      <SelectItem value = "3">3개</SelectItem>
                      <SelectItem value = "4">4개</SelectItem>
                      <SelectItem value = "5">5개</SelectItem>
                      <SelectItem value = "6">6개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 경기 설정 */}
            <div className = {styles.footerActions}>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <Settings className = {styles.calendarIcon2} />
                </div>
                경기 설정
              </h2>

              <div className = {styles.stack}>
                <div className = {styles.stack2}>
                  <Label htmlFor = "match-type">기본 경기 유형</Label>
                  <Select value = {formData.matchType} onValueChange = {(value) => setFormData({ ...formData, matchType: value })}
                  >
                    <SelectTrigger id = "match-type" className = {styles.input}>
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

                <div className = {styles.stack2}>
                  <Label htmlFor = "play-style">기본 플레이 스타일</Label>
                  <Select value = {formData.playStyle} onValueChange = {(value) => setFormData({ ...formData, playStyle: value })}
                  >
                    <SelectTrigger id = "play-style" className = {styles.input}>
                      <SelectValue />
                    </SelectTrigger>
                  <SelectContent>
                      <SelectItem value = "casual">즐겜</SelectItem>
                      <SelectItem value = "competitive">빡겜</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className = {styles.descriptionText2}>
                    빡겜은 MMR 밸런스를 더 강하게 보고, 즐겜은 대기 시간과 중복 조합을 더 크게 봅니다
                  </p>
                </div>

                <div className = {styles.cardGrid}>
                  <div className = {styles.betweenRow}>
                    <div className = {styles.row3}>
                      <Users className = {styles.usersIcon} />
                      <div>
                        <p className = {styles.summaryText}>기존 멤버 빠른 추가</p>
                        <p className = {styles.descriptionText2}>모임 멤버를 오늘 세션 후보로 불러옵니다</p>
                      </div>
                    </div>
                    <Switch checked = {formData.quickAddMembers} onCheckedChange = {(checked) => setFormData({ ...formData, quickAddMembers: checked })}
                    />
                  </div>

                  <div className = {styles.betweenRow}>
                    <div>
                      <p className = {styles.summaryText}>비회원 링크 참여</p>
                      <p className = {styles.descriptionText2}>QR 또는 공유 링크로 게스트 참가를 허용합니다</p>
                    </div>
                    <Switch checked = {formData.allowGuestJoin} onCheckedChange = {(checked) => setFormData({ ...formData, allowGuestJoin: checked })}
                    />
                  </div>
                </div>

                <div className = {styles.summaryBox}>
                  <h3 className = {styles.cardTitle}>세션을 만들면</h3>
                  <ul className = {styles.list}>
                    <li className = {styles.listItem}>
                      <div className = {styles.row4} />
                      <span>참가자를 초대하고 출석을 관리할 수 있어요</span>
                    </li>
                    <li className = {styles.listItem}>
                      <div className = {styles.row4} />
                      <span>자동 매칭으로 빠르게 경기를 시작할 수 있어요</span>
                    </li>
                    <li className = {styles.listItem}>
                      <div className = {styles.row4} />
                      <span>경기 결과를 입력하고 MMR을 자동 계산해요</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className = {styles.footerActions2}>
              <Link to = {`/groups/${groupId}`} className = {styles.link}>
                <Button type = "button" variant = "outline" className = {styles.fullWidthButton} size = "lg"
                >
                  취소
                </Button>
              </Link>
              <Button type = "submit" className = {styles.submitButton} size = "lg"
              >
                <Play className = {styles.playIcon} />
                세션 만들기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
