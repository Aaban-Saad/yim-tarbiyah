import { AuthGuard } from "@/components/auth-guard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminDashboard />
    </AuthGuard>
  )
}
