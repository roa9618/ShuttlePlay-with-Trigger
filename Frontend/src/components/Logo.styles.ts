const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
} as const;

export const styles = {
  link: (className: string) => [
    'inline-flex cursor-pointer rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:drop-shadow-[0_8px_16px_rgba(79,70,229,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    className,
  ].filter(Boolean).join(' '),
  image: (size: keyof typeof sizeClasses) => `${sizeClasses[size]} w-auto object-contain transition-transform duration-200 hover:scale-[1.03]`,
} as const;
