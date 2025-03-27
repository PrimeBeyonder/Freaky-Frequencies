import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function UserHomePage({
  params,
}: {
  params: { username: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Ensure the user is accessing their own page
  if (user.username !== params.username) {
    redirect(`/${user.username}/home`)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name || user.username}!</h1>
      <p>This is your home page.</p>
    </div>
  )
}

