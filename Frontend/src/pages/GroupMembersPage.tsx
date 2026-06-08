import { Link, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Search, Filter, Users, Trophy, Calendar } from 'lucide-react';
import { useActionFeedback } from '../utils/useActionFeedback';
import { styles } from './GroupMembersPage.styles';

export default function GroupMembersPage() {
  const { groupId } = useParams();
  const { message, showMessage } = useActionFeedback();

  const allMembers = [
    { name: '김민수', level: 'B', age: '30대', gender: '남', sessions: 24, wins: 42, losses: 28, winRate: 60 },
    { name: '박지영', level: 'A', age: '20대', gender: '여', sessions: 18, wins: 38, losses: 22, winRate: 63 },
    { name: '이준호', level: 'D', age: '40대', gender: '남', sessions: 12, wins: 15, losses: 21, winRate: 42 },
    { name: '최서연', level: 'B', age: '30대', gender: '여', sessions: 21, wins: 35, losses: 30, winRate: 54 },
    { name: '정민재', level: 'B', age: '30대', gender: '남', sessions: 19, wins: 32, losses: 26, winRate: 55 },
    { name: '강수진', level: 'C', age: '20대', gender: '여', sessions: 15, wins: 22, losses: 23, winRate: 49 },
    { name: '오유진', level: 'B', age: '30대', gender: '여', sessions: 20, wins: 34, losses: 28, winRate: 55 },
    { name: '한지우', level: 'A', age: '20대', gender: '남', sessions: 17, wins: 36, losses: 24, winRate: 60 },
    { name: '윤서아', level: 'D', age: '30대', gender: '여', sessions: 10, wins: 12, losses: 18, winRate: 40 },
    { name: '장현우', level: 'B', age: '40대', gender: '남', sessions: 22, wins: 38, losses: 32, winRate: 54 },
    { name: '송민호', level: 'A', age: '30대', gender: '남', sessions: 16, wins: 30, losses: 20, winRate: 60 },
    { name: '임채원', level: 'B', age: '20대', gender: '여', sessions: 14, wins: 24, losses: 22, winRate: 52 },
    { name: '전수현', level: 'C', age: '30대', gender: '여', sessions: 11, wins: 18, losses: 19, winRate: 49 },
    { name: '노태준', level: 'S', age: '30대', gender: '남', sessions: 25, wins: 52, losses: 23, winRate: 69 },
    { name: '홍지민', level: 'B', age: '20대', gender: '여', sessions: 13, wins: 22, losses: 20, winRate: 52 },
  ];

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
          <h1 className = {styles.pageTitle}>전체 멤버</h1>
          <p className = {styles.descriptionText}>
            강남 배드민턴 클럽의 모든 멤버를 확인하세요
          </p>
        </div>

        {/* Stats */}
        <div className = {styles.grid}>
          <div className = {styles.card}>
            <p className = {styles.summaryText}>{allMembers.length}</p>
            <p className = {styles.descriptionText2}>전체 멤버</p>
          </div>
          <div className = {styles.header2}>
            <p className = {styles.summaryText}>{allMembers.filter(m => m.gender === '남').length}</p>
            <p className = {styles.descriptionText2}>남성</p>
          </div>
          <div className = {styles.header2}>
            <p className = {styles.summaryText}>{allMembers.filter(m => m.gender === '여').length}</p>
            <p className = {styles.descriptionText2}>여성</p>
          </div>
          <div className = {styles.header2}>
            <p className = {styles.summaryText2}>{Math.round(allMembers.reduce((sum, m) => sum + m.sessions, 0) / allMembers.length)}</p>
            <p className = {styles.descriptionText2}>평균 참여</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className = {styles.header3}>
          <div className = {styles.row2}>
            <div className = {styles.row3}>
              <Search className = {styles.searchIcon} />
              <Input placeholder = "멤버 이름으로 검색" className = {styles.input}
              />
            </div>
            <Select defaultValue = "all">
              <SelectTrigger className = {styles.selectTrigger}>
                <Filter className = {styles.filterIcon} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value = "all">전체</SelectItem>
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

        {/* Members Grid */}
        <div className = {styles.statsGrid}>
          {allMembers.map((member, idx) => (
            <div key = {idx} className = {styles.header4}
            >
              <div className = {styles.mediaRow}>
                <div className = {styles.row4}>
                  <span className = {styles.labelText}>
                    {member.name[0]}
                  </span>
                </div>
                <div className = {styles.row5}>
                  <h3 className = {styles.cardTitle}>{member.name}</h3>
                  <div className = {styles.wrapRow}>
                    <Badge className = {styles.badge}>{member.level}</Badge>
                    <Badge variant = "outline">{member.gender}</Badge>
                    <Badge variant = "outline">{member.age}</Badge>
                  </div>
                </div>
              </div>

              <div className = {styles.footerActions}>
                <div className = {styles.summaryBox}>
                  <div className = {styles.row6}>
                    <Calendar className = {styles.calendarIcon} />
                  </div>
                  <p className = {styles.summaryText3}>{member.sessions}</p>
                  <p className = {styles.descriptionText3}>참여</p>
                </div>
                <div className = {styles.summaryBox}>
                  <div className = {styles.row6}>
                    <Trophy className = {styles.calendarIcon} />
                  </div>
                  <p className = {styles.summaryText3}>{member.winRate}%</p>
                  <p className = {styles.descriptionText3}>승률</p>
                </div>
              </div>

              <div className = {styles.mutedText}>
                {member.wins}승 {member.losses}패
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className = {styles.contentBox}>
          <div className = {styles.row}>
            <div className = {styles.row7}>
              <Users className = {styles.usersIcon} />
            </div>
            <div className = {styles.row8}>
              <h3 className = {styles.cardTitle2}>새로운 멤버를 초대하세요</h3>
              <p className = {styles.descriptionText4}>
                친구들을 초대하여 함께 배드민턴을 즐겨보세요
              </p>
              <Button className = {styles.roundButton} onClick = {() => showMessage('멤버 초대 링크를 준비했습니다.')}>
                멤버 초대하기
              </Button>
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
