export const styles = {
  page: [
    'relative flex h-screen min-h-0 min-w-0 flex-1',
    'items-center overflow-hidden bg-background px-8 py-5',
    '[@media(max-height:900px)]:py-3',
  ].join(' '),

  backgroundGlowTop: [
    'pointer-events-none fixed right-20 top-16',
    'h-72 w-72 rounded-full bg-primary/5 blur-3xl',
  ].join(' '),

  backgroundGlowBottom: [
    'pointer-events-none fixed bottom-10 left-20',
    'h-60 w-60 rounded-full bg-primary/5 blur-3xl',
  ].join(' '),

  pageShell: [
    'relative z-10 mx-auto w-full max-w-[980px]',
    'py-2 [@media(max-height:900px)]:py-0',
    'origin-center [@media(max-height:800px)]:scale-90',
  ].join(' '),

  header: [
    'mb-7 text-center',
    '[@media(max-height:1000px)]:mb-5',
    '[@media(max-height:900px)]:mb-4',
  ].join(' '),

  backLink: [
    'fixed left-[calc(16rem+2rem)] top-8 z-20 inline-flex items-center gap-2',
    'text-sm text-muted-foreground transition-colors',
    'hover:text-primary',
  ].join(' '),

  backIcon: 'h-4 w-4',

  title: [
    'text-[36px] font-medium leading-none',
    'tracking-tight text-foreground',
    '[@media(max-height:900px)]:text-[32px]',
  ].join(' '),

  subtitle: [
    'mt-2 text-sm text-muted-foreground',
    '[@media(max-height:900px)]:mt-1.5',
  ].join(' '),

  form: [
    'space-y-6 rounded-[30px] border border-primary/15',
    'bg-card/95 p-7 shadow-xl shadow-primary/10',
    'backdrop-blur-sm',
    '[@media(max-height:1000px)]:space-y-5',
    '[@media(max-height:1000px)]:p-6',
    '[@media(max-height:900px)]:space-y-4',
    '[@media(max-height:900px)]:p-5',
  ].join(' '),

  fieldSection: [
    'space-y-2.5',
    '[@media(max-height:900px)]:space-y-1.5',
  ].join(' '),

  labelRow: [
    'flex min-h-6 items-start justify-between gap-5',
  ].join(' '),

  label: [
    'flex items-center gap-2 text-[15px] font-medium',
    '[&_em]:rounded-full [&_em]:bg-primary/10',
    '[&_em]:px-2 [&_em]:py-0.5',
    '[&_em]:text-[10px] [&_em]:font-medium',
    '[&_em]:not-italic [&_em]:text-primary',
    '[&_span]:text-xs [&_span]:font-normal',
    '[&_span]:text-muted-foreground',
  ].join(' '),

  fieldGuide: [
    'mt-1 text-xs leading-4 text-muted-foreground',
    '[@media(max-height:900px)]:mt-0.5',
  ].join(' '),

  fieldMessage: [
    'shrink-0 text-right text-xs font-medium',
    'text-destructive',
  ].join(' '),

  hiddenInput: 'hidden',

  imageUploadBox: [
    'flex min-h-[170px] flex-col items-center justify-center gap-3',
    'rounded-[24px] border border-dashed border-primary/25',
    'bg-primary/[0.02] px-6 py-4 text-center transition-colors',
    '[@media(max-height:1000px)]:min-h-[145px]',
    '[@media(max-height:900px)]:min-h-[118px]',
    '[@media(max-height:900px)]:gap-2',
    '[@media(max-height:900px)]:py-2.5',
  ].join(' '),

  imageUploadBoxDragging: [
    'border-primary bg-primary/10',
    'ring-2 ring-primary/15',
  ].join(' '),

  imagePreview: [
    'h-28 w-28 rounded-[24px] object-cover',
    'shadow-md shadow-primary/10',
    '[@media(max-height:900px)]:h-20',
    '[@media(max-height:900px)]:w-20',
    '[@media(max-height:900px)]:rounded-[18px]',
  ].join(' '),

  imagePlaceholder: [
    'flex flex-col items-center',
    '[&>strong]:mt-2 [&>strong]:text-sm',
    '[&>strong]:font-medium',
    '[&>span]:mt-0.5 [&>span]:text-xs',
    '[&>span]:text-muted-foreground',
  ].join(' '),

  imagePlaceholderIcon: [
    'h-8 w-8 text-primary/60',
    '[@media(max-height:900px)]:h-6',
    '[@media(max-height:900px)]:w-6',
  ].join(' '),

  imageActions: 'flex items-center justify-center gap-3',

  imageButton: [
    'h-10 rounded-full border-primary/20 px-5',
    'text-primary hover:bg-primary/10 hover:text-primary',
  ].join(' '),

  removeImageButton: [
    'h-10 rounded-full px-5 text-muted-foreground',
    'hover:border-destructive/30 hover:bg-destructive/5',
    'hover:text-destructive',
  ].join(' '),

  buttonIcon: 'h-4 w-4',

  input: [
    'h-12 rounded-xl border-primary/10',
    'bg-input-background px-4 text-sm',
    '[&:not(:placeholder-shown)]:bg-input-background',
    '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]',
    '[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_var(--input-background)_inset]',
    '[&:-webkit-autofill:focus]:[box-shadow:0_0_0_1000px_var(--input-background)_inset]',
  ].join(' '),

  textarea: [
    'min-h-[84px] resize-none rounded-xl',
    'border-primary/10 bg-input-background',
    'px-4 py-2.5 text-sm leading-5',
    '[@media(max-height:900px)]:min-h-[64px]',
    '[@media(max-height:900px)]:py-2',
  ].join(' '),

  fieldFooter: [
    'flex items-center justify-between gap-5',
    'text-xs text-muted-foreground',
    '[&_em]:shrink-0 [&_em]:font-normal',
    '[&_em]:not-italic [&_em]:tabular-nums',
  ].join(' '),

  regionStack: [
    'space-y-2.5',
    '[@media(max-height:900px)]:space-y-1.5',
  ].join(' '),

  selectWrapper: 'relative min-w-0',

  selectIcon: [
    'pointer-events-none absolute left-4 top-1/2 z-10',
    'h-4 w-4 -translate-y-1/2 text-primary/65',
  ].join(' '),

  selectTrigger: [
    'h-12 rounded-xl border-primary/10',
    'bg-input-background pl-11 pr-4 text-sm',
  ].join(' '),

  selectContent: [
    'max-h-72 rounded-xl border-primary/15',
    'bg-card shadow-xl shadow-primary/10',
  ].join(' '),

  selectItem: [
    'cursor-pointer rounded-lg',
    'focus:bg-primary/10 focus:text-primary',
    'data-[highlighted]:bg-primary/10',
    'data-[highlighted]:text-primary',
  ].join(' '),

  actions: [
    'grid grid-cols-2 gap-3 border-t',
    'border-primary/10 pt-5',
    '[@media(max-height:900px)]:pt-3',
  ].join(' '),

  cancelButton: [
    'h-12 rounded-full border-primary/20',
    'hover:bg-primary/10 hover:text-primary',
  ].join(' '),

  submitButton: [
    'h-12 rounded-full',
    'shadow-lg shadow-primary/20',
  ].join(' '),
} as const;
