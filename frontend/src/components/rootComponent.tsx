import { Outlet } from '@tanstack/react-router'
import { TopNav } from '@/components/logical/topNav'

export function RootComponent() {
  return (
    <div>
      <TopNav />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  )
}