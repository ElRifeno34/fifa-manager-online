import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Mail, X, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/om/button'
import { useClubTheme } from '@/components/om/club-theme-provider'
import { useToast } from '@/components/om/toast-provider'
import { getClubMessages, type Message } from '@/data/mock'

export function InboxPanel() {
  const { club } = useClubTheme()
  const toast = useToast()
  const [read, setRead] = useState<string[]>([])
  const [selected, setSelected] = useState<Message | null>(null)
  const messages = getClubMessages(club)
  const unread = messages.filter(m => m.unread && !read.includes(m.id)).length
  return <section className="sheet inbox-section flex min-h-0 flex-1 flex-col">
    <h2 className="section-header"><Button className="flex w-full items-center gap-2 text-left" onClick={() => setSelected(messages[0] ?? null)}><span className="font-mono text-ink-3">01</span><span className="caps flex-1 text-ink">Boîte de réception</span><span className="font-mono text-club-ink">{unread}</span><ArrowUpRight className="size-4" strokeWidth={1.5} /></Button></h2>
    <ul className="inbox-preview min-h-0 flex-1 overflow-hidden">{messages.slice(0, 4).map(message => <li key={message.id}><Button className="inbox-message w-full text-left hover:bg-raised" onClick={() => { setSelected(message); setRead(ids => ids.includes(message.id) ? ids : [...ids, message.id]) }}><span className="flex items-center gap-2"><span className={message.unread && !read.includes(message.id) ? 'unread-dot bg-club-rule' : 'unread-dot bg-line'} /><span className="flex-1 truncate text-ink-2">{message.sender}</span><span className="font-mono text-ink-3">{message.time}</span></span><span className="inbox-subject block truncate font-semibold text-ink">{message.subject}</span></Button></li>)}</ul>
    <Button className="inbox-footer flex items-center justify-between border-t border-line text-ink-2 hover:bg-raised" onClick={() => { const next = messages.find(m => m.unread && !read.includes(m.id)) ?? messages[0]; setSelected(next ?? null); if (next) setRead(ids => [...ids, next.id]) }}><span>Tous les messages</span><Mail className="size-4" strokeWidth={1.5} /></Button>
    <Dialog.Root open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-scrim/60" /><Dialog.Content className="mail-dialog layer fixed left-1/2 top-1/2 z-50 w-[min(40rem,calc(100%-2rem))] max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border-t-2 border-club-rule bg-surface p-6"><div className="flex items-start justify-between gap-4"><div><p className="caps text-ink-2">{selected?.sender} · {selected?.received}</p><Dialog.Title className="mt-2 font-display text-[1.375rem] font-semibold text-ink">{selected?.subject}</Dialog.Title></div><Dialog.Close asChild><Button aria-label="Fermer le message" title="Fermer · Échap" className="flex size-11 shrink-0 items-center justify-center hover:bg-raised"><X className="size-5" strokeWidth={1.5} /></Button></Dialog.Close></div><Dialog.Description className="sr-only">Message du club</Dialog.Description><div className="my-6 space-y-4 text-[0.9375rem] leading-relaxed text-ink-2">{selected?.body.map(p => <p key={p}>{p}</p>)}</div><div className="flex flex-wrap gap-2">{selected?.actions.map(action => <Button key={action} className="min-h-11 border border-line-strong px-4 text-[0.8125rem] font-semibold text-ink hover:bg-raised" onClick={() => toast.show('Pas encore dans le prototype')}>{action}</Button>)}</div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </section>
}