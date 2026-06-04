import SettingsClientPage from './SettingsClientPage'

interface Props {
  params: Promise<{ spaceId: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { spaceId } = await params
  return <SettingsClientPage spaceId={spaceId} />
}
