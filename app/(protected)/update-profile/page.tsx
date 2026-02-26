import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <ProfileForm user={user} />
    </div>
  );
}
