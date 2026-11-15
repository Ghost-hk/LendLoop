import type { NextConfig } from "next"
import { authorizedOrigins } from "./lib/authorized-origins"

const nextConfig: NextConfig = {
  allowedDevOrigins: authorizedOrigins.map((origin) => new URL(origin).hostname),
}

export default nextConfig
