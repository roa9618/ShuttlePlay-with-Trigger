import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import ShuttlecockIcon from '../components/ShuttlecockIcon';
import { Button } from '../components/ui/button';
import { Sparkles } from 'lucide-react';
import { styles } from './NotFoundPage.styles';

export default function NotFoundPage() {
  return (
    <div className = {styles.page}>
      <div className = {styles.decorativeShape} />
      <div className = {styles.decorativeShape2}>
        <ShuttlecockIcon size = {120} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape3}>
        <ShuttlecockIcon size = {80} className = {styles.shuttlecockIcon} />
      </div>
      <div className = {styles.decorativeShape4}>
        <Sparkles className = {styles.sparklesIcon} />
      </div>

      <div className = {styles.authPanel}>
        <div className = {styles.sectionHeader}>
          <div className = {styles.row}>
            <Logo size = "lg" />
          </div>
          <div className = {styles.titleGroup}>
            <h1 className = {styles.pageTitle}>페이지를 찾을 수 없습니다</h1>
            <p className = {styles.descriptionText}>
              요청하신 주소를 다시 확인해주세요
            </p>
          </div>
        </div>

        <div className = {styles.card}>
          <div className = {styles.cardContent}>
            <p className = {styles.errorCode}>404</p>
            <p className = {styles.cardDescription}>
              주소가 변경되었거나 아직 준비되지 않은 페이지입니다.
            </p>
          </div>

          <Link to = "/">
            <Button className = {styles.primaryButton} size = "lg">
              홈으로 가기
            </Button>
          </Link>
        </div>

        <div className = {styles.centeredBlock}>
          <span className = {styles.mutedText}>참여 중인 모임을 확인하시겠어요? </span>
          <Link to = "/groups" className = {styles.primaryLink}>
            내 모임 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
