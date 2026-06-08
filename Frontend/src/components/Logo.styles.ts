const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
} as const;

export const styles = {
  link: (className: string) => ['inline-block', className].filter(Boolean).join(' '),
  image: (size: keyof typeof sizeClasses) => `${sizeClasses[size]} w-auto object-contain`,
} as const;
