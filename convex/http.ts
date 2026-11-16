import { httpRouter } from "convex/server"
import { automationError, overdueLoans, reminderStatus } from "./automation/endpoints"

const http = httpRouter()

http.route({ path: "/n8n/overdue-loans", method: "GET", handler: overdueLoans })
http.route({ path: "/n8n/reminder-status", method: "POST", handler: reminderStatus })
http.route({ path: "/n8n/automation-error", method: "POST", handler: automationError })

export default http
