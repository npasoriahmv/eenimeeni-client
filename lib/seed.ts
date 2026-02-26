"use server";

import { prisma } from "@/lib/prisma";
import { workshops } from "./workshop";

export async function seedWorkshops() {
  console.log("🌱 Seeding workshops...");

  await prisma.workShop.createMany({
    data: workshops.map(w => ({
      slug: w.id,
      title: w.title,
      maxkids:w.maxkids,
      shortTagline: w.shortTagline,
      startAt: new Date(w.startAt),
      endAt: new Date(w.endAt),
      ageGroup: w.ageGroup,
      fee: w.fee,
      bannerImage: w.bannerImage,
      description: w.description,
      whatKidsLearn: w.whatKidsLearn,
      inclusions: w.inclusions,
      importantInstructions: w.importantInstructions ?? [],
      cancellationPolicy: w.cancellationPolicy ?? null,
      sessionPlans: w.sessionPlan
    })),
    skipDuplicates: false
  });

  console.log("🎉 Seed completed!");
}
