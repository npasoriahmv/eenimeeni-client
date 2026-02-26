"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import AddChildrenInline from "@/app/(protected)/booking/playzone/components/AddChildInLine"
import { toast } from "sonner"

interface Child {
  id: string
  name: string
}

const TODAY = new Date()

const ONE_YEAR_AGO = new Date(
  TODAY.getFullYear() - 1,
  TODAY.getMonth(),
  TODAY.getDate()
)

const MIN_DATE = new Date("1900-01-01")


export default function ChildrenSelector({
  selectedChildrenIds,
  onSelectionChange,
  initialUserData,
}: any) {
  const [user, setUser] = useState(initialUserData)
  const [loading, setLoading] = useState(!initialUserData)

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/get-user", {
        method: "POST",
      })
      const data = await res.json()
      if (data.status === 200) setUser(data.user)
    } catch {
      toast.error("Failed to load children")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialUserData) fetchUser()
  }, [])

  if (loading) return null

  const children: Child[] = user?.children || []

  // 🔥 MODE 1: NO CHILDREN → ADD MODE
  if (children.length === 0) {
    return (
      <AddChildrenInline
        onSaved={(createdChildren) => {
          setUser((prev: any) => ({
            ...prev,
            children: createdChildren,
          }))

          // 🔥 AUTO SELECT ALL
          const ids = createdChildren.map((c: any) => c.id)
          onSelectionChange(ids, createdChildren)
        }}
      />
    )
  }


  // 🔥 MODE 2: SELECT MODE
  const toggle = (child: Child, checked: boolean) => {
    const ids = checked
      ? [...selectedChildrenIds, child.id]
      : selectedChildrenIds.filter((id: string) => id !== child.id)

    const selected = children.filter((c) => ids.includes(c.id))
    onSelectionChange(ids, selected)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Children</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {children.map((child) => (
          <div
            key={child.id}
            className="flex items-center gap-3 p-3 border rounded"
          >
            <Checkbox
              checked={selectedChildrenIds.includes(child.id)}
              onCheckedChange={(c) =>
                toggle(child, !!c)
              }
            />
            <Label>{child.name}</Label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
