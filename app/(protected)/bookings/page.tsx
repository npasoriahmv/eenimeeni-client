import { auth } from "@/auth"
import { redirect } from "next/navigation"
import HistoryTabs from "./components/HistoryTabs"

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user.id) redirect("/login")

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <HistoryTabs />
    </div>
  )
}
