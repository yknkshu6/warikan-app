import HomeClientPage from './HomeClientPage'

interface Props {
  params: Promise<{ spaceId: string }>
}

export default async function SpaceHomePage({ params }: Props) {
  const { spaceId } = await params
  return <HomeClientPage spaceId={spaceId} />
}
