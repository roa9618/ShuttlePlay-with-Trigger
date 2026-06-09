export const styles = {
  page: 'flex min-h-0 flex-1 flex-col bg-background',
  header: 'border-b border-border bg-card',
  headerInner: 'w-full px-4 py-2 md:px-8 md:py-4 flex items-center justify-between',
  row: 'flex gap-2',
  loginButton: 'cursor-pointer rounded-full px-4 text-muted-foreground hover:bg-primary/10 hover:text-primary md:px-5',
  signupButton: 'cursor-pointer rounded-full bg-indigo-600 px-4 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/25 md:px-5',
  logInIcon: 'w-4 h-4 mr-2',
  mainArea: 'relative flex min-h-0 flex-1 items-center overflow-hidden',
  decorations: 'pointer-events-none absolute inset-0 text-primary',
  shuttlecockTop: 'absolute top-8 right-[10%] opacity-[0.13] rotate-12',
  shuttlecockLeft: 'absolute top-36 -left-3 opacity-[0.14] -rotate-12 hidden sm:block',
  shuttlecockRight: 'absolute bottom-16 right-6 opacity-[0.12] rotate-[22deg]',
  shuttlecockBottom: 'absolute bottom-10 left-[12%] opacity-[0.1] rotate-[38deg] hidden sm:block',
  calendarDecoration: 'absolute top-28 left-[8%] w-14 h-14 opacity-[0.1] hidden md:block',
  usersDecoration: 'absolute bottom-32 left-[22%] w-16 h-16 opacity-[0.1] hidden md:block',
  clipboardDecoration: 'absolute bottom-[26%] right-[34%] w-11 h-11 opacity-[0.08] hidden lg:block',
  content: 'relative w-full max-w-5xl mx-auto px-4 py-3 md:px-8 md:py-8',
  sectionHeader: 'mb-3 md:mb-8',
  pageTitle: 'text-2xl md:text-5xl font-medium mb-1 md:mb-3',
  descriptionText: 'text-sm text-muted-foreground md:text-lg',
  cardGrid: 'grid grid-cols-2 gap-2 mb-3 md:gap-6 md:mb-6',
  cardLink: 'block',
  cardButton: 'block w-full cursor-pointer text-left',
  betweenRow: 'flex items-start justify-between gap-4',
  row2: 'w-9 h-9 rounded-xl bg-card flex items-center justify-center md:w-16 md:h-16 md:rounded-2xl',
  betweenRow2: 'mt-4 flex items-end justify-between gap-2 md:mt-8 md:gap-4',
  sectionTitle: 'text-lg font-medium mb-1 md:text-3xl md:mb-2',
  descriptionText2: 'text-xs leading-5 text-muted-foreground md:text-base',
  chevronRightIcon: 'w-5 h-5 text-muted-foreground flex-shrink-0 md:w-7 md:h-7',
  header2: 'bg-card border border-border rounded-2xl p-3 md:rounded-3xl md:p-5',
  sectionTitle2: 'text-sm font-medium mb-2 md:text-xl md:mb-4',
  cardGrid2: 'grid grid-cols-5 gap-1.5 md:gap-3',
  quickLinkButton: 'h-full cursor-pointer text-left',
  summaryBox: 'h-full rounded-xl border border-border bg-secondary/30 p-2 hover:border-primary transition-colors md:rounded-2xl md:p-4',
  installButton: 'h-full cursor-pointer rounded-xl border border-border bg-secondary/30 p-2 text-left hover:border-primary transition-colors md:rounded-2xl md:p-4',
  iconIcon2: 'w-4 h-4 text-primary mb-1 md:w-5 md:h-5 md:mb-3',
  summaryText: 'text-xs font-medium md:text-base',
  toast: 'fixed left-1/2 bottom-6 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl bg-foreground px-5 py-3 text-center text-sm font-medium text-background shadow-lg',
  actionCard: (tone: string) => [
    'h-full min-h-32 rounded-2xl border-2 p-3 transition-all hover:shadow-xl md:min-h-48 md:rounded-3xl md:p-8',
    tone === 'accent'
      ? 'bg-accent/70 border-indigo-300 hover:border-indigo-500'
      : 'bg-primary/10 border-primary/40 hover:border-primary',
  ].join(' '),
  actionBadge: (tone: string) => (
    tone === 'accent'
      ? 'bg-indigo-500 text-white'
      : 'bg-primary text-primary-foreground'
  ),
  iconIcon: (tone: string) => (
    tone === 'accent'
      ? 'w-5 h-5 text-indigo-600 md:w-8 md:h-8'
      : 'w-5 h-5 text-primary md:w-8 md:h-8'
  ),
} as const;
