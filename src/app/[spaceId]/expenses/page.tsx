import ExpensesClientPage from './ExpensesClientPage'

interface Props {
  params: Promise<{ spaceId: string }>
}

export default async function ExpensesPage({ params }: Props) {
  const { spaceId } = await params
  return <ExpensesClientPage spaceId={spaceId} />
}
