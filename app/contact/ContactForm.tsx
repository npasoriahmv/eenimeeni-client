"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type FormData = {
  name: string
  email: string
  phone: string
  query: string
  message: string
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const data: FormData = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      message: form.get("message") as string,
      query,
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log(result)

      if (response.ok) {
        toast.success(result.message || "Form Submitted Successfully, We will contact you soon")

        // Reset form
        formRef.current?.reset()
        setQuery("")
      } else {
        toast.error(result.message || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something Went Wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardContent className="p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" placeholder="Name" required disabled={loading}/>
            <Input name="email" placeholder="Email" type="email" required disabled={loading}/>
          </div>

          <Input name="phone" placeholder="Phone Number" required disabled={loading}/>

          <Select value={query} onValueChange={setQuery} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Type of Query" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="general">General Enquiry</SelectItem>
              <SelectItem value="party">For Party</SelectItem>
              <SelectItem value="event">Register for Event / Workshop</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <input type="hidden" name="query" value={query} />

          <Textarea
            name="message"
            placeholder="Write your message..."
            className="min-h-[120px]"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
