import type { NotificationType } from '../utils/notificationApi';

export const styles = {
  stack: 'fixed bottom-6 right-6 z-[100] flex w-[360px] max-w-[calc(100vw-3rem)] flex-col gap-3',
  toast: [
    'group relative flex w-full cursor-pointer items-start gap-3 rounded-2xl',
    'border border-primary/15 bg-card px-4 py-4 text-left',
    'shadow-xl shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/30',
  ].join(' '),
  icon: (type: NotificationType) => [
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
    '[&_svg]:h-5 [&_svg]:w-5',
    type === 'MATCH' ? 'bg-primary/10 text-primary' : '',
    type === 'SCHEDULE' ? 'bg-violet-100 text-violet-600' : '',
    type === 'GROUP' ? 'bg-fuchsia-100 text-fuchsia-600' : '',
    type === 'SYSTEM' ? 'bg-secondary text-muted-foreground' : '',
  ].filter(Boolean).join(' '),
  content: 'min-w-0 flex-1 pr-7',
  title: 'block truncate text-sm font-semibold text-foreground',
  message: 'mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground',
  closeButton: [
    'absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full',
    'text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary',
    '[&_svg]:h-4 [&_svg]:w-4',
  ].join(' '),
} as const;
