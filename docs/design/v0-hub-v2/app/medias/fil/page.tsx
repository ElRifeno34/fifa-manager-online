import type { Metadata } from 'next'
import { SocialViewer } from '@/components/social-viewer'

export const metadata: Metadata = {
  title: 'Médias · Fil du club — Online Manager',
}

export default function Page() {
  return <SocialViewer />
}
