import type { SVGProps } from 'react';

interface ShuttlecockIconProps {
  className?: string;
  size?: number;
}

export default function ShuttlecockIcon({
  className = '',
  size = 24,
  ...props
}: ShuttlecockIconProps & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Shuttlecock Cork (Base) */}
      <ellipse cx="12" cy="18" rx="3" ry="2" fill="currentColor" opacity="0.3" />

      {/* Feathers */}
      <path
        d="M9 18 L8 8 L10 6 L12 8 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M12 18 L11 6 L12 4 L13 6 Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M15 18 L16 8 L14 6 L12 8 Z"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Cork Detail */}
      <circle cx="12" cy="18.5" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
