"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ShieldAlert, RefreshCcw } from "lucide-react"

interface Props {
    accepted: boolean
    onChange: (value: boolean) => void
}

export default function BookingDisclaimers({ accepted, onChange }: Props) {
    return (
        <Card className="border-amber-200 bg-amber-50/40">
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p>
                            <span className="font-medium text-foreground">
                                Safety Disclaimer:
                            </span>{" "}
                            Children must be supervised at all times. Lumiro Enterprises will not be responsible for any child left
                            unattended.
                        </p>
                    </div>

                    <div className="flex items-start gap-2">
                        <RefreshCcw className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p>
                            <span className="font-medium text-foreground">
                                Refund Policy:
                            </span>{" "}
                            Refunds are not applicable
                            for Eeni-Meeni bookings under any circumstances.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                        id="disclaimer"
                        checked={accepted}
                        onCheckedChange={(v) => onChange(!!v)}
                    />
                    <Label
                        htmlFor="disclaimer"
                        className="text-sm leading-relaxed cursor-pointer"
                    >
                        I have read and agree to the safety guidelines and refund
                        policy.
                    </Label>
                </div>
            </CardContent>
        </Card>
    )
}
