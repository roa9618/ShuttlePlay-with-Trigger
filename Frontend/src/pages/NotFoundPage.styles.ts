export const styles = {
  page: 'relative flex h-dvh items-center justify-center overflow-hidden bg-background px-4 py-4',
  decorativeShape: 'absolute inset-0 bg-background',
  decorativeShape2: 'absolute top-10 right-10 opacity-10',
  decorativeShape3: 'absolute bottom-10 left-10 opacity-10',
  decorativeShape4: 'absolute top-1/3 left-20 opacity-5',
  shuttlecockIcon: 'text-primary',
  sparklesIcon: 'h-16 w-16 text-primary',

  authPanel: 'relative z-10 flex max-h-full w-full max-w-md flex-col gap-3 md:gap-4',
  sectionHeader: 'space-y-4 pt-3 text-center',
  row: 'flex justify-center',
  titleGroup: 'space-y-2',
  pageTitle: 'text-2xl font-medium md:text-3xl',
  descriptionText: 'text-sm text-muted-foreground md:text-base',

  card: 'space-y-5 rounded-3xl border border-border bg-card/90 p-6 shadow-xl shadow-primary/10 backdrop-blur-sm',
  cardContent: 'space-y-3 text-center',
  errorCode: 'text-5xl font-semibold text-primary md:text-6xl',
  cardDescription: 'text-sm leading-6 text-muted-foreground',
  primaryButton: 'w-full cursor-pointer rounded-full shadow-lg shadow-primary/20',

  centeredBlock: 'pb-2 pt-1 text-center',
  mutedText: 'text-muted-foreground',
  primaryLink: 'font-medium text-primary hover:underline',
} as const;
