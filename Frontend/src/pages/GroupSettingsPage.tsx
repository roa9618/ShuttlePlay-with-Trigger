import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Settings, Trash2, Users, SlidersHorizontal } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './GroupSettingsPage.styles';

export default function GroupSettingsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { message, showMessage } = useActionFeedback();
  const [deleteArmed, setDeleteArmed] = useState(false);

  const [formData, setFormData] = useState({
    groupName: '강남 배드민턴 클럽',
    location: '강남구민회관',
    description: '즐겁게 배드민턴 치는 강남 지역 클럽입니다. 매주 화, 목, 일에 모여서 운동합니다.',
    allowGuestJoin: true,
    autoApproveMembers: false,
    requireSkillLevel: true,
    defaultSessionType: 'regular',
    defaultCourts: '4',
    defaultMatchType: 'mixed',
    defaultPlayStyle: 'competitive',
    protectNewPlayers: true,
    avoidDuplicatePartners: true,
    useFlexibleGender: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showMessage('모임 설정을 저장했습니다.');
    window.setTimeout(() => navigate(`/groups/${groupId}`), 500);
  };

  const handleDeleteGroup = () => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      showMessage('한 번 더 누르면 모임이 삭제됩니다.');
      return;
    }
    showMessage('모임을 삭제했습니다.');
    window.setTimeout(() => navigate('/groups'), 500);
  };

  return (
    <div className = {styles.page}>
      <div className = {styles.header}>
        <div className = {styles.headerInner}>
          <div className = {styles.row}>
            <Link to = {`/groups/${groupId}`} className = {styles.backLink}>
              <ArrowLeft className = {styles.arrowLeftIcon} />
              모임 상세
            </Link>
            <Logo size = "sm" />
          </div>
        </div>
      </div>

      <div className = {styles.content}>
        <div className = {styles.sectionHeader}>
          <div className = {styles.row2}>
            <Settings className = {styles.settingsIcon} />
            <h1 className = {styles.pageTitle}>모임 설정</h1>
          </div>
          <p className = {styles.descriptionText}>
            모임 정보와 운영 설정을 관리하세요
          </p>
        </div>

        <form onSubmit = {handleSave} className = {styles.form}>
          {message && (
            <div className = {styles.contentBox}>
              {message}
            </div>
          )}
          {/* Basic Info */}
          <div className = {styles.header2}>
            <div className = {styles.row3}>
              <Users className = {styles.usersIcon} />
              <h2 className = {styles.sectionTitle}>기본 정보</h2>
            </div>

            <div className = {styles.stack}>
              <div className = {styles.stack2}>
                <Label htmlFor = "groupName">모임 이름</Label>
                <Input id = "groupName" value = {formData.groupName} onChange = {(e) => setFormData({ ...formData, groupName: e.target.value })} placeholder = "모임 이름을 입력하세요" className = {styles.input}
                  required
                />
              </div>

              <div className = {styles.stack2}>
                <Label htmlFor = "location">장소</Label>
                <Input id = "location" value = {formData.location} onChange = {(e) => setFormData({ ...formData, location: e.target.value })} placeholder = "운동하는 장소를 입력하세요" className = {styles.input}
                  required
                />
              </div>

              <div className = {styles.stack2}>
                <Label htmlFor = "description">모임 소개</Label>
                <Textarea id = "description" value = {formData.description} onChange = {(e) => setFormData({ ...formData, description: e.target.value })} placeholder = "모임에 대한 간단한 소개를 입력하세요" className = {styles.textareaIcon}
                />
                <p className = {styles.descriptionText2}>
                  모임의 특징, 운동 일정, 분위기 등을 자유롭게 작성하세요
                </p>
              </div>
            </div>
          </div>

          {/* Participation Settings */}
          <div className = {styles.header2}>
            <div className = {styles.row3}>
              <Settings className = {styles.usersIcon} />
              <h2 className = {styles.sectionTitle}>참여 설정</h2>
            </div>

            <div className = {styles.stack}>
              <div className = {styles.betweenRow}>
                <div className = {styles.row4}>
                  <p className = {styles.summaryText}>비회원 참여 허용</p>
                  <p className = {styles.descriptionText2}>
                    비회원도 세션에 참여할 수 있도록 허용합니다
                  </p>
                </div>
                <Switch checked = {formData.allowGuestJoin} onCheckedChange = {(checked) => setFormData({ ...formData, allowGuestJoin: checked })}
                />
              </div>

              <div className = {styles.betweenRow}>
                <div className = {styles.row4}>
                  <p className = {styles.summaryText}>멤버 자동 승인</p>
                  <p className = {styles.descriptionText2}>
                    가입 요청을 자동으로 승인합니다
                  </p>
                </div>
                <Switch checked = {formData.autoApproveMembers} onCheckedChange = {(checked) => setFormData({ ...formData, autoApproveMembers: checked })}
                />
              </div>

              <div className = {styles.betweenRow}>
                <div className = {styles.row4}>
                  <p className = {styles.summaryText}>급수 정보 필수</p>
                  <p className = {styles.descriptionText2}>
                    가입 시 급수 정보 입력을 필수로 합니다
                  </p>
                </div>
                <Switch checked = {formData.requireSkillLevel} onCheckedChange = {(checked) => setFormData({ ...formData, requireSkillLevel: checked })}
                />
              </div>
            </div>
          </div>

          <div className = {styles.header2}>
            <div className = {styles.row3}>
              <SlidersHorizontal className = {styles.usersIcon} />
              <h2 className = {styles.sectionTitle}>기본 매칭 설정</h2>
            </div>

            <div className = {styles.cardGrid}>
              <div className = {styles.stack2}>
                <Label>기본 세션 구분</Label>
                <Select value = {formData.defaultSessionType} onValueChange = {(value) => setFormData({ ...formData, defaultSessionType: value })}
                >
                  <SelectTrigger className = {styles.input}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "regular">정기 운동</SelectItem>
                    <SelectItem value = "casual">번개 운동</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.stack2}>
                <Label>기본 코트 수</Label>
                <Select value = {formData.defaultCourts} onValueChange = {(value) => setFormData({ ...formData, defaultCourts: value })}
                >
                  <SelectTrigger className = {styles.input}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3', '4', '5', '6'].map((court) => (
                      <SelectItem key = {court} value = {court}>{court}개</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className = {styles.stack2}>
                <Label>기본 경기 유형</Label>
                <Select value = {formData.defaultMatchType} onValueChange = {(value) => setFormData({ ...formData, defaultMatchType: value })}
                >
                  <SelectTrigger className = {styles.input}>
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
                <Label>기본 운영 성향</Label>
                <Select value = {formData.defaultPlayStyle} onValueChange = {(value) => setFormData({ ...formData, defaultPlayStyle: value })}
                >
                  <SelectTrigger className = {styles.input}>
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
              {[
                ['신규 참가자 보호', 'protectNewPlayers'],
                ['파트너·상대 중복 회피', 'avoidDuplicatePartners'],
                ['성별 보정 매칭 허용', 'useFlexibleGender'],
              ].map(([label, key]) => (
                <div key = {key} className = {styles.betweenRow2}>
                  <p className = {styles.summaryText}>{label}</p>
                  <Switch checked = {formData[key as 'protectNewPlayers' | 'avoidDuplicatePartners' | 'useFlexibleGender']} onCheckedChange = {(checked) => setFormData({ ...formData, [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className = {styles.row5}>
            <Link to = {`/groups/${groupId}`} className = {styles.row4}>
              <Button variant = "outline" className = {styles.fullWidthButton} size = "lg" type = "button"
              >
                취소
              </Button>
            </Link>
            <Button type = "submit" className = {styles.submitButton} size = "lg"
            >
              변경사항 저장
            </Button>
          </div>

          {/* Danger Zone */}
          <div className = {styles.contentBox2}>
            <div className = {styles.mediaRow}>
              <div className = {styles.row6}>
                <Trash2 className = {styles.trash2Icon} />
              </div>
              <div className = {styles.row4}>
                <h3 className = {styles.cardTitle}>위험 영역</h3>
                <p className = {styles.descriptionText3}>
                  모임을 삭제하면 모든 세션 기록과 데이터가 영구적으로 삭제됩니다.
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <Button type = "button" variant = "destructive" className = {styles.roundButton} onClick = {handleDeleteGroup}
                >
                  <Trash2 className = {styles.arrowLeftIcon} />
                  {deleteArmed ? '정말 삭제하기' : '모임 삭제하기'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
