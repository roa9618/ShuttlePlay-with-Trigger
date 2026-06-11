export const styles = {
  page: [
    'relative flex min-h-0 min-w-0 flex-1 items-center',
    'overflow-hidden bg-background px-8 py-6',
  ].join(' '),

  pageShell: [
    'relative z-10 mx-auto w-full min-w-0',
    'max-w-[1600px]',
  ].join(' '),

  backgroundGlowTop: [
    'pointer-events-none absolute right-20 top-16',
    'h-72 w-72 rounded-full bg-primary/5 blur-3xl',
  ].join(' '),

  backgroundGlowBottom: [
    'pointer-events-none absolute bottom-10 left-20',
    'h-60 w-60 rounded-full bg-primary/5 blur-3xl',
  ].join(' '),

  header: 'mb-8 flex items-end justify-between',

  title: [
    'text-[40px] font-medium leading-none',
    'tracking-tight text-foreground',
  ].join(' '),

  createButton: [
    'h-11 shrink-0 rounded-full px-5 text-sm',
    'shadow-lg shadow-primary/20',
  ].join(' '),

  buttonIcon: 'h-4 w-4',

  main: 'min-w-0 space-y-5',

  highlightPanel: 'grid min-w-0 grid-cols-3 gap-4',

  highlightItem: [
    'group flex min-w-0 items-center gap-4 overflow-hidden',
    'rounded-[24px] border border-primary/15 bg-card/90 px-5 py-5',
    'shadow-sm shadow-primary/5 transition-all',
    'hover:-translate-y-0.5 hover:border-primary/30',
    'hover:bg-primary/[0.025]',
    'hover:shadow-md hover:shadow-primary/10',
  ].join(' '),

  highlightItemUnavailable: [
    'flex min-w-0 items-center gap-4 overflow-hidden',
    'rounded-[24px] border border-primary/15',
    'bg-card/90 px-5 py-5',
    'shadow-sm shadow-primary/5',
  ].join(' '),

  highlightIconBox: [
    'flex h-12 w-12 shrink-0 items-center justify-center',
    'rounded-2xl bg-primary/[0.07] text-primary',
  ].join(' '),

  highlightIcon: 'h-5 w-5',

  highlightContent: 'min-w-0 flex-1',

  highlightLabel: [
    'block truncate text-sm',
    'font-medium text-primary/75',
  ].join(' '),

  highlightValue: [
    'mt-1.5 block truncate',
    'text-[18px] font-medium text-foreground',
  ].join(' '),

  highlightDescription: [
    'mt-1 truncate text-sm',
    'text-muted-foreground',
  ].join(' '),

  highlightChevron: [
    'h-4 w-4 shrink-0 text-muted-foreground/60',
    'transition-all',
    'group-hover:translate-x-0.5',
    'group-hover:text-primary',
  ].join(' '),

  overviewPanel: 'grid min-w-0 grid-cols-4 gap-4',

  overviewItem: [
    'flex h-[88px] min-w-0 items-center gap-3 overflow-hidden',
    'rounded-[22px] border border-border/80 bg-card px-4',
    'shadow-sm shadow-black/[0.025]',
  ].join(' '),

  overviewIconBox: [
    'flex h-11 w-11 shrink-0 items-center justify-center',
    'rounded-2xl bg-primary/[0.07] text-primary',
  ].join(' '),

  overviewIcon: 'h-5 w-5',

  overviewContent: [
    'flex min-w-0 flex-1 items-center',
    'justify-between gap-2',
  ].join(' '),

  overviewLabel: [
    'min-w-0 truncate whitespace-nowrap',
    'text-sm font-medium text-muted-foreground',
  ].join(' '),

  overviewValue: [
    'flex shrink-0 items-baseline justify-end gap-1',
    '[&_strong]:text-[24px]',
    '[&_strong]:font-semibold',
    '[&_strong]:leading-none',
    '[&_strong]:tracking-tight',
    '[&_strong]:text-foreground',
    '[&_em]:text-xs',
    '[&_em]:font-normal',
    '[&_em]:not-italic',
    '[&_em]:leading-none',
    '[&_em]:text-muted-foreground',
  ].join(' '),

  listPanel: [
    'min-w-0 overflow-hidden rounded-[28px]',
    'border border-primary/15 bg-card/95',
    'shadow-sm shadow-primary/5',
  ].join(' '),

  toolbar: [
    'flex h-[72px] min-w-0 items-center',
    'justify-between gap-5 px-6',
    'bg-gradient-to-r',
    'from-primary/[0.035] via-card to-card',
  ].join(' '),

  searchBox: 'relative min-w-0 max-w-[480px] flex-1',

  searchIcon: [
    'pointer-events-none absolute left-4 top-1/2',
    'h-4 w-4 -translate-y-1/2',
    'text-muted-foreground',
  ].join(' '),

  searchInput: [
    'h-11 w-full rounded-full',
    'border-primary/10 bg-background',
    'pl-11 pr-4 text-sm',
  ].join(' '),

  filterGroup: [
    'flex shrink-0 items-center gap-1',
    'rounded-full bg-background p-1',
    'shadow-inner shadow-primary/5',
  ].join(' '),

  filterButton: (active: boolean) => [
    'flex h-9 shrink-0 items-center gap-2',
    'rounded-full px-4 text-xs',
    'font-medium transition-all',
    '[&_span]:rounded-full',
    '[&_span]:px-1.5',
    '[&_span]:py-0.5',
    '[&_span]:text-[10px]',
    active
      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 [&_span]:bg-white/20'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground [&_span]:bg-secondary',
  ].join(' '),

  listHeader: [
    'grid min-w-0',
    'grid-cols-[minmax(0,1fr)_118px_118px_176px_250px]',
    'items-center bg-secondary/30 px-6 py-3.5',
    'text-sm font-medium text-muted-foreground',
  ].join(' '),

  groupHeader: [
    'flex w-[76px] items-center justify-center',
    'text-center',
  ].join(' '),

  metricHeader: [
    'flex w-full items-center justify-center',
    'text-center',
  ].join(' '),

  scheduleHeaderCell: [
    'flex min-w-0 items-center justify-center',
    'overflow-hidden',
  ].join(' '),

  scheduleHeaderText: [
    'block w-[136px] shrink-0 -translate-x-3',
    'whitespace-nowrap text-center',
  ].join(' '),

  groupList: 'min-w-0 divide-y divide-primary/10',

  groupRow: [
    'grid min-h-[124px] min-w-0',
    'grid-cols-[minmax(0,1fr)_118px_118px_176px_250px]',
    'items-center px-6 py-5 transition-colors',
    'hover:bg-primary/[0.035]',
  ].join(' '),

  groupMain: [
    'flex min-w-0 items-center',
    'gap-5 pr-4',
  ].join(' '),

  groupProfileImage: [
    'h-[76px] w-[76px] shrink-0',
    'rounded-[22px] object-cover',
  ].join(' '),

  groupInitial: [
    'flex h-[76px] w-[76px] shrink-0',
    'items-center justify-center rounded-[22px]',
    'bg-primary/10',
    'text-xl font-semibold text-primary',
  ].join(' '),

  groupTextBox: 'min-w-0 flex-1',

  groupName: [
    'truncate text-[17px]',
    'font-medium leading-none text-foreground',
  ].join(' '),

  groupMetaBox: 'mt-4 min-w-0 space-y-1.5',

  groupRegion: [
    'flex min-w-0 items-center',
    'gap-1.5 truncate',
    'text-sm leading-none text-primary/70',
  ].join(' '),

  regionIcon: 'h-3.5 w-3.5 shrink-0',

  groupDescription: [
    'truncate text-sm leading-5',
    'text-muted-foreground',
  ].join(' '),

  memberCell: [
    'flex min-w-0 items-center justify-center',
    'gap-1.5 overflow-hidden',
    'text-sm font-normal leading-none',
    'text-muted-foreground',
    '[&_span]:truncate',
    '[&_span]:whitespace-nowrap',
  ].join(' '),

  recentCell: [
    'flex min-w-0 items-center justify-center',
    'gap-1.5 overflow-hidden',
    'text-sm text-muted-foreground',
    '[&_span]:truncate',
    '[&_span]:whitespace-nowrap',
  ].join(' '),

  scheduleCell: [
    'flex min-w-0 items-center justify-center',
    'overflow-hidden text-sm text-foreground',
  ].join(' '),

  scheduleContent: [
    'grid w-[136px] min-w-0 shrink-0',
    'grid-cols-[16px_minmax(0,1fr)]',
    'items-center gap-2 overflow-hidden',
    '[&_span]:truncate',
    '[&_span]:whitespace-nowrap',
  ].join(' '),

  emptyScheduleText: 'text-muted-foreground',

  cellIcon: 'h-4 w-4 shrink-0 text-primary/70',

  actionCell: [
    'flex min-w-0 items-center justify-end',
    'gap-3 overflow-hidden pr-4',
  ].join(' '),

  infoButton: [
    'h-9 min-w-0 shrink rounded-full',
    'border-primary/15 bg-card px-3 text-xs',
    'text-muted-foreground shadow-none',
    'transition-colors',
    'hover:border-primary/30',
    'hover:bg-primary/[0.04]',
    'hover:text-foreground',
    'focus-visible:border-primary/40',
    'focus-visible:ring-primary/15',
  ].join(' '),

  enterButton: [
    'h-9 shrink-0 rounded-full px-3 text-xs',
    'shadow-sm shadow-primary/10',
  ].join(' '),

  actionIcon: 'h-3.5 w-3.5 shrink-0',

  chevronIcon: 'h-3.5 w-3.5 shrink-0',

  emptyRow: [
    'flex h-32 flex-col items-center justify-center',
    'bg-primary/[0.02] text-center',
    '[&_p]:text-sm',
    '[&_p]:font-medium',
    '[&_p]:text-foreground',
    '[&_span]:mt-1',
    '[&_span]:text-xs',
    '[&_span]:text-muted-foreground',
  ].join(' '),

  paginationBar: [
    'flex items-center justify-center',
    'px-7 py-4',
  ].join(' '),

  paginationControls: 'flex items-center gap-1',

  paginationArrowButton: [
    'flex h-9 w-9 items-center justify-center',
    'rounded-lg text-muted-foreground',
    'transition-colors',
    'hover:bg-primary/[0.06]',
    'hover:text-primary',
    'disabled:cursor-not-allowed',
    'disabled:opacity-30',
    'disabled:hover:bg-transparent',
    'disabled:hover:text-muted-foreground',
  ].join(' '),

  pageNumberButton: (active: boolean) => [
    'h-9 min-w-9 rounded-lg px-3',
    'text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/15'
      : 'text-muted-foreground hover:bg-primary/[0.06] hover:text-primary',
  ].join(' '),

  paginationIcon: 'h-4 w-4',

  roleBadge: (role: 'OWNER' | 'MEMBER') => [
    'inline-flex h-8 max-w-full items-center gap-1.5',
    'rounded-full px-3 text-xs font-medium',
    role === 'OWNER'
      ? 'border-primary/20 bg-primary/10 text-primary'
      : 'border-border bg-background text-muted-foreground',
  ].join(' '),

  roleIcon: 'h-3 w-3 shrink-0',

  modalOverlay: [
    'fixed inset-0 z-50 flex',
    'items-center justify-center',
    'bg-black/35 px-6',
  ].join(' '),

  modalPanel: [
    'w-[590px] max-w-full rounded-[30px]',
    'border border-primary/15 bg-card p-7',
    'shadow-2xl shadow-black/20',
  ].join(' '),

  modalHeader: [
    'flex items-start',
    'justify-between gap-4',
  ].join(' '),

  modalTitleBox: [
    'flex min-w-0 items-center gap-4',
  ].join(' '),

  modalTitleContent: 'min-w-0',

  modalProfileImage: [
    'h-[68px] w-[68px] shrink-0',
    'rounded-[20px] object-cover',
  ].join(' '),

  modalInitial: [
    'flex h-[68px] w-[68px] shrink-0',
    'items-center justify-center',
    'rounded-[20px] bg-primary/10',
    'text-xl font-semibold text-primary',
  ].join(' '),

  modalTitle: [
    'truncate text-[22px]',
    'font-medium text-foreground',
  ].join(' '),

  modalRegion: [
    'mt-2 flex min-w-0 items-center gap-1.5',
    'truncate text-sm text-muted-foreground',
  ].join(' '),

  modalRegionIcon: 'h-4 w-4 shrink-0 text-primary/70',

  modalCloseButton: [
    'flex h-10 w-10 shrink-0',
    'items-center justify-center rounded-full',
    'bg-transparent text-muted-foreground',
    'transition-colors',
    'hover:bg-primary/[0.07]',
    'hover:text-primary',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-primary/20',
  ].join(' '),

  modalCloseIcon: 'h-5 w-5',

  modalSection: 'mt-6',

  modalSectionHeader: [
    'flex items-center justify-between gap-4',
  ].join(' '),

  modalSectionTitle: [
    'text-sm font-medium text-foreground',
  ].join(' '),

  modalAnalysisGrid: [
    'mt-3 grid grid-cols-3 gap-3',
  ].join(' '),

  modalAnalysisItem: [
    'flex min-w-0 items-center gap-3',
    'rounded-[18px] border border-primary/10',
    'bg-background px-4 py-3.5',
    '[&>div]:min-w-0',
    '[&>div>span]:block',
    '[&>div>span]:truncate',
    '[&>div>span]:text-xs',
    '[&>div>span]:text-muted-foreground',
    '[&>div>strong]:mt-1',
    '[&>div>strong]:block',
    '[&>div>strong]:truncate',
    '[&>div>strong]:text-base',
    '[&>div>strong]:font-semibold',
    '[&>div>strong]:text-foreground',
  ].join(' '),

  modalAnalysisIcon: [
    'h-5 w-5 shrink-0 text-primary',
  ].join(' '),

  modalDetailList: [
    'mt-3 divide-y divide-primary/10',
    'rounded-[20px] border border-primary/10',
    'bg-background px-5',
  ].join(' '),

  modalDetailRow: [
    'grid grid-cols-[150px_minmax(0,1fr)]',
    'items-center gap-5 py-3.5',
    '[&>span]:text-sm',
    '[&>span]:text-muted-foreground',
    '[&>strong]:truncate',
    '[&>strong]:text-sm',
    '[&>strong]:font-medium',
    '[&>strong]:text-foreground',
  ].join(' '),

  modalOperationBox: [
    'mt-6 flex items-start gap-3',
    'rounded-[20px]',
    'border border-border/80',
    'bg-background px-5 py-4',
  ].join(' '),

  modalOperationIcon: [
    'mt-0.5 h-4 w-4 shrink-0',
    'text-primary/75',
  ].join(' '),

  modalOperationContent: [
    'min-w-0 flex-1',
    '[&>p]:mt-2',
    '[&>p]:text-sm',
    '[&>p]:leading-6',
    '[&>p]:text-muted-foreground',
  ].join(' '),

  modalOperationHeader: [
    'flex items-center justify-between gap-4',
    '[&>span]:text-sm',
    '[&>span]:font-medium',
    '[&>span]:text-foreground',
    '[&>em]:truncate',
    '[&>em]:text-xs',
    '[&>em]:not-italic',
    '[&>em]:text-muted-foreground',
  ].join(' '),

  modalFooter: [
    'mt-6 flex justify-end gap-2',
  ].join(' '),

  modalSubButton: [
    'rounded-full border-primary/15 px-5',
    'hover:border-primary/30',
    'hover:bg-primary/[0.06]',
    'hover:text-primary',
  ].join(' '),

  modalMainButton: [
    'rounded-full px-5',
    'shadow-sm shadow-primary/20',
  ].join(' '),
} as const;
