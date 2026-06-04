'use client'

import { useMembers } from '@/hooks/useMembers'
import { useCategories } from '@/hooks/useCategories'
import MemberSection from '@/components/settings/MemberSection'
import CategorySection from '@/components/settings/CategorySection'

interface Props {
  spaceId: string
}

export default function SettingsClientPage({ spaceId }: Props) {
  const { members, addMember, updateMember, softDeleteMember, refetch: refetchMembers } = useMembers(spaceId)
  const { categories, addCategory, deleteCategory, refetch: refetchCategories } = useCategories(spaceId)

  const handleAddMember = async (displayName: string, color: string) => {
    await addMember(displayName, color)
    await refetchMembers()
  }

  const handleEditMember = async (memberId: string, displayName: string, color: string) => {
    await updateMember(memberId, { display_name: displayName, color })
    await refetchMembers()
  }

  const handleDeleteMember = async (memberId: string) => {
    await softDeleteMember(memberId)
    await refetchMembers()
  }

  const handleAddCategory = async (name: string, color: string) => {
    await addCategory(name, color)
    await refetchCategories()
  }

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId)
    await refetchCategories()
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">設定</h1>
      </div>

      {/* スクロール領域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-16">
        {/* メンバー管理 */}
        <MemberSection
          members={members}
          onAddMember={handleAddMember}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
        />

        {/* カテゴリ管理 */}
        <CategorySection
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </div>
  )
}
