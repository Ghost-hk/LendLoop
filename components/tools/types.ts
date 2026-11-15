import type { FunctionReturnType } from "convex/server"
import type { api } from "@/convex/_generated/api"

export type WallTool = FunctionReturnType<typeof api.tools.queries.list>[number]
export type MyTool = FunctionReturnType<typeof api.tools.queries.mine>[number]
