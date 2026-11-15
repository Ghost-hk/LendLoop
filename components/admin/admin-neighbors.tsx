"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRunMutation } from "@/hooks/use-run-mutation"

export function AdminNeighbors() {
  const users = useQuery(api.admin.queries.users)
  const setTrusted = useMutation(api.admin.mutations.setTrustedLender)
  const { run, pending } = useRunMutation()

  if (users === undefined) return <Skeleton className="h-40 rounded-xl" />

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Neighbor</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Listings</TableHead>
            <TableHead className="text-right">Trusted Lender</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell className="text-right tabular">{user.activeListings}</TableCell>
              <TableCell className="text-right">
                <Switch
                  aria-label={`Trusted Lender: ${user.name}`}
                  checked={user.trustedLender}
                  disabled={pending}
                  onCheckedChange={(trusted) =>
                    run(
                      () => setTrusted({ userId: user._id, trusted }),
                      trusted ? `${user.name} is now a Trusted Lender` : `Trusted Lender removed from ${user.name}`,
                    )
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
