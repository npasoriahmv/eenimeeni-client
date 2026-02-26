"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface ChildForm {
  name: string
  dob?: Date
  allergy?: string
}

/* ------------------ CONSTANTS ------------------ */

const MAX_CHILDREN = 5

const TODAY = new Date()
const ONE_YEAR_AGO = new Date(
  TODAY.getFullYear() - 1,
  TODAY.getMonth(),
  TODAY.getDate()
)
const MIN_DATE = new Date("1900-01-01")

/* ------------------ COMPONENT ------------------ */

export default function AddChildrenInline({
  onSaved,
}: {
  onSaved: (children: any[]) => void
}) {
  const [children, setChildren] = useState<ChildForm[]>([
    { name: "", dob: undefined, allergy: "" },
  ])
  const [loading, setLoading] = useState(false)

  /* ------------------ HANDLERS ------------------ */

  const addChild = () => {
    if (children.length >= MAX_CHILDREN) {
      toast.error("You can add a maximum of 5 children")
      return
    }

    setChildren([
      ...children,
      { name: "", dob: undefined, allergy: "" },
    ])
  }

  const removeChild = (index: number) => {
    if (children.length === 1) return
    setChildren(children.filter((_, i) => i !== index))
  }

  const updateChild = (
    index: number,
    field: keyof ChildForm,
    value: any
  ) => {
    const updated = [...children]
    updated[index] = { ...updated[index], [field]: value }
    setChildren(updated)
  }

  /* ------------------ SAVE ------------------ */

  const saveChildren = async () => {
    const validChildren = children.filter(
      (c) => c.name.trim() && c.dob
    )

    if (validChildren.length === 0) {
      toast.error("Add at least one child")
      return
    }

    // Extra safety age check
    const now = new Date()
    const invalidAge = validChildren.some((c) => {
      const ageMs = now.getTime() - new Date(c.dob!).getTime()
      return ageMs < 365 * 24 * 60 * 60 * 1000
    })

    if (invalidAge) {
      toast.error("Child must be at least 1 year old")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/child/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ children: validChildren }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error("Failed to save children")
        return
      }

      toast.success("Children saved successfully")
      onSaved(data.children)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ UI ------------------ */

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Add Children to Continue</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {children.map((child, index) => (
          <Card key={index} className="p-4 relative">
            {children.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeChild(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}

            <div className="space-y-3">
              {/* Name */}
              <div>
                <Label>Child Name</Label>
                <Input
                  value={child.name}
                  onChange={(e) =>
                    updateChild(index, "name", e.target.value)
                  }
                />
              </div>

              {/* DOB */}
              <div>
                <Label>Date of Birth</Label>
                <p className="text-xs text-muted-foreground">
                  Child must be at least 1 year old
                </p>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {child.dob
                        ? format(child.dob, "PPP")
                        : "Pick date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={child.dob}
                      onSelect={(d) =>
                        updateChild(index, "dob", d)
                      }
                      defaultMonth={ONE_YEAR_AGO}
                      startMonth={MIN_DATE}
                      endMonth={ONE_YEAR_AGO}
                      disabled={{
                        after: ONE_YEAR_AGO,
                        before: MIN_DATE,
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Allergy */}
              <div>
                <Label>Allergy (optional)</Label>
                <Input
                  value={child.allergy}
                  onChange={(e) =>
                    updateChild(index, "allergy", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>
        ))}

        {/* Add Child */}
        <Button
          type="button"
          variant="outline"
          onClick={addChild}
          className="w-full"
          disabled={children.length >= MAX_CHILDREN}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Child
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You can add up to {MAX_CHILDREN} children
        </p>

        {/* Save */}
        <Button
          onClick={saveChildren}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </CardContent>
    </Card>
  )
}
