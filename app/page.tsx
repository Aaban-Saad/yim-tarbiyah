import { AuthGuard } from "@/components/auth-guard"
import { UserDashboard } from "@/components/user-dashboard"

export default function HomePage() {
  return (
    <AuthGuard>
      <UserDashboard />
    </AuthGuard>
  )
}
