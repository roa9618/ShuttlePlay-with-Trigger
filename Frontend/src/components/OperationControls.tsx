import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type OperationSelectOption = { value: string; label: string; disabled?: boolean };

export function OperationSelect({ value, options, onValueChange, placeholder, className = '', disabled = false, ariaLabel }: {
  value?: string;
  options: OperationSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger aria-label={ariaLabel} className={`h-12 rounded-xl border-border bg-background px-3 text-base font-bold hover:border-primary/60 focus:ring-primary/20 ${className}`}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="rounded-xl border-border">
      {options.map(option => <SelectItem key={option.value} value={option.value} disabled={option.disabled} className="min-h-10 rounded-lg text-sm font-semibold focus:bg-primary/10 focus:text-foreground">{option.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}

export function OperationToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) { setVisible(false); return; }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3_000);
    return () => window.clearTimeout(timer);
  }, [message]);
  if (!message || !visible) return null;
  return <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border border-primary/20 bg-card px-5 py-4 font-bold text-foreground shadow-xl">
    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
    <span>{message}</span>
  </div>;
}
