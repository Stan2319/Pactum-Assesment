"use client"

import { useRef, useEffect } from "react"

const GRID = 28
const TRAIL_LENGTH = 12
const STEP_MS = 320   // ms to slide one grid step
const NUM_WALKERS = 5

interface Walker {
  // completed dot positions in trail
  trail: Array<{ x: number; y: number }>
  // current slide
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number   // 0–1
  dx: number
  dy: number
}

const DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
]

// ease in-out for smooth feel
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function nextTarget(
  x: number, y: number,
  dx: number, dy: number,
  cols: number, rows: number
) {
  const valid = DIRS.filter(d => {
    const nx = x + d.dx
    const ny = y + d.dy
    return nx >= 0 && nx < cols && ny >= 0 && ny < rows
  })
  if (valid.length === 0) return { dx, dy }

  const hitWall = !valid.find(d => d.dx === dx && d.dy === dy)

  // 75% chance straight, unless wall ahead
  if (!hitWall && Math.random() > 0.25) {
    return { dx, dy }
  }

  // prefer not to reverse
  const noReverse = valid.filter(d => !(d.dx === -dx && d.dy === -dy))
  const pool = noReverse.length > 0 ? noReverse : valid
  return pool[Math.floor(Math.random() * pool.length)]
}

export function HeroWalkers() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const cols = () => Math.floor(canvas.width / GRID) + 1
    const rows = () => Math.floor(canvas.height / GRID) + 1

    const walkers: Walker[] = Array.from({ length: NUM_WALKERS }, () => {
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)]
      const x = Math.floor(Math.random() * cols())
      const y = Math.floor(Math.random() * rows())
      const c = cols(), r = rows()
      const nd = nextTarget(x, y, dir.dx, dir.dy, c, r)
      return {
        trail: [],
        fromX: x, fromY: y,
        toX: x + nd.dx, toY: y + nd.dy,
        progress: Math.random(), // stagger start positions
        dx: nd.dx, dy: nd.dy,
      }
    })

    let lastTs = 0
    let animId: number

    const draw = (ts: number) => {
      const elapsed = lastTs === 0 ? 16 : ts - lastTs
      lastTs = ts

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const c = cols(), r = rows()

      walkers.forEach(w => {
        // advance progress
        w.progress += elapsed / STEP_MS

        // arrived at next dot?
        while (w.progress >= 1) {
          w.progress -= 1
          // commit arrival
          w.trail.push({ x: w.fromX, y: w.fromY })
          if (w.trail.length > TRAIL_LENGTH) w.trail.shift()
          w.fromX = w.toX
          w.fromY = w.toY
          // pick next
          const nd = nextTarget(w.fromX, w.fromY, w.dx, w.dy, c, r)
          w.dx = nd.dx
          w.dy = nd.dy
          w.toX = Math.max(0, Math.min(c - 1, w.fromX + w.dx))
          w.toY = Math.max(0, Math.min(r - 1, w.fromY + w.dy))
        }

        const ep = easeInOut(w.progress)
        const headX = (w.fromX + (w.toX - w.fromX) * ep) * GRID
        const headY = (w.fromY + (w.toY - w.fromY) * ep) * GRID

        // build point list: trail dots + from + live head
        const trailPx = w.trail.map(p => ({ px: p.x * GRID, py: p.y * GRID }))
        const fromPx = { px: w.fromX * GRID, py: w.fromY * GRID }
        const allPoints = [...trailPx, fromPx, { px: headX, py: headY }]

        if (allPoints.length < 2) return

        // draw segments, fading from tail to head
        for (let i = 1; i < allPoints.length; i++) {
          const t = i / (allPoints.length - 1)
          const alpha = t * 0.18
          const { px: x1, py: y1 } = allPoints[i - 1]
          const { px: x2, py: y2 } = allPoints[i]
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(0,0,0,${alpha.toFixed(3)})`
          ctx.lineWidth = 1.5
          ctx.lineCap = "round"
          ctx.stroke()
        }

        // head dot
        ctx.beginPath()
        ctx.arc(headX, headY, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0,0,0,0.22)"
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}
