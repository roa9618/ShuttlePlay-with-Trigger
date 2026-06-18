import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ClipboardCheck, LogIn, LogOut, Settings, UserPlus, Users } from 'lucide-react';
import Logo from './Logo';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { getAuthAccessToken, getAuthSession } from '../utils/authSession';
import { styles } from '../pages/HomePage.styles';

export default function SessionFlowHeader() {
  const navigate = useNavigate(); const { session, logout } = useAuth(); const displaySession = session ?? (getAuthAccessToken() ? getAuthSession() : null);
  const [open, setOpen] = useState(false); const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const move = (path: string) => { setOpen(false); navigate(path); };
  return <header className={styles.header}><div className={styles.headerInner}><Logo size="md"/>{displaySession ? <div ref={menuRef} className={styles.profileMenuWrapper}><button type="button" className={styles.profileButton} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-haspopup="menu"><span className={styles.profileName}>{displaySession.name}</span><ChevronDown className={styles.chevronDownIcon(open)}/></button>{open && <div className={styles.profileDropdown} role="menu"><div className={styles.profileSummary}><div className={styles.profileSummaryAvatar}>{displaySession.name.slice(0, 1)}</div><div className={styles.profileSummaryText}><strong className={styles.profileSummaryName}>{displaySession.name}</strong><span className={styles.profileSummaryEmail}>{displaySession.email}</span></div></div><div className={styles.menuDivider}/><button className={styles.profileMenuItem} onClick={() => move('/groups')} role="menuitem"><Users className={styles.profileMenuIcon}/>내 모임</button><button className={styles.profileMenuItem} onClick={() => move('/my-record')} role="menuitem"><ClipboardCheck className={styles.profileMenuIcon}/>내 기록</button><button className={styles.profileMenuItem} onClick={() => move('/settings')} role="menuitem"><Settings className={styles.profileMenuIcon}/>설정</button><div className={styles.menuDivider}/><button className={styles.logoutMenuItem} onClick={() => { logout(); move('/'); }} role="menuitem"><LogOut className={styles.profileMenuIcon}/>로그아웃</button></div>}</div> : <div className={styles.row}><Link to="/login"><Button variant="ghost" className={styles.loginButton}><LogIn className={styles.logInIcon}/>로그인</Button></Link><Link to="/signup"><Button className={styles.signupButton}><UserPlus className={styles.logInIcon}/>가입</Button></Link></div>}</div></header>;
}
