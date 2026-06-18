import type { ReactNode } from 'react';
import SessionFlowHeader from './SessionFlowHeader';

export type SessionFlowTone = 'brand' | 'info' | 'warning' | 'danger' | 'success';

const toneStyles: Record<SessionFlowTone, { card: string; icon: string; notice: string }> = {
  brand: {
    card: 'border-border',
    icon: 'bg-primary/10 text-primary',
    notice: 'bg-secondary/50 text-secondary-foreground',
  },
  info: {
    card: 'border-border',
    icon: 'bg-primary/10 text-primary',
    notice: 'bg-secondary/50 text-secondary-foreground',
  },
  warning: {
    card: 'border-destructive/20',
    icon: 'bg-destructive/10 text-destructive',
    notice: 'border border-destructive/15 bg-destructive/5 text-destructive',
  },
  danger: {
    card: 'border-destructive/20',
    icon: 'bg-destructive/10 text-destructive',
    notice: 'border border-destructive/15 bg-destructive/5 text-destructive',
  },
  success: {
    card: 'border-border',
    icon: 'bg-primary/10 text-primary',
    notice: 'bg-secondary/50 text-secondary-foreground',
  },
};

export function SessionFlowPage({ children, tone = 'brand', wide = false }: { children: ReactNode; tone?: SessionFlowTone; wide?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SessionFlowHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-3 md:px-6 md:py-7">
        <section className={`session-flow-card w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-3xl border-2 bg-card p-5 shadow-lg md:p-8 ${toneStyles[tone].card}`}>
          {children}
        </section>
      </main>
    </div>
  );
}

export function SessionFlowIcon({ children, tone = 'brand' }: { children: ReactNode; tone?: SessionFlowTone }) {
  return <div className={`mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[24px] ${toneStyles[tone].icon}`}>{children}</div>;
}

export function SessionFlowNotice({ children, tone = 'brand' }: { children: ReactNode; tone?: SessionFlowTone }) {
  return <div className={`rounded-2xl px-4 py-3.5 text-center text-sm font-medium leading-6 ${toneStyles[tone].notice}`}>{children}</div>;
}
