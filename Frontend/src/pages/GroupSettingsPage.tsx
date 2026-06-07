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
    <div className = "min-h-screen bg-background">
      <div className = "border-b border-border bg-card">
        <div className = "max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className = "flex items-center gap-6">
            <Link to = {`/groups/${groupId}`} className = "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className = "w-4 h-4" />
              모임 상세
            </Link>
            <Logo size = "sm" />
          </div>
        </div>
      </div>

      <div className = "max-w-5xl mx-auto px-6 py-8">
        <div className = "mb-6">
          <div className = "flex items-center gap-3 mb-2">
            <Settings className = "w-8 h-8 text-primary" />
            <h1 className = "text-4xl font-medium">모임 설정</h1>
          </div>
          <p className = "text-muted-foreground">
            모임 정보와 운영 설정을 관리하세요
          </p>
        </div>

        <form onSubmit = {handleSave} className = "space-y-8">
          {message && (
            <div className = "rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm text-primary">
              {message}
            </div>
          )}
          {/* Basic Info */}
          <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
            <div className = "flex items-center gap-3 pb-4 border-b border-border">
              <Users className = "w-5 h-5 text-primary" />
              <h2 className = "text-2xl font-medium">기본 정보</h2>
            </div>

            <div className = "space-y-4">
              <div className = "space-y-2">
                <Label htmlFor = "groupName">모임 이름</Label>
                <Input id = "groupName" value = {formData.groupName} onChange = {(e) => setFormData({ ...formData, groupName: e.target.value })} placeholder = "모임 이름을 입력하세요" className = "rounded-xl"
                  required
                />
              </div>

              <div className = "space-y-2">
                <Label htmlFor = "location">장소</Label>
                <Input id = "location" value = {formData.location} onChange = {(e) => setFormData({ ...formData, location: e.target.value })} placeholder = "운동하는 장소를 입력하세요" className = "rounded-xl"
                  required
                />
              </div>

              <div className = "space-y-2">
                <Label htmlFor = "description">모임 소개</Label>
                <Textarea id = "description" value = {formData.description} onChange = {(e) => setFormData({ ...formData, description: e.target.value })} placeholder = "모임에 대한 간단한 소개를 입력하세요" className = "min-h-24 rounded-xl"
                />
                <p className = "text-sm text-muted-foreground">
                  모임의 특징, 운동 일정, 분위기 등을 자유롭게 작성하세요
                </p>
              </div>
            </div>
          </div>

          {/* Participation Settings */}
          <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
            <div className = "flex items-center gap-3 pb-4 border-b border-border">
              <Settings className = "w-5 h-5 text-primary" />
              <h2 className = "text-2xl font-medium">참여 설정</h2>
            </div>

            <div className = "space-y-4">
              <div className = "flex items-center justify-between">
                <div className = "flex-1">
                  <p className = "font-medium">비회원 참여 허용</p>
                  <p className = "text-sm text-muted-foreground">
                    비회원도 세션에 참여할 수 있도록 허용합니다
                  </p>
                </div>
                <Switch checked = {formData.allowGuestJoin} onCheckedChange = {(checked) => setFormData({ ...formData, allowGuestJoin: checked })}
                />
              </div>

              <div className = "flex items-center justify-between">
                <div className = "flex-1">
                  <p className = "font-medium">멤버 자동 승인</p>
                  <p className = "text-sm text-muted-foreground">
                    가입 요청을 자동으로 승인합니다
                  </p>
                </div>
                <Switch checked = {formData.autoApproveMembers} onCheckedChange = {(checked) => setFormData({ ...formData, autoApproveMembers: checked })}
                />
              </div>

              <div className = "flex items-center justify-between">
                <div className = "flex-1">
                  <p className = "font-medium">급수 정보 필수</p>
                  <p className = "text-sm text-muted-foreground">
                    가입 시 급수 정보 입력을 필수로 합니다
                  </p>
                </div>
                <Switch checked = {formData.requireSkillLevel} onCheckedChange = {(checked) => setFormData({ ...formData, requireSkillLevel: checked })}
                />
              </div>
            </div>
          </div>

          <div className = "bg-card border border-border rounded-3xl p-8 space-y-6">
            <div className = "flex items-center gap-3 pb-4 border-b border-border">
              <SlidersHorizontal className = "w-5 h-5 text-primary" />
              <h2 className = "text-2xl font-medium">기본 매칭 설정</h2>
            </div>

            <div className = "grid md:grid-cols-2 gap-4">
              <div className = "space-y-2">
                <Label>기본 세션 구분</Label>
                <Select value = {formData.defaultSessionType} onValueChange = {(value) => setFormData({ ...formData, defaultSessionType: value })}
                >
                  <SelectTrigger className = "rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "regular">정기 운동</SelectItem>
                    <SelectItem value = "casual">번개 운동</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className = "space-y-2">
                <Label>기본 코트 수</Label>
                <Select value = {formData.defaultCourts} onValueChange = {(value) => setFormData({ ...formData, defaultCourts: value })}
                >
                  <SelectTrigger className = "rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3', '4', '5', '6'].map((court) => (
                      <SelectItem key = {court} value = {court}>{court}개</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className = "space-y-2">
                <Label>기본 경기 유형</Label>
                <Select value = {formData.defaultMatchType} onValueChange = {(value) => setFormData({ ...formData, defaultMatchType: value })}
                >
                  <SelectTrigger className = "rounded-xl">
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

              <div className = "space-y-2">
                <Label>기본 운영 성향</Label>
                <Select value = {formData.defaultPlayStyle} onValueChange = {(value) => setFormData({ ...formData, defaultPlayStyle: value })}
                >
                  <SelectTrigger className = "rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value = "casual">즐겜</SelectItem>
                    <SelectItem value = "competitive">빡겜</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className = "grid md:grid-cols-3 gap-4">
              {[
                ['신규 참가자 보호', 'protectNewPlayers'],
                ['파트너·상대 중복 회피', 'avoidDuplicatePartners'],
                ['성별 보정 매칭 허용', 'useFlexibleGender'],
              ].map(([label, key]) => (
                <div key = {key} className = "flex items-center justify-between rounded-2xl border border-border p-5">
                  <p className = "font-medium">{label}</p>
                  <Switch checked = {formData[key as 'protectNewPlayers' | 'avoidDuplicatePartners' | 'useFlexibleGender']} onCheckedChange = {(checked) => setFormData({ ...formData, [key]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className = "flex gap-3">
            <Link to = {`/groups/${groupId}`} className = "flex-1">
              <Button variant = "outline" className = "w-full rounded-full" size = "lg" type = "button"
              >
                취소
              </Button>
            </Link>
            <Button type = "submit" className = "flex-1 rounded-full" size = "lg"
            >
              변경사항 저장
            </Button>
          </div>

          {/* Danger Zone */}
          <div className = "bg-destructive/10 border-2 border-destructive/30 rounded-3xl p-8">
            <div className = "flex items-start gap-6">
              <div className = "w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className = "w-8 h-8 text-destructive" />
              </div>
              <div className = "flex-1">
                <h3 className = "text-xl font-medium mb-2 text-destructive">위험 영역</h3>
                <p className = "text-muted-foreground mb-4">
                  모임을 삭제하면 모든 세션 기록과 데이터가 영구적으로 삭제됩니다.
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <Button type = "button" variant = "destructive" className = "rounded-full gap-2" onClick = {handleDeleteGroup}
                >
                  <Trash2 className = "w-4 h-4" />
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
