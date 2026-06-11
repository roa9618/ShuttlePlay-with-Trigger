export const styles = {
  page: 'relative flex min-h-0 flex-1 items-center overflow-hidden bg-background px-10 py-6',
  pageShell: 'relative z-10 mx-auto w-full max-w-[1740px]',
  backgroundGlowTop: 'pointer-events-none absolute right-20 top-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl',
  backgroundGlowBottom: 'pointer-events-none absolute bottom-10 left-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl',

  header: 'mb-8 flex items-end justify-between',
  title: 'text-[40px] font-medium leading-none tracking-tight text-foreground',
  createButton: 'h-11 rounded-full px-5 text-sm shadow-lg shadow-primary/20',
  buttonIcon: 'h-4 w-4',

  main: 'space-y-4',

  highlightPanel: 'grid grid-cols-3 gap-4 rounded-[28px] border border-primary/15 bg-card/90 p-4 shadow-sm shadow-primary/5',
  highlightItem: 'flex min-w-0 items-center gap-4 rounded-[22px] bg-primary/[0.04] px-5 py-4',
  highlightIconBox: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-sm shadow-primary/10',
  highlightIcon: 'h-5 w-5',
  highlightContent: 'min-w-0',
  highlightLabel: 'block text-sm font-medium text-primary/75',
  highlightValue: 'mt-1.5 block truncate text-[18px] font-medium text-foreground',
  highlightDescription: 'mt-1 truncate text-sm text-muted-foreground',

  overviewPanel: 'grid grid-cols-4 gap-4',
  overviewItem: [
    'flex h-[76px] items-center justify-between',
    'rounded-[20px] border border-primary/15 bg-card/90 px-6',
    'shadow-sm shadow-primary/5',
    'transition-colors hover:border-primary/25 hover:bg-primary/[0.025]',
    '[&>span]:text-sm [&>span]:font-medium [&>span]:text-muted-foreground',
    '[&>div]:flex [&>div]:h-9 [&>div]:items-baseline [&>div]:justify-end [&>div]:gap-1.5',
    '[&_strong]:inline-block [&_strong]:text-[27px] [&_strong]:font-semibold',
    '[&_strong]:leading-none [&_strong]:tracking-tight [&_strong]:text-foreground',
    '[&_em]:inline-block [&_em]:text-sm [&_em]:font-normal',
    '[&_em]:not-italic [&_em]:leading-none [&_em]:text-muted-foreground',
  ].join(' '),

  listPanel: 'overflow-hidden rounded-[28px] border border-primary/15 bg-card/95 shadow-sm shadow-primary/5',
  toolbar: 'flex h-[70px] items-center justify-between gap-5 bg-gradient-to-r from-primary/[0.035] via-card to-card px-7',
  searchBox: 'relative w-[520px]',
  searchIcon: 'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
  searchInput: 'h-11 rounded-full border-primary/10 bg-background pl-11 pr-4 text-sm',

  filterGroup: 'flex items-center gap-1.5 rounded-full bg-background p-1 shadow-inner shadow-primary/5',
  filterButton: (active: boolean) => [
    'flex h-9 items-center gap-2 rounded-full px-4 text-xs font-medium transition-all',
    '[&_span]:rounded-full [&_span]:px-1.5 [&_span]:py-0.5 [&_span]:text-[10px]',
    active
      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 [&_span]:bg-white/20'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground [&_span]:bg-secondary',
  ].join(' '),

  listHeader: [
    'grid grid-cols-[minmax(620px,1.9fr)_130px_150px_140px_250px]',
    'items-center bg-secondary/30 px-7 py-3',
    'text-sm font-medium text-muted-foreground',
  ].join(' '),

  groupList: 'divide-y divide-primary/10',

  groupRow: [
    'grid min-h-[106px]',
    'grid-cols-[minmax(620px,1.9fr)_130px_150px_140px_250px]',
    'items-center px-7 py-4 transition-colors',
    'hover:bg-primary/[0.035]',
  ].join(' '),

  groupMain: 'flex min-w-0 items-center gap-5 pr-8',
  groupProfileImage: 'h-14 w-14 shrink-0 rounded-2xl object-cover',
  groupInitial: 'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary',

  groupTextBox: 'min-w-0 flex-1',
  groupName: 'truncate text-base font-medium text-foreground',
  groupMetaBox: 'mt-3 space-y-1',
  groupRegion: 'flex items-center gap-1.5 truncate text-sm text-primary/70',
  regionIcon: 'h-3.5 w-3.5 shrink-0',
  groupDescription: 'truncate text-sm text-muted-foreground',

  roleCell: 'flex items-center',
  roleBadge: (role: 'OWNER' | 'MEMBER') => [
    'inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium',
    role === 'OWNER'
      ? 'border-primary/20 bg-primary/10 text-primary'
      : 'border-border bg-background text-muted-foreground',
  ].join(' '),
  roleIcon: 'h-3 w-3',

  memberCell: 'flex items-center gap-1.5 text-sm text-foreground [&_strong]:text-base [&_strong]:font-medium [&_span]:text-sm [&_span]:text-muted-foreground',
  recentCell: 'flex items-center gap-2 text-sm text-muted-foreground',
  cellIcon: 'h-4 w-4 shrink-0 text-primary/70',

  actionCell: 'flex items-center justify-end gap-2.5',

  infoButton: [
    'h-9 rounded-full border-primary/15 bg-card px-4 text-xs',
    'text-muted-foreground shadow-none transition-colors',
    'hover:border-primary/35 hover:bg-primary/[0.06] hover:text-primary',
    'focus-visible:border-primary/40 focus-visible:ring-primary/15',
  ].join(' '),

  enterButton: 'h-9 rounded-full px-4 text-xs shadow-sm shadow-primary/10',
  actionIcon: 'h-3.5 w-3.5',
  chevronIcon: 'h-3.5 w-3.5',

  emptyRow: 'flex h-28 flex-col items-center justify-center bg-primary/[0.02] text-center [&_p]:text-sm [&_p]:font-medium [&_p]:text-foreground [&_span]:mt-1 [&_span]:text-xs [&_span]:text-muted-foreground',

  paginationBar: 'flex items-center justify-center px-7 py-4',
  paginationControls: 'flex items-center gap-1',

  paginationArrowButton: [
    'flex h-9 w-9 items-center justify-center rounded-lg',
    'text-muted-foreground transition-colors',
    'hover:bg-primary/[0.06] hover:text-primary',
    'disabled:cursor-not-allowed disabled:opacity-30',
    'disabled:hover:bg-transparent disabled:hover:text-muted-foreground',
  ].join(' '),

  pageNumberButton: (active: boolean) => [
    'h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/15'
      : 'text-muted-foreground hover:bg-primary/[0.06] hover:text-primary',
  ].join(' '),

  paginationIcon: 'h-4 w-4',

  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6',
  modalPanel: 'w-[540px] rounded-[30px] border border-primary/15 bg-card p-7 shadow-2xl shadow-black/20',
  modalHeader: 'flex items-start justify-between gap-4',
  modalTitleBox: 'flex min-w-0 items-center gap-4',
  modalProfileImage: 'h-16 w-16 shrink-0 rounded-2xl object-cover',
  modalInitial: 'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary',
  modalTitle: 'mb-2 truncate text-2xl font-medium text-foreground',
  modalCloseButton: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
  modalCloseIcon: 'h-5 w-5',

  modalInfoGrid: 'mt-7 grid grid-cols-2 gap-3',
  modalInfoItem: 'rounded-2xl bg-secondary/50 px-4 py-3.5 [&_span]:block [&_span]:text-xs [&_span]:text-muted-foreground [&_strong]:mt-1.5 [&_strong]:block [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-foreground',

  modalRegionBox: 'mt-4 rounded-2xl border border-primary/10 bg-background px-4 py-3.5 [&_span]:block [&_span]:text-xs [&_span]:font-medium [&_span]:text-primary [&_p]:mt-2 [&_p]:flex [&_p]:items-center [&_p]:gap-1.5 [&_p]:text-sm [&_p]:text-foreground',
  modalRegionIcon: 'h-4 w-4 text-primary',

  modalDescriptionBox: 'mt-3 rounded-2xl border border-primary/10 bg-background px-4 py-3.5 [&_span]:block [&_span]:text-xs [&_span]:font-medium [&_span]:text-primary [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted-foreground',

  modalFooter: 'mt-6 flex justify-end gap-2',
  modalSubButton: 'rounded-full px-5',
  modalMainButton: 'rounded-full px-5 shadow-sm shadow-primary/20',
} as const;