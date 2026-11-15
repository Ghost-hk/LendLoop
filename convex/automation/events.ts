import type { MutationCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"
import type { LoanEvent } from "../lib/validators"

export async function recordLoanEvent(_ctx: MutationCtx, _loan: Doc<"loans">, _event: LoanEvent) {}
