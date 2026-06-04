import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import SpaceClientLayout from '@/components/layout/SpaceClientLayout'
import type { Space } from '@/types'

interface Props {
  children: React.ReactNode
  params: Promise<{ spaceId: string }>
}

export default async function SpaceLayout({ children, params }: Props) {
  const { spaceId } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseServerClient() as any

  const { data } = await supabase
    .from('spaces')
    .select('id, name')
    .eq('id', spaceId)
    .single()

  const space = data as Pick<Space, 'id' | 'name'> | null
  if (!space) redirect('/')

  return (
    <SpaceClientLayout spaceId={space.id} spaceName={space.name}>
      {children}
    </SpaceClientLayout>
  )
}
