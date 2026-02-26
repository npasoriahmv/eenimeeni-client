import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Config (keep in sync with the page) ────────────────────────────────────
const MIN_CHILD_AGE_YEARS = 1; // children must be older than this many years
// ─────────────────────────────────────────────────────────────────────────────

type ChildInput = {
  name: string;
  dob: string; // ISO date string
  allergy?: string;
};

type RegisterBody = {
  parentName: string;
  phone: string;
  email?: string;
  address?: string;
  children: ChildInput[];
};

export async function POST(req: NextRequest) {
  let body: RegisterBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { parentName, phone, email, address, children } = body;

  // ── Server-side validation ─────────────────────────────────────────────────
  const fieldErrors: Record<string, string> = {};

  if (!parentName?.trim()) fieldErrors.parentName = "Parent name is required.";

  if (!phone || !/^\d{10}$/.test(phone.trim()))
    fieldErrors.phone = "Enter a valid 10-digit phone number.";

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    fieldErrors.email = "Enter a valid email address.";

  // Children are optional — only validate if provided
  if (children && !Array.isArray(children))
    fieldErrors.children = "Invalid children data.";

  // Validate each child
  const now = new Date();
  const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - MIN_CHILD_AGE_YEARS);

  (children ?? []).forEach((child, i) => {
    if (!child.name?.trim())
      fieldErrors[`child_${i}_name`] = "Child name is required.";

    if (!child.dob) {
      fieldErrors[`child_${i}_dob`] = "Date of birth is required.";
    } else {
      const dob = new Date(child.dob);
      if (isNaN(dob.getTime())) {
        fieldErrors[`child_${i}_dob`] = "Invalid date of birth.";
      } else if (dob > now) {
        fieldErrors[`child_${i}_dob`] = "Date of birth cannot be in the future.";
      } else if (dob > minDOB) {
        fieldErrors[`child_${i}_dob`] =
          `Child must be older than ${MIN_CHILD_AGE_YEARS} year(s).`;
      }
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ fieldErrors }, { status: 422 });
  }

  // ── Persist ────────────────────────────────────────────────────────────────
  try {
    const user = await prisma.user.create({
      data: {
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        children: {
          create: children.map((c) => ({
            name: c.name.trim(),
            dob: new Date(c.dob),
            allergy: c.allergy?.trim() || null,
          })),
        },
      },
      include: { children: true },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err: any) {
    // Unique constraint on phone / email
    // Prisma 7: meta.target can be a string, an array of strings, or an array of objects
    if (err.code === "P2002") {
      // Normalise target to a single string for easy checking
      const raw = err.meta?.target;
      const targetStr: string = Array.isArray(raw)
        ? raw.map((t: any) => (typeof t === "object" ? JSON.stringify(t) : String(t))).join(",")
        : String(raw ?? "");

      if (targetStr.includes("phone"))
        return NextResponse.json(
          { fieldErrors: { phone: "This phone number is already registered. Please contact us if you need help." } },
          { status: 409 }
        );

      if (targetStr.includes("email"))
        return NextResponse.json(
          { fieldErrors: { email: "This email is already registered. Please use a different email or leave it blank." } },
          { status: 409 }
        );

      // Fallback for any other unique field
      return NextResponse.json(
        { error: "A record with these details already exists." },
        { status: 409 }
      );
    }

    console.error("[register] DB error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}