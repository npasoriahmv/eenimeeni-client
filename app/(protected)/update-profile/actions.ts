"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAndChildren(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      parentName: formData.get("parentName") as string,
      email: (formData.get("email") as string) || null,
      address: (formData.get("address") as string) || null,
    },
  });

  const count = Number(formData.get("childrenCount"));

  for (let i = 0; i < count; i++) {
    await prisma.child.update({
      where: {
        id: formData.get(`child-${i}-id`) as string,
      },
      data: {
        name: formData.get(`child-${i}-name`) as string,
        allergy: (formData.get(`child-${i}-allergy`) as string) || null,
        dob: new Date(formData.get(`child-${i}-dob`) as string),
      },
    });
  }

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully" };
}
