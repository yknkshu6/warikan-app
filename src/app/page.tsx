import CreateSpaceForm from '@/components/space/CreateSpaceForm'
import RecentSpaces from '@/components/space/RecentSpaces'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ワリカン</h1>
          <p className="text-sm text-muted-foreground">
            URLを共有するだけで、みんなで割り勘・家計管理
          </p>
        </div>

        <div className="space-y-6">
          <CreateSpaceForm />
          <RecentSpaces />
        </div>
      </div>
    </main>
  )
}
