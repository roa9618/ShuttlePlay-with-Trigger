import { Link } from 'react-router-dom';
import logoImg from '../assets/shuttleplay-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  return (
    <Link to = "/" className = {`inline-block ${className}`}>
      <img src = {logoImg} alt = "ShuttlePlay" className = {`${sizeClasses[size]} w-auto object-contain`}
      />
    </Link>
  );
}
