import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { config } from "dotenv"

// Load .env.local, Next.js does this for API routes but not custom servers
config({ path: ".env.local" })

const dev  = process.env.NODE_ENV !== "production"
const port = parseInt(process.env.PORT ?? "3000", 10)

async function main() {
  const app    = next({ dev })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

main().catch((err) => {
  console.error("Server failed to start:", err)
  process.exit(1)
})
