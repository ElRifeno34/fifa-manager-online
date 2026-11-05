import type { Metadata } from 'next'
import { MailView } from '@/components/mail-view'

export const metadata: Metadata = {
  title: 'Messagerie · Online Manager',
  description: 'Boîte de réception du manager : direction, staff, transferts et presse.',
}

export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  return <MailView initialId={id} />
}
