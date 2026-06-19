import type { ReactNode } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Logo from './Logo';
import { Activity, Users, ListOrdered, Trophy, BarChart3, MonitorUp } from 'lucide-react';
import { operationStyles as s } from '../pages/SessionOperation.styles';
import { sessionPath } from '../utils/publicId';

const tabs = [
  ['dashboard', '운영 현황', Activity], ['participants', '참가자', Users], ['queue', '경기 후보', ListOrdered],
  ['current', '현재 경기', Trophy], ['report', '일정 리포트', BarChart3],
] as const;

export default function SessionOperationShell({ title, description, actions, children }: { title: string; description: string; actions?: ReactNode; children: ReactNode }) {
  const { sessionId = 'demo' } = useParams();
  return <div className={s.page}>
    <header className={s.header}><div className={s.headerInner}>
      <div className={s.logoSlot}><Logo size="sm" /></div>
      <nav className={s.nav}>{tabs.map(([path, label, Icon]) => <NavLink key={path} to={sessionPath(sessionId, `/${path}`)} className={({ isActive }) => s.navItem(isActive)}><Icon className={s.iconSm} />{label}</NavLink>)}</nav>
      <NavLink to={sessionPath(sessionId, '/display')} className={s.displayLink} target="_blank"><MonitorUp className={s.iconSm} />큰 화면</NavLink>
    </div></header>
    <main className={s.content}><div className={s.titleRow}><div><h1 className={s.title}>{title}</h1><p className={s.description}>{description}</p></div><div className={s.actions}>{actions}</div></div>{children}</main>
  </div>;
}
