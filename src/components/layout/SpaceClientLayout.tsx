'use client'

import { useEffect, useState } from 'react'
import BottomNav from './BottomNav'
import MemberSelectModal from '@/components/member/MemberSelectModal'
import { useSessionStore } from '@/stores/sessionStore'
import { useFilterStore } from '@/stores/filterStore'

interface Props {
  spaceId: string
  spaceName: string
  children: React.ReactNode
}

export default function SpaceClientLayout({ spaceId, spaceName, children }: Props) {
  const [showModal, setShowModal] = useState(false)
  const { getMembership, addRecentlyVisited } = useSessionStore()
  const { setSelfMemberId } = useFilterStore()

  useEffect(() => {
    addRecentlyVisited(spaceId, spaceName)
    const membership = getMembership(spaceId)
    if (membership) {
      setSelfMemberId(membership.member_id)
    } else {
      setShowModal(true)
    }
  }, [spaceId, spaceName, getMembership, addRecentlyVisited, setSelfMemberId])

  return (
    <>
      <div className="pb-16 min-h-screen">{children}</div>
      <BottomNav spaceId={spaceId} />
      {showModal && (
        <MemberSelectModal
          spaceId={spaceId}
          onComplete={() => setShowModal(false)}
        />
      )}
    </>
  )
}
