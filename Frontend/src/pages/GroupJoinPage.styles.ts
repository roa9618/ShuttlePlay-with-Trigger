const panel = 'rounded-[28px] border border-primary/15 bg-card/95 shadow-xl shadow-primary/10';

export const styles = {
  page: 'relative h-dvh min-w-0 flex-1 overflow-hidden bg-background px-8 py-8',
  backgroundGlowTop: 'pointer-events-none fixed right-12 top-16 h-72 w-72 rounded-full bg-primary/5 blur-3xl',
  backgroundGlowBottom: 'pointer-events-none fixed bottom-10 left-72 h-64 w-64 rounded-full bg-primary/5 blur-3xl',
  shell: 'relative z-10 mx-auto flex h-full w-full max-w-[960px] items-center justify-center',
  card: `${panel} w-full max-w-[620px] overflow-hidden`,
  header: 'border-b border-primary/10 bg-gradient-to-r from-primary/[0.05] via-card to-card px-7 py-6',
  headerEyebrow: 'text-xs font-medium text-primary',
  title: 'mt-2 text-2xl font-medium tracking-tight text-foreground',
  description: 'mt-2 text-sm leading-6 text-muted-foreground',
  body: 'flex flex-col items-center px-7 py-8 text-center',
  imageWrap: 'flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary/[0.07] text-primary shadow-md shadow-primary/10',
  image: 'h-24 w-24 rounded-[28px] object-cover',
  icon: 'h-10 w-10',
  groupName: 'mt-5 text-xl font-medium text-foreground',
  statusText: 'mt-2 max-w-md text-sm leading-6 text-muted-foreground',
  actions: 'mt-7 flex flex-wrap justify-center gap-2',
  primaryButton: 'h-10 rounded-full px-5 shadow-md shadow-primary/15 hover:bg-primary/90 hover:text-primary-foreground',
  secondaryButton: 'h-10 rounded-full border-primary/15 px-5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
  disabledButton: 'h-10 rounded-full px-5 opacity-70',
  loadingDot: 'mt-6 h-2 w-2 animate-ping rounded-full bg-primary',
} as const;
