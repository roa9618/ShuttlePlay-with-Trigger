export const styles = {
  header: 'desktop-sidebar w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0',
  contentBox: 'p-6 border-b border-border',
  row: 'flex-1 p-4 space-y-1',
  iconIcon: 'w-5 h-5',
  labelText: 'font-medium',
  footerActions: 'p-4 border-t border-border',
  fullWidthButton: 'w-full justify-start gap-2 text-muted-foreground hover:text-destructive rounded-xl',
  logOutIcon: 'w-4 h-4',
  navLink: (active: boolean) => [
    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
    active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  ].join(' '),
} as const;
