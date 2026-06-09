export const styles = {
  page: 'relative flex h-dvh items-center justify-center overflow-hidden bg-background px-4 py-4',
  decorativeShape: 'absolute inset-0 bg-background',
  decorativeShape2: 'pointer-events-none absolute top-10 right-10 hidden opacity-10 md:block',
  decorativeShape3: 'pointer-events-none absolute bottom-10 left-10 hidden opacity-10 md:block',
  decorativeShape4: 'pointer-events-none absolute top-1/3 left-20 hidden opacity-5 md:block',
  shuttlecockIcon: 'text-primary',
  sparklesIcon: 'h-16 w-16 text-primary',

  stack: 'relative z-10 flex w-full max-w-md flex-col gap-3',
  stack2: 'space-y-3 text-center',
  row: 'flex justify-center',
  stack3: 'space-y-1.5',
  titleGroup: 'space-y-2',

  pageTitle: 'text-2xl font-medium md:text-3xl',
  descriptionText: 'text-sm text-muted-foreground md:text-base',

  stepIndicator: 'mx-auto flex w-28 items-center justify-center gap-2',
  stepActive: 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20',
  stepDone: 'flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary',
  stepInactive: 'flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground',
  stepLine: 'h-px flex-1 bg-border',

  header: 'rounded-3xl border border-border bg-card/90 p-5 shadow-xl shadow-primary/10 backdrop-blur-sm',
  form: 'space-y-3',

  input: 'h-10 rounded-xl bg-input-background [&:not(:placeholder-shown)]:bg-input-background [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_var(--input-background)_inset] [&:-webkit-autofill:focus]:[box-shadow:0_0_0_1000px_var(--input-background)_inset]',
  labelRow: 'flex min-h-5 items-center justify-between gap-3',
  fieldMessage: (tone: 'error' | 'success') => [
    'min-w-0 text-right text-xs font-medium',
    tone === 'success' ? 'text-primary' : 'text-destructive',
  ].join(' '),
  verificationStatus: 'flex min-w-0 items-center justify-end gap-2',
  verificationTimer: 'shrink-0 text-xs font-semibold tabular-nums text-destructive',

  actionRow: 'grid grid-cols-[1fr_auto] gap-2',
  verificationRow: 'grid grid-cols-[1fr_auto_auto] gap-2',
  inlineButton: 'h-10 shrink-0 cursor-pointer rounded-xl border-primary/30 px-3 text-xs text-primary hover:bg-primary/10 hover:text-primary',

  selectContent: 'border-primary/20 bg-card text-foreground shadow-xl shadow-primary/10',
  selectItem: 'cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary',

  ruleList: 'flex flex-wrap gap-1.5',
  ruleDefault: 'rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground',
  ruleValid: 'rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary',

  buttonRow: 'grid grid-cols-[0.8fr_1.2fr] gap-2 pt-2',
  backButton: 'h-10 w-full cursor-pointer rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary',
  submitButton: 'h-10 w-full cursor-pointer rounded-full shadow-lg shadow-primary/20',
  completionContent: 'space-y-5 py-2 text-center',
  completionText: 'text-sm leading-6 text-muted-foreground',
  completionButton: 'w-full cursor-pointer rounded-full shadow-lg shadow-primary/20',

  centeredBlock: 'pb-2 pt-1 text-center',
  mutedText: 'text-muted-foreground',
  primaryLink: 'font-medium text-primary hover:underline',
} as const;
