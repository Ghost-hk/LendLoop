import { defineSchema } from "convex/server"
import { users } from "./users/table"
import { tools } from "./tools/table"
import { loans } from "./loans/table"
import { auditLog } from "./audit/table"

export default defineSchema({ users, tools, loans, auditLog })
