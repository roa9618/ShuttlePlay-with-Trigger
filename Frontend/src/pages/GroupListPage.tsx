import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Users, Calendar, PlusCircle, TrendingUp, Play, Award } from 'lucide-react';
import { styles } from './GroupListPage.styles';

export default function GroupListPage() {
  const groups = [
    { id: 1, name: '강남 배드민턴 클럽', location: '강남구민회관', members: 24, lastSession: '2일 전', sessions: 48, activeMembers: 18 },
    { id: 2, name: '서초 셔틀메이트', location: '서초체육관', members: 18, lastSession: '4일 전', sessions: 32, activeMembers: 14 },
    { id: 3, name: '송파 배린이 모임', location: '송파구민센터', members: 15, lastSession: '1주 전', sessions: 28, activeMembers: 12 },
    { id: 4, name: '역삼 주말 배드민턴', location: '역삼체육관', members: 32, lastSession: '3일 전', sessions: 56, activeMembers: 24 },
    { id: 5, name: '판교 배드민턴 동호회', location: '판교체육관', members: 28, lastSession: '5일 전', sessions: 42, activeMembers: 20 },
    { id: 6, name: '강서 셔틀콕 클럽', location: '강서구민센터', members: 22, lastSession: '1주 전', sessions: 38, activeMembers: 16 },
  ];

  return (
    <div className = {styles.contentBox}>
      {/* Header */}
      <div className = {styles.sectionHeader}>
        <div className = {styles.betweenRow}>
          <div>
            <h1 className = {styles.pageTitle}>내 모임</h1>
            <p className = {styles.descriptionText}>
              참여 중인 배드민턴 모임을 관리하세요
            </p>
          </div>
          <Link to = "/groups/new">
            <Button className = {styles.roundButton}>
              <PlusCircle className = {styles.plusCircleIcon} />
              모임 만들기
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className = {styles.statsGrid}>
        <div className = {styles.contentBox2}>
          <div className = {styles.betweenRow2}>
            <div className = {styles.row}>
              <Users className = {styles.usersIcon} />
            </div>
            <TrendingUp className = {styles.trendingUpIcon} />
          </div>
          <div>
            <p className = {styles.descriptionText2}>참여 중인 모임</p>
            <p className = {styles.summaryText}>{groups.length}개</p>
          </div>
        </div>

        <div className = {styles.header}>
          <div className = {styles.betweenRow2}>
            <div className = {styles.row2}>
              <Play className = {styles.usersIcon} />
            </div>
          </div>
          <div>
            <p className = {styles.descriptionText2}>총 세션</p>
            <p className = {styles.summaryText}>
              {groups.reduce((sum, g) => sum + g.sessions, 0)}회
            </p>
          </div>
        </div>

        <div className = {styles.header}>
          <div className = {styles.betweenRow2}>
            <div className = {styles.row2}>
              <Award className = {styles.usersIcon} />
            </div>
          </div>
          <div>
            <p className = {styles.descriptionText2}>총 멤버</p>
            <p className = {styles.summaryText}>
              {groups.reduce((sum, g) => sum + g.members, 0)}명
            </p>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className = {styles.cardGrid}>
        {groups.map((group) => (
          <Link key = {group.id} to = {`/groups/${group.id}`} className = {styles.cardLink}
          >
            <div className = {styles.header2}>
              {/* Card Header */}
              <div className = {styles.contentBox3}>
                <div className = {styles.betweenRow2}>
                  <div className = {styles.row3}>
                    <h3 className = {styles.cardTitle}>
                      {group.name}
                    </h3>
                    <div className = {styles.row4}>
                      <div className = {styles.row5}>
                        <MapPin className = {styles.mapPinIcon} />
                        <span>{group.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className = {styles.row6}>
                    <Users className = {styles.usersIcon} />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className = {styles.contentBox4}>
                <div className = {styles.statsGrid2}>
                  <div className = {styles.centeredBlock}>
                    <p className = {styles.summaryText2}>{group.members}</p>
                    <p className = {styles.descriptionText3}>총 멤버</p>
                  </div>
                  <div className = {styles.centeredBlock2}>
                    <p className = {styles.summaryText2}>{group.activeMembers}</p>
                    <p className = {styles.descriptionText3}>활동 멤버</p>
                  </div>
                  <div className = {styles.centeredBlock}>
                    <p className = {styles.summaryText2}>{group.sessions}</p>
                    <p className = {styles.descriptionText3}>총 세션</p>
                  </div>
                </div>

                <div className = {styles.betweenRow3}>
                  <div className = {styles.row7}>
                    <Calendar className = {styles.calendarIcon} />
                    <span className = {styles.mutedText}>최근 운동</span>
                  </div>
                  <Badge variant = "outline">{group.lastSession}</Badge>
                </div>

                {/* Action Buttons */}
                <div className = {styles.cardGrid2}>
                  <Button size = "sm" className = {styles.roundButton2} onClick = {(e) => {
                      e.preventDefault();
                      window.location.href = `/groups/${group.id}/create-session`;
                    }}
                  >
                    세션 만들기
                  </Button>
                  <Button size = "sm" variant = "outline" className = {styles.roundButton2} onClick = {(e) => {
                      e.preventDefault();
                      window.location.href = `/groups/${group.id}`;
                    }}
                  >
                    모임 정보
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Add New Group Card */}
        <Link to = "/groups/new" className = {styles.cardLink2}>
          <div className = {styles.stack}>
            <div className = {styles.row8}>
              <PlusCircle className = {styles.plusCircleIcon2} />
            </div>
            <div>
              <h3 className = {styles.cardTitle2}>새로운 모임 만들기</h3>
              <p className = {styles.mutedText}>
                친구들과 함께 배드민턴 모임을 시작하세요
              </p>
            </div>
            <Button className = {styles.roundButton3}>
              <PlusCircle className = {styles.mapPinIcon} />
              모임 만들기
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
