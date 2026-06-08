export const styles = {
  page: 'min-h-screen bg-background',
  header: 'border-b border-border bg-card',
  headerInner: 'max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between',
  row: 'flex gap-2',
  roundButton: 'rounded-full',
  logInIcon: 'w-4 h-4 mr-2',
  content: 'max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12',
  sectionHeader: 'mb-8 md:mb-10',
  badge: 'mb-4',
  pageTitle: 'text-4xl md:text-5xl font-medium mb-3',
  descriptionText: 'text-muted-foreground text-lg',
  cardGrid: 'grid md:grid-cols-2 gap-4 md:gap-6 mb-8',
  cardLink: 'block',
  betweenRow: 'flex items-start justify-between gap-4',
  row2: 'w-16 h-16 rounded-2xl bg-card flex items-center justify-center',
  iconIcon: 'w-8 h-8 text-primary',
  betweenRow2: 'mt-8 flex items-end justify-between gap-4',
  sectionTitle: 'text-3xl font-medium mb-2',
  descriptionText2: 'text-muted-foreground',
  chevronRightIcon: 'w-7 h-7 text-muted-foreground flex-shrink-0',
  header2: 'bg-card border border-border rounded-3xl p-5 md:p-6',
  sectionTitle2: 'text-xl font-medium mb-4',
  cardGrid2: 'grid grid-cols-2 md:grid-cols-4 gap-3',
  summaryBox: 'h-full rounded-2xl border border-border bg-secondary/30 p-4 hover:border-primary transition-colors',
  iconIcon2: 'w-5 h-5 text-primary mb-3',
  summaryText: 'font-medium',
  actionCard: (tone: string) => [
    'min-h-48 rounded-3xl border-2 p-6 md:p-8 transition-all hover:shadow-xl',
    tone === 'accent'
      ? 'bg-accent/15 border-accent/50 hover:border-accent'
      : 'bg-primary/10 border-primary/40 hover:border-primary',
  ].join(' '),
  actionBadge: (tone: string) => (
    tone === 'accent'
      ? 'bg-accent text-accent-foreground'
      : 'bg-primary text-primary-foreground'
  ),
} as const;
