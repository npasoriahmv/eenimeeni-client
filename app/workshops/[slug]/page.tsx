import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PeopleSelector } from "./PeopleSelector";

function formatIST(datetime: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(datetime);
}

export default async function WorkshopDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workshop = await prisma.workShop.findUnique({
    where: { slug },
  });

  if (!workshop) return notFound();

  const start = new Date(workshop.startAt);
  const end = new Date(workshop.endAt);

  const sessionPlans = workshop.sessionPlans as {
    title: string;
    duration: string;
    details?: string;
  }[];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Banner */}
      <div className="relative h-[380px] w-full rounded-3xl overflow-hidden group shadow-xl">
        <Image
          src={workshop.bannerImage}
          alt={workshop.title}
          fill
          className="object-cover group-hover:scale-105 transition-all duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        {/* Banner Content */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            {workshop.title}
          </h1>

          <p className="text-white/80 max-w-2xl">{workshop.shortTagline}</p>

          <div className="flex flex-wrap gap-3 mt-2">
            <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
              {formatIST(start)}
            </Badge>

            <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
              {start.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {end.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Badge>

            <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
              {workshop.ageGroup}
            </Badge>

            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
              ₹{workshop.fee}
            </Badge>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <Card className="border border-border shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            About the Workshop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground text-[15px]">
            {workshop.description}
          </p>
        </CardContent>
      </Card>

      {/* What Kids Learn + Inclusions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-border shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              What Kids Will Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workshop.whatKidsLearn.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[15px]"
                >
                  <span className="h-2 w-2 bg-primary rounded-full mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Inclusions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workshop.inclusions.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[15px]"
                >
                  <span className="h-2 w-2 bg-primary rounded-full mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* SESSION PLAN - Timeline */}
      <Card className="border border-border shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Session Plan
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {sessionPlans.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-primary" />
                {idx !== sessionPlans.length - 1 && (
                  <div className="w-[2px] flex-1 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 border rounded-2xl p-4 hover:shadow-md transition">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-[16px]">
                    {step.title}
                  </h3>
                  <Badge variant="secondary" className="rounded-full">
                    {step.duration}
                  </Badge>
                </div>

                {step.details && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Important Instructions */}
      {workshop.importantInstructions?.length ? (
        <Card className="border border-border shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {workshop.importantInstructions.map((item) => (
                <li key={item} className="text-[15px]">
                  • {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Cancellation */}
      {workshop.cancellationPolicy ? (
        <Card className="border border-border shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Cancellation & Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              {workshop.cancellationPolicy}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <PeopleSelector workShopId={workshop.id} amount={workshop.fee}/>
    </div>
  );
}
