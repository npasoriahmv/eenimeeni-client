"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { updateProfileAndChildren } from "./actions";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";

export default function ProfileForm({ user }: { user: any }) {
    const [children, setChildren] = useState(user.children);
    const [pending, startTransition] = useTransition();

    const submit = (formData: FormData) => {
        formData.set("childrenCount", String(children.length));

        startTransition(async () => {
            const res = await updateProfileAndChildren(formData);
            res.success ? toast.success(res.message) : toast.error(res.message);
        });
    };

    return (
        <form action={submit} className="space-y-10">
            {/* PROFILE */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Profile</CardTitle>
                    <CardDescription>Personal details</CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                        <Label>Parent Name</Label>
                        <Input name="parentName" defaultValue={user.parentName} />
                    </div>

                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={user.phone} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input name="email" defaultValue={user.email ?? ""} />
                    </div>

                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input name="address" defaultValue={user.address ?? ""} />
                    </div>
                </CardContent>
            </Card>

            {/* CHILDREN */}
            {/* CHILDREN */}
            <Card className="rounded-2xl shadow-sm border-muted">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Children Details</CardTitle>
                            <CardDescription>
                                Edit child information (DOB cannot be a future date)
                            </CardDescription>
                        </div>
                        <Badge variant="secondary">
                            {children.length} Child{children.length > 1 ? "ren" : ""}
                        </Badge>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-6 pt-6 bg-muted/30">
                    {children.map((child: any, index: number) => (
                        <div
                            key={child.id}
                            className="rounded-xl border bg-background p-5 shadow-sm space-y-4"
                        >
                            <input
                                type="hidden"
                                name={`child-${index}-id`}
                                value={child.id}
                            />

                            <div className="grid md:grid-cols-3 gap-4">
                                {/* NAME */}
                                <div className="space-y-2">
                                    <Label>Child Name</Label>
                                    <Input
                                        name={`child-${index}-name`}
                                        defaultValue={child.name}
                                        placeholder="Enter child name"
                                    />
                                </div>

                                {/* DOB */}
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start font-normal"
                                            >
                                                {format(new Date(child.dob), "PPP")}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={new Date(child.dob)}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    const copy = [...children];
                                                    copy[index].dob = date;
                                                    setChildren(copy);
                                                }}
                                                disabled={(date) => date > new Date()}
                                                captionLayout="dropdown"
                                                fromYear={1990}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <input
                                        type="hidden"
                                        name={`child-${index}-dob`}
                                        value={child.dob}
                                    />
                                </div>

                                {/* ALLERGY */}
                                <div className="space-y-2">
                                    <Label>Allergy</Label>
                                    <Input
                                        name={`child-${index}-allergy`}
                                        placeholder="Optional (e.g. peanuts)"
                                        defaultValue={child.allergy ?? ""}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>


            {/* ACTION */}
            <div className="flex justify-end">
                <Button size="lg" disabled={pending} className="rounded-xl px-10">
                    {pending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
