import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, UserPlus, User, Award } from 'lucide-react';
import { useState } from 'react';
import { styles } from './GuestJoinPage.styles';

export default function GuestJoinPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    level: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/sessions/${sessionId}/attendance`);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <Logo size = "md" className = {styles.logoWrapper} />
      </div>

      <div className = {styles.content}>
        <Link to = {`/sessions/${sessionId}/join`} className = {styles.backLink}>
          <ArrowLeft className = {styles.arrowLeftIcon} />
          돌아가기
        </Link>

        <div className = {styles.stack}>
          <div className = {styles.row}>
            <UserPlus className = {styles.userPlusIcon} />
          </div>
          <div>
            <h1 className = {styles.pageTitle}>비회원 참여</h1>
            <p className = {styles.descriptionText}>
              간단한 정보만 입력하면 바로 참여할 수 있어요
            </p>
          </div>
        </div>

        <div className = {styles.header2}>
          <form onSubmit = {handleSubmit} className = {styles.form}>
            <div>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <User className = {styles.userIcon} />
                </div>
                기본 정보
              </h2>

              <div className = {styles.stack2}>
                <div className = {styles.stack3}>
                  <Label htmlFor = "name">이름 *</Label>
                  <Input id = "name" type = "text" placeholder = "이름을 입력하세요" className = {styles.input} value = {formData.name} onChange = {(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className = {styles.cardGrid}>
                  <div className = {styles.stack3}>
                    <Label htmlFor = "gender">성별 *</Label>
                    <Select value = {formData.gender} onValueChange = {(value) => setFormData({ ...formData, gender: value })}
                      required
                    >
                      <SelectTrigger id = "gender" className = {styles.input}>
                        <SelectValue placeholder = "선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value = "male">남성</SelectItem>
                        <SelectItem value = "female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className = {styles.stack3}>
                    <Label htmlFor = "age">나이대 *</Label>
                    <Select value = {formData.age} onValueChange = {(value) => setFormData({ ...formData, age: value })}
                      required
                    >
                      <SelectTrigger id = "age" className = {styles.input}>
                        <SelectValue placeholder = "선택" />
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
              </div>
            </div>

            <div className = {styles.footerActions}>
              <h2 className = {styles.sectionTitle}>
                <div className = {styles.row2}>
                  <Award className = {styles.userIcon} />
                </div>
                실력 정보
              </h2>

              <div className = {styles.stack2}>
                <div className = {styles.stack3}>
                  <Label htmlFor = "level">급수 *</Label>
                  <Select value = {formData.level} onValueChange = {(value) => setFormData({ ...formData, level: value })}
                    required
                  >
                    <SelectTrigger id = "level" className = {styles.input}>
                      <SelectValue placeholder = "선택하세요" />
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
                  <p className = {styles.descriptionText2}>
                    실력에 맞는 매칭을 위해 정확하게 선택해주세요
                  </p>
                </div>

                <div className = {styles.summaryBox}>
                  <h3 className = {styles.cardTitle}>급수 선택 가이드</h3>
                  <ul className = {styles.list}>
                    <li className = {styles.listItem}>
                      <div className = {styles.row3} />
                      <span><strong>E/D:</strong> 시작 또는 기초 단계</span>
                    </li>
                    <li className = {styles.listItem}>
                      <div className = {styles.row3} />
                      <span><strong>C/B/A:</strong> 기본 랠리와 경기 운영이 가능한 단계</span>
                    </li>
                    <li className = {styles.listItem}>
                      <div className = {styles.row3} />
                      <span><strong>S/SS:</strong> 상위 실력 또는 대회 경험이 많은 단계</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className = {styles.footerActions2}>
              <Button type = "submit" className = {styles.submitButton} size = "lg">
                <UserPlus className = {styles.userPlusIcon2} />
                참여하기
              </Button>
              <Link to = {`/sessions/${sessionId}/join`} className = {styles.cardLink}>
                <Button type = "button" variant = "outline" className = {styles.fullWidthButton} size = "lg">
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </div>

        <div className = {styles.contentBox}>
          <h3 className = {styles.cardTitle2}>다음에도 ShuttlePlay를 사용하실 예정이라면</h3>
          <p className = {styles.descriptionText3}>
            회원가입하면 내 기록을 관리하고 더 편하게 사용할 수 있어요
          </p>
          <Link to = "/signup">
            <Button variant = "outline" className = {styles.roundButton}>
              <UserPlus className = {styles.arrowLeftIcon} />
              회원가입하고 더 편하게 사용하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
