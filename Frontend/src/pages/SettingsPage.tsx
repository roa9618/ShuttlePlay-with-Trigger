import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, User, Bell, Palette, LogOut, Wifi, Smartphone } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './SettingsPage.styles';

export default function SettingsPage() {
  const { message, showMessage } = useActionFeedback();
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  return (
    <div className = {styles.page}>
      <div className = {styles.emptyState}>
        <Logo size = "sm" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = "/" className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          홈으로
        </Link>

        <div className = {styles.stack}>
          <h1 className = {styles.pageTitle}>설정</h1>
          <p className = {styles.descriptionText}>
            프로필과 서비스 설정을 관리하세요
          </p>
        </div>

        <div className = {styles.header}>
          <div className = {styles.stack2}>
            <div className = {styles.row}>
              <User className = {styles.userIcon} />
              <h2 className = {styles.sectionTitle}>프로필 설정</h2>
            </div>

            <div className = {styles.stack3}>
              <div className = {styles.row2}>
                <div className = {styles.row3}>
                  <span className = {styles.labelText}>김</span>
                </div>
              </div>

              <div className = {styles.stack4}>
                <Label htmlFor = "name">이름</Label>
                <Input id = "name" defaultValue = "김민수" className = {styles.input}
                />
              </div>

              <div className = {styles.stack4}>
                <Label htmlFor = "email">이메일</Label>
                <Input id = "email" type = "email" defaultValue = "minsu@example.com" className = {styles.input}
                  disabled
                />
                <p className = {styles.descriptionText2}>
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <div className = {styles.cardGrid}>
                <div className = {styles.stack4}>
                  <Label htmlFor = "gender">성별</Label>
                  <Select defaultValue = "male">
                    <SelectTrigger id = "gender" className = {styles.input}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value = "male">남성</SelectItem>
                      <SelectItem value = "female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className = {styles.stack4}>
                  <Label htmlFor = "age">나이대</Label>
                  <Select defaultValue = "30s">
                    <SelectTrigger id = "age" className = {styles.input}>
                      <SelectValue />
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

              <div className = {styles.stack4}>
                <Label htmlFor = "level">급수</Label>
                <Select defaultValue = "B">
                  <SelectTrigger id = "level" className = {styles.input}>
                    <SelectValue />
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
            </div>
          </div>

          <div className = {styles.footerActions}>
            <div className = {styles.row}>
              <Bell className = {styles.userIcon} />
              <h2 className = {styles.sectionTitle}>알림 설정</h2>
            </div>

            <div className = {styles.stack3}>
              <div className = {styles.betweenRow}>
                <div>
                  <p className = {styles.summaryText}>다음 경기 알림</p>
                  <p className = {styles.descriptionText2}>
                    내 차례가 되면 알림을 받습니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className = {styles.betweenRow}>
                <div>
                  <p className = {styles.summaryText}>세션 시작 알림</p>
                  <p className = {styles.descriptionText2}>
                    오늘 세션이 시작될 때 알림을 받습니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className = {styles.betweenRow}>
                <div>
                  <p className = {styles.summaryText}>결과 입력 알림</p>
                  <p className = {styles.descriptionText2}>
                    경기 결과 입력이 필요할 때 알림을 받습니다
                  </p>
                </div>
                <Switch />
              </div>

              <div className = {styles.cardGrid2}>
                {['상단 배너', '토스트', '모달', '소리', '진동', '다음 경기 카드 강조'].map((item) => (
                  <div key = {item} className = {styles.betweenRow2}>
                    <span className = {styles.inlineText}>{item}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className = {styles.footerActions}>
            <div className = {styles.row}>
              <Smartphone className = {styles.userIcon} />
              <h2 className = {styles.sectionTitle}>PWA·푸시 설정</h2>
            </div>

            <div className = {styles.cardGrid3}>
              <div className = {styles.summaryBox}>
                <p className = {styles.summaryText2}>홈 화면 설치</p>
                <p className = {styles.descriptionText3}>앱 설치 없이 홈 화면에서 바로 실행합니다.</p>
                <Button variant = "outline" className = {styles.roundButton} onClick = {() => setInstallGuideOpen((open) => !open)}>
                  설치 안내 보기
                </Button>
                {installGuideOpen && (
                  <p className = {styles.descriptionText4}>
                    브라우저 공유 메뉴에서 홈 화면에 추가를 선택하면 바로 실행할 수 있습니다.
                  </p>
                )}
              </div>
              <div className = {styles.summaryBox}>
                <p className = {styles.summaryText2}>푸시 알림 권한</p>
                <p className = {styles.descriptionText3}>다음 경기, 경기 시작, 출석 요청을 받습니다.</p>
                <Button className = {styles.roundButton} onClick = {() => showMessage('푸시 알림 권한을 요청했습니다.')}>
                  권한 요청
                </Button>
              </div>
            </div>
          </div>

          <div className = {styles.footerActions}>
            <div className = {styles.row}>
              <Wifi className = {styles.userIcon} />
              <h2 className = {styles.sectionTitle}>실시간 동기화</h2>
            </div>

            <div className = {styles.stack5}>
              {[
                ['초기 데이터', 'REST로 최근 세션 상태를 불러옴', '정상'],
                ['WebSocket', '출석, 상태, 매칭 큐, 결과 변경 이벤트 수신', '연결됨'],
                ['재연결', '연결이 끊기면 REST 재동기화 후 재구독', '대기'],
                ['폴링 대체', 'WebSocket 장애 시 주기적으로 상태 갱신', '꺼짐'],
              ].map(([title, desc, status]) => (
                <div key = {title} className = {styles.betweenRow3}>
                  <div>
                    <p className = {styles.summaryText}>{title}</p>
                    <p className = {styles.descriptionText2}>{desc}</p>
                  </div>
                  <span className = {styles.labelText2}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className = {styles.footerActions}>
            <div className = {styles.row}>
              <Palette className = {styles.userIcon} />
              <h2 className = {styles.sectionTitle}>테마 설정</h2>
            </div>

            <div className = {styles.stack4}>
              <Label htmlFor = "theme">테마</Label>
              <Select defaultValue = "light">
                <SelectTrigger id = "theme" className = {styles.input}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value = "light">라이트 모드</SelectItem>
                  <SelectItem value = "dark">다크 모드</SelectItem>
                  <SelectItem value = "auto">시스템 설정</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className = {styles.footerActions2}>
            {message && (
              <div className = {styles.contentBox}>
                {message}
              </div>
            )}
            <Button className = {styles.fullWidthButton} size = "lg" onClick = {() => showMessage('변경사항을 저장했습니다.')}>
              변경사항 저장
            </Button>

            <Button variant = "outline" className = {styles.fullWidthButton2} size = "lg" onClick = {() => showMessage('로그아웃했습니다.')}
            >
              <LogOut className = {styles.logOutIcon} />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
