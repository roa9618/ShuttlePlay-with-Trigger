export const styles = {
  header: [
    'desktop-sidebar sticky top-0 z-40 flex h-screen w-64',
    'flex-col overflow-visible border-r border-border bg-card',
  ].join(' '),
  contentBox: 'flex h-20 items-center border-b border-border px-8',
  profileSection: [
    'relative flex min-h-[220px] items-center justify-center',
    'border-b border-border px-4 py-5',
  ].join(' '),
  profileCard: [
    'flex w-full flex-col items-center',
    'px-3 py-5 text-center',
  ].join(' '),
  profileImageWrapper: 'relative',
  profileImage: [
    'h-20 w-20 shrink-0 rounded-[24px] object-cover',
    'shadow-md shadow-primary/15',
  ].join(' '),
  profileFallback: [
    'flex h-20 w-20 shrink-0 items-center justify-center',
    'rounded-[24px] bg-primary/10 text-xl font-semibold text-primary',
    'shadow-md shadow-primary/10',
  ].join(' '),
  profileName: [
    'mt-4 block max-w-full truncate',
    'text-base font-semibold text-foreground',
  ].join(' '),
  profileBadges: 'mt-3 flex items-center justify-center gap-2',
  profileBadge: [
    'rounded-full border border-primary/15 bg-primary/[0.06]',
    'px-3 py-1.5 text-xs font-medium text-primary',
  ].join(' '),
  notificationWrapper: 'absolute right-5 top-5 z-50',
  notificationButton: [
    'h-9 w-9 rounded-xl text-muted-foreground',
    'hover:bg-primary/10 hover:text-primary',
  ].join(' '),
  notificationIcon: 'h-[18px] w-[18px]',
  notificationCount: [
    'absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4',
    'items-center justify-center rounded-full bg-primary px-1',
    'text-[9px] font-semibold leading-none text-primary-foreground',
  ].join(' '),
  notificationPanel: [
    'absolute left-[calc(100%+0.75rem)] top-0 z-[60] w-[390px]',
    'overflow-hidden rounded-3xl border border-border',
    'bg-card shadow-2xl shadow-primary/10',
  ].join(' '),
  notificationHeader: [
    'flex items-center justify-between border-b border-primary/10',
    'px-5 py-4',
    '[&>div>strong]:block [&>div>strong]:text-base',
    '[&>div>strong]:font-semibold',
    '[&>div>span]:mt-0.5 [&>div>span]:block',
    '[&>div>span]:text-xs [&>div>span]:text-muted-foreground',
    '[&>button]:flex [&>button]:items-center [&>button]:gap-1.5',
    '[&>button]:rounded-full [&>button]:px-3 [&>button]:py-2',
    '[&>button]:text-xs [&>button]:font-medium [&>button]:text-primary',
    '[&>button]:transition-colors [&>button]:hover:bg-primary/10',
    '[&>button]:disabled:pointer-events-none [&>button]:disabled:opacity-40',
    '[&>button>svg]:h-3.5 [&>button>svg]:w-3.5',
  ].join(' '),
  notificationList: 'max-h-[420px] divide-y divide-primary/10 overflow-y-auto',
  notificationItem: (read: boolean) => [
    'flex w-full gap-3.5 px-5 py-4 text-left transition-colors',
    'hover:bg-primary/[0.05]',
    read ? 'bg-card' : 'bg-primary/[0.025]',
  ].join(' '),
  notificationItemIcon: [
    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center',
    'rounded-xl bg-primary/10 text-primary',
    '[&_svg]:h-4 [&_svg]:w-4',
  ].join(' '),
  notificationItemContent: [
    'min-w-0 flex-1',
    '[&>div]:flex [&>div]:items-center [&>div]:gap-2',
    '[&>div>strong]:truncate [&>div>strong]:text-sm',
    '[&>div>strong]:font-semibold',
    '[&>div>span]:h-2 [&>div>span]:w-2',
    '[&>div>span]:shrink-0 [&>div>span]:rounded-full',
    '[&>div>span]:bg-primary',
    '[&>p]:mt-1 [&>p]:line-clamp-2 [&>p]:text-xs',
    '[&>p]:leading-5 [&>p]:text-muted-foreground',
    '[&>time]:mt-1.5 [&>time]:block [&>time]:text-[11px]',
    '[&>time]:text-muted-foreground/80',
  ].join(' '),
  notificationEmpty: [
    'm-3 flex min-h-52 flex-col items-center justify-center',
    'rounded-2xl bg-primary/[0.04] px-5 text-center',
    '[&>strong]:mt-3 [&>strong]:text-sm [&>strong]:font-medium',
    '[&>span]:mt-1 [&>span]:text-xs [&>span]:leading-5',
    '[&>span]:text-muted-foreground',
  ].join(' '),
  notificationEmptyIcon: [
    'flex h-10 w-10 items-center justify-center rounded-full',
    'bg-primary/10 text-primary',
    '[&_svg]:h-4 [&_svg]:w-4',
  ].join(' '),
  notificationFooter: [
    'border-t border-primary/10 p-3',
    '[&_button]:h-10 [&_button]:w-full [&_button]:rounded-full',
    '[&_button]:text-primary [&_button]:hover:bg-primary/10',
  ].join(' '),
  row: 'flex-1 space-y-1 p-4',
  iconIcon: 'w-5 h-5',
  labelText: 'font-medium',
  footerActions: 'p-4 border-t border-border',
  fullWidthButton: 'w-full justify-start gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl',
  logOutIcon: 'w-4 h-4',
  navLink: (active: boolean) => [
    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
    active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  ].join(' '),
  subNav: (open: boolean) => [
    'grid overflow-hidden transition-[grid-template-rows,opacity,transform,margin] duration-300 ease-out',
    '[&>div]:ml-5 [&>div]:space-y-1 [&>div]:overflow-hidden [&>div]:border-l [&>div]:border-primary/15 [&>div]:pl-3',
    open
      ? 'mt-1 grid-rows-[1fr] translate-y-0 opacity-100'
      : 'pointer-events-none mt-0 grid-rows-[0fr] -translate-y-1 opacity-0',
  ].join(' '),
  subNavLink: (active: boolean) => [
    'flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors',
    '[&_svg]:h-3.5 [&_svg]:w-3.5 [&>span]:h-1.5 [&>span]:w-1.5 [&>span]:rounded-full',
    active
      ? 'bg-primary/10 text-primary [&>span]:bg-primary'
      : 'text-muted-foreground hover:bg-primary/[0.05] hover:text-primary [&>span]:bg-muted-foreground/35',
  ].join(' '),
} as const;
