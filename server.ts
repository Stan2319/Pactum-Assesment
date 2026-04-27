import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { WebSocketServer } from "ws"
import { config } from "dotenv"
import { handlePtyWebSocket } from "./lib/ws-pty-handler"

// Load .env.local — Next.js does this for API routes but not custom servers
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

  const wss = new WebSocketServer({ noServer: true })

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url!)
    console.log("[upgrade]", pathname)
    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req)
      })
    }
    // All other upgrade requests (e.g. Next.js HMR) are left alone
  })

  wss.on("connection", handlePtyWebSocket)

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

main().catch((err) => {
  console.error("Server failed to start:", err)
  process.exit(1)
})
