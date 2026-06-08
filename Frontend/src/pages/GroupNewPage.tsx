import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Users, MapPin, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { styles } from './GroupNewPage.styles';

export default function GroupNewPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    defaultTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/groups');
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.content}>
          <Link to = "/groups" className = {styles.backLink}>
            <ArrowLeft className = {styles.arrowLeftIcon} />
            모임 목록으로
          </Link>
        </div>
      </div>

      <div className = {styles.content2}>
        <div className = {styles.sectionHeader}>
          <div className = {styles.row}>
            <Users className = {styles.usersIcon} />
          </div>
          <h1 className = {styles.pageTitle}>새로운 모임 만들기</h1>
          <p className = {styles.descriptionText}>
            친구들과 함께 배드민턴 모임을 시작하세요
          </p>
        </div>

        <div className = {styles.header2}>
          <form onSubmit = {handleSubmit} className = {styles.form}>
            {/* 기본 정보 */}
            <div>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <Users className = {styles.usersIcon2} />
                </div>
                기본 정보
              </h2>

              <div className = {styles.stack}>
                <div className = {styles.stack2}>
                  <Label htmlFor = "name">모임 이름 *</Label>
                  <Input id = "name" type = "text" placeholder = "예: 강남 배드민턴 클럽" className = {styles.input} value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <p className = {styles.descriptionText2}>
                    모임을 잘 나타내는 이름을 지어주세요
                  </p>
                </div>

                <div className = {styles.stack2}>
                  <Label htmlFor = "location">주요 활동 장소 *</Label>
                  <div className = {styles.inputWrapper}>
                    <MapPin className = {styles.mapPinIcon} />
                    <Input id = "location" type = "text" placeholder = "예: 강남구민회관" className = {styles.input2} value = {formData.location} onChange = {(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <p className = {styles.descriptionText2}>
                    주로 운동하는 체육관이나 장소를 입력하세요
                  </p>
                </div>

                <div className = {styles.stack2}>
                  <Label htmlFor = "description">모임 소개 (선택)</Label>
                  <Textarea id = "description" placeholder = "모임의 분위기나 특징을 자유롭게 소개해주세요" className = {styles.textareaIcon} rows = {4} value = {formData.description} onChange = {(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className = {styles.footerActions}>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <Calendar className = {styles.usersIcon2} />
                </div>
                운영 정보
              </h2>

              <div className = {styles.stack}>
                <div className = {styles.stack2}>
                  <Label htmlFor = "defaultTime">기본 운동 시간 (선택)</Label>
                  <div className = {styles.inputWrapper}>
                    <Clock className = {styles.mapPinIcon} />
                    <Input id = "defaultTime" type = "text" placeholder = "예: 화요일, 목요일 19:00 - 21:00" className = {styles.input2} value = {formData.defaultTime} onChange = {(e) => setFormData({ ...formData, defaultTime: e.target.value })}
                    />
                  </div>
                  <p className = {styles.descriptionText2}>
                    정기적으로 운동하는 요일과 시간을 입력하세요
                  </p>
                </div>

                <div className = {styles.summaryBox}>
                  <h3 className = {styles.cardTitle}>모임을 만들면</h3>
                  <ul className = {styles.list}>
                    <li className = {styles.listItem}>
                      <div className = {styles.row3} />
                      <span>세션을 만들고 참가자를 초대할 수 있어요</span>
                    </li>
                    <li className = {styles.listItem}>
                      <div className = {styles.row3} />
                      <span>자동 매칭으로 빠르게 경기를 생성할 수 있어요</span>
                    </li>
                    <li className = {styles.listItem}>
                      <div className = {styles.row3} />
                      <span>모든 참가자의 기록과 통계를 관리할 수 있어요</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className = {styles.footerActions2}>
              <Link to = "/groups" className = {styles.link}>
                <Button type = "button" variant = "outline" className = {styles.fullWidthButton} size = "lg"
                >
                  취소
                </Button>
              </Link>
              <Button type = "submit" className = {styles.submitButton} size = "lg"
              >
                <Users className = {styles.usersIcon3} />
                모임 만들기
              </Button>
            </div>
          </form>
        </div>

        <div className = {styles.centeredBlock}>
          <p className = {styles.descriptionText2}>
            모임을 만들면 자동으로 운영자가 됩니다. 나중에 다른 멤버를 운영자로 추가할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
