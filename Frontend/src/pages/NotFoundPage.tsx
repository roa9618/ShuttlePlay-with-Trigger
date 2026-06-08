import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Button } from '../components/ui/button';
import { Home, Search, Users } from 'lucide-react';
import { styles } from './NotFoundPage.styles';

export default function NotFoundPage() {
  return (
    <div className = {styles.page}>
      <div className = {styles.stack}>
        <div className = {styles.row}>
          <Logo size = "lg" />
        </div>

        <div className = {styles.stack2}>
          <div className = {styles.row2}>
            <Search className = {styles.searchIcon} />
          </div>
          <div>
            <p className = {styles.summaryText}>404</p>
            <h1 className = {styles.pageTitle}>페이지를 찾을 수 없습니다</h1>
            <p className = {styles.descriptionText}>
              주소가 잘못되었거나, 아직 준비되지 않은 화면입니다.
            </p>
          </div>
        </div>

        <div className = {styles.grid}>
          <Link to = "/">
            <Button className = {styles.fullWidthButton} size = "lg">
              <Home className = {styles.homeIcon} />
              홈으로 가기
            </Button>
          </Link>
          <Link to = "/groups">
            <Button variant = "outline" className = {styles.fullWidthButton} size = "lg">
              <Users className = {styles.homeIcon} />
              내 모임 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
