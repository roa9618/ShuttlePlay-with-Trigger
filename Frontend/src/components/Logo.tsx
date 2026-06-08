import { Link } from 'react-router-dom';
import logoImg from '../assets/shuttleplay-logo.png';
import { styles } from './Logo.styles';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <Link to = "/" className = {styles.link(className)}>
      <img src = {logoImg} alt = "ShuttlePlay" className = {styles.image(size)}
      />
    </Link>
  );
}
