import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Megaphone, Pin, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { noticeApi, type NoticeItem, type NoticePage } from '../utils/noticeApi';
import { connectNoticeSocket } from '../utils/noticeSocket';
import { styles } from './NoticePage.styles';

const emptyPage: NoticePage = { items: [], page: 0, size: 10, totalElements: 0, totalPages: 1 };
const date = (value: string) => new Date(value).toLocaleDateString('ko-KR');

export default function NoticePage() {
  const { session } = useAuth();
  const admin = session?.role === 'ADMIN';
  const [data, setData] = useState(emptyPage);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState<NoticeItem | null>(null);
  const [editing, setEditing] = useState<NoticeItem | 'new' | null>(null);
  const [form, setForm] = useState({ title: '', content: '', pinned: false });

  const load = useCallback(() => noticeApi.list(keyword, page).then(setData), [keyword, page]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => connectNoticeSocket(() => void load()), [load]);

  const open = async (id: number) => setDetail(await noticeApi.detail(id));
  const startWrite = (item?: NoticeItem) => {
    setForm(item ? { title: item.title, content: item.content ?? '', pinned: item.pinned } : { title: '', content: '', pinned: false });
    setEditing(item ?? 'new');
    setDetail(null);
  };
  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editing === 'new') await noticeApi.create(form); else if (editing) await noticeApi.update(editing.id, form);
    setEditing(null); await load();
  };
  const remove = async (id: number) => { if (!window.confirm('이 공지사항을 삭제할까요?')) return; await noticeApi.delete(id); setDetail(null); await load(); };

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.header}><div><h1 className={styles.title}>공지사항</h1></div>
      {admin && <Button className={styles.writeButton} onClick={() => startWrite()}><Plus /> 글쓰기</Button>}
    </header>
    <div className={styles.toolbar}><label className={styles.search}><Search /><Input className={styles.input} value={keyword} placeholder="공지 제목 검색" onChange={e => { setKeyword(e.target.value); setPage(0); }} /></label><span className={styles.count}>총 {data.totalElements}개의 공지</span></div>
    <section className={styles.board}><div className={styles.boardHeader}><span>번호</span><span>제목</span><span>작성자</span><span>작성일</span><span>조회</span></div>
      {data.items.length ? data.items.map((item, index) => <button key={item.id} className={styles.row} onClick={() => void open(item.id)}><span className={styles.number}>{item.pinned ? '공지' : data.totalElements - (data.page * data.size + index)}</span><span className={styles.rowTitle}>{item.pinned && <b className={styles.pin}><Pin /> 중요</b>}<span>{item.title}</span></span><span className={styles.meta}>{item.authorName}</span><span className={styles.meta}>{date(item.createdAt)}</span><span className={styles.meta}><Eye className="mr-1 inline h-3.5 w-3.5" />{item.viewCount}</span></button>) : <div className={styles.empty}><Megaphone /><span>등록된 공지사항이 없습니다.</span></div>}
    </section>
    <nav className={styles.pagination} aria-label="공지사항 페이지"><button className={styles.pageButton()} disabled={page === 0} onClick={() => setPage(v => v - 1)}><ChevronLeft /></button>{Array.from({ length: Math.max(1, data.totalPages) }, (_, i) => <button key={i} className={styles.pageButton(i === page)} onClick={() => setPage(i)}>{i + 1}</button>)}<button className={styles.pageButton()} disabled={page >= data.totalPages - 1} onClick={() => setPage(v => v + 1)}><ChevronRight /></button></nav>
  </div>
  {detail && <div className={styles.overlay} onMouseDown={() => setDetail(null)}><article className={styles.modal} onMouseDown={e => e.stopPropagation()}><header className={styles.modalHeader}><h2>{detail.title}</h2><Button variant="ghost" size="icon" onClick={() => setDetail(null)} aria-label="닫기"><X /></Button></header><div className={styles.modalBody}><div className={styles.detailMeta}><span>{detail.authorName}</span><span>{date(detail.createdAt)}</span><span><Eye className="mr-1 inline h-3.5 w-3.5" />{detail.viewCount}</span></div><div className={styles.detailContent}>{detail.content}</div>{admin && <div className={styles.modalActions}><Button variant="destructive" onClick={() => void remove(detail.id)}>삭제</Button><Button onClick={() => startWrite(detail)}>수정</Button></div>}</div></article></div>}
  {editing && <div className={styles.overlay} onMouseDown={() => setEditing(null)}><section className={styles.modal} onMouseDown={e => e.stopPropagation()}><header className={styles.modalHeader}><h2>{editing === 'new' ? '공지사항 작성' : '공지사항 수정'}</h2><Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="닫기"><X /></Button></header><div className={styles.modalBody}><div className={styles.form}><label><span>제목</span><Input className={styles.titleInput} maxLength={200} value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} /></label><label><span>내용</span><textarea className={styles.textarea} maxLength={10000} value={form.content} onChange={e => setForm(v => ({ ...v, content: e.target.value }))} /></label><label className={styles.pinOption}><span>중요 공지로 상단에 고정</span><Switch checked={form.pinned} onCheckedChange={pinned => setForm(v => ({ ...v, pinned }))} /></label></div><div className={styles.modalActions}><Button variant="outline" className={styles.cancelButton} onClick={() => setEditing(null)}>취소</Button><Button onClick={() => void save()}>저장</Button></div></div></section></div>}
  </main>;
}
