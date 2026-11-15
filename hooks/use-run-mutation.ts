"use client"

import { useState } from "react"
import { toast } from "sonner"
import { errorMessage } from "@/lib/errors"

export function useRunMutation() {
  const [pending, setPending] = useState(false)

  async function run<T>(action: () => Promise<T>, success?: string) {
    setPending(true)
    try {
      const result = await action()
      if (success) toast.success(success)
      return { ok: true as const, result }
    } catch (error) {
      toast.error(errorMessage(error))
      return { ok: false as const }
    } finally {
      setPending(false)
    }
  }

  return { run, pending }
}
