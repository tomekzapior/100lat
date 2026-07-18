import { useEffect, useRef, useState } from 'react'

interface FireworksProps {
  active?: boolean
  className?: string
}

type BurstType =
  | 'brocade'
  | 'chrysanthemum'
  | 'crackle'
  | 'crossette'
  | 'peony'
  | 'willow'

interface Point {
  x: number
  y: number
}

interface Rocket {
  x: number
  y: number
  velocityX: number
  velocityY: number
  gravity: number
  targetY: number
  color: string
  palette: string[]
  burstType: BurstType
  trail: Point[]
  size: number
  wobble: number
  wobbleSpeed: number
  wobbleAmplitude: number
  sparking: number
}

interface Spark {
  x: number
  y: number
  velocityX: number
  velocityY: number
  gravity: number
  drag: number
  life: number
  decay: number
  color: string
  size: number
  trailLength: number
  trail: Point[]
  twinkleOffset: number
  shimmer: boolean
  crackle: boolean
  crackled: boolean
  crackleAt?: number
  splitAt?: number
  hasSplit?: boolean
}

interface Flash {
  x: number
  y: number
  radius: number
  life: number
  color: string
  decay: number
}

interface SparkOptions {
  x: number
  y: number
  angle: number
  speed: number
  velocityX?: number
  velocityY?: number
  velocityYOffset?: number
  color: string
  gravity?: number
  drag?: number
  life?: number
  decay?: number
  size?: number
  trailLength?: number
  shimmer?: boolean
  crackle?: boolean
  crackleAt?: number
  splitAt?: number
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const MAX_ROCKETS = 10
const MOBILE_SPARK_CAP = 420
const DESKTOP_SPARK_CAP = 720
const MAX_FLASHES = 32
const burstTypes: BurstType[] = [
  'peony',
  'chrysanthemum',
  'willow',
  'crossette',
  'crackle',
  'brocade',
]
const palettes = [
  ['#FF6B6B', '#FF8E8E', '#FFB4B4', '#FFFFFF'],
  ['#4ECDC4', '#7EDDD6', '#B4EBE7', '#FFFFFF'],
  ['#FFC371', '#FFD699', '#FFEACC', '#FFFFFF'],
  ['#A29BFE', '#BDB8FF', '#D9D6FF', '#FFFFFF'],
  ['#FF6B6B', '#FFC371', '#FFEAA7', '#FFFFFF'],
  ['#4ECDC4', '#A29BFE', '#D9D6FF', '#FFFFFF'],
  ['#2ED573', '#7BED9F', '#B8F5CC', '#FFFFFF'],
  ['#FF85A2', '#FFA8BD', '#FFCCD8', '#FFFFFF'],
  ['#6C5CE7', '#A29BFE', '#CCC5FE', '#FFFFFF'],
  ['#FDCB6E', '#FFE082', '#FFF3C4', '#FFFFFF'],
  ['#74B9FF', '#A4CDFF', '#D4E6FF', '#FFFFFF'],
  ['#FF6B6B', '#4ECDC4', '#FFC371', '#FFFFFF'],
]

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? false
      : window.matchMedia(REDUCED_MOTION_QUERY).matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)

    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function pickShellColor(palette: string[]) {
  return palette[Math.floor(Math.random() * Math.max(palette.length - 1, 1))]
}

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

function FireworksCanvas({ className = '' }: Pick<FireworksProps, 'className'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof CanvasRenderingContext2D === 'undefined') return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    const rockets: Rocket[] = []
    const sparks: Spark[] = []
    const flashes: Flash[] = []
    const launchTimers = new Set<number>()
    let viewportWidth = 1
    let viewportHeight = 1
    let pixelRatio = 1
    let sparkCap = DESKTOP_SPARK_CAP
    let animationFrame = 0
    let previousTime = 0
    const sequenceInterval = randomBetween(2_200, 3_700)
    let nextSequenceAt = performance.now() + sequenceInterval
    let sequenceRemaining = sequenceInterval
    let disposed = false

    const resizeCanvas = () => {
      const previousWidth = viewportWidth
      const previousHeight = viewportHeight
      const bounds = canvas.getBoundingClientRect()
      viewportWidth = Math.max(bounds.width, 1)
      viewportHeight = Math.max(bounds.height, 1)
      pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2)
      sparkCap = viewportWidth < 640 ? MOBILE_SPARK_CAP : DESKTOP_SPARK_CAP

      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      if (previousWidth <= 1 || previousHeight <= 1) return

      const scaleX = viewportWidth / previousWidth
      const scaleY = viewportHeight / previousHeight
      const scalePoint = (point: Point) => {
        point.x *= scaleX
        point.y *= scaleY
      }

      rockets.forEach((rocket) => {
        rocket.x *= scaleX
        rocket.y *= scaleY
        rocket.targetY *= scaleY
        rocket.trail.forEach(scalePoint)
      })
      sparks.forEach((spark) => {
        spark.x *= scaleX
        spark.y *= scaleY
        spark.trail.forEach(scalePoint)
      })
      flashes.forEach((flash) => {
        flash.x *= scaleX
        flash.y *= scaleY
      })
    }

    const pushSpark = ({
      x,
      y,
      angle,
      speed,
      velocityX,
      velocityY,
      velocityYOffset = 0,
      color,
      gravity = randomBetween(0.035, 0.06),
      drag = randomBetween(0.978, 0.988),
      life = 1,
      decay = randomBetween(0.012, 0.02),
      size = randomBetween(1.65, 2.8),
      trailLength = 6,
      shimmer = false,
      crackle = false,
      crackleAt,
      splitAt,
    }: SparkOptions) => {
      if (sparks.length >= sparkCap) return

      sparks.push({
        x,
        y,
        velocityX: velocityX ?? Math.cos(angle) * speed,
        velocityY:
          velocityY ?? Math.sin(angle) * speed + velocityYOffset,
        gravity,
        drag,
        life,
        decay,
        color,
        size,
        trailLength,
        trail: [],
        twinkleOffset: randomBetween(0, Math.PI * 2),
        shimmer,
        crackle,
        crackled: false,
        crackleAt,
        splitAt,
        hasSplit: false,
      })
    }

    const addFlash = (
      x: number,
      y: number,
      color: string,
      radius: number,
    ) => {
      if (flashes.length >= MAX_FLASHES) return
      flashes.push({ x, y, color, radius, life: 1, decay: 0.06 })
    }

    const shellCount = (count: number) =>
      Math.max(1, Math.round(count * (viewportWidth < 640 ? 0.65 : 1)))

    const miniExplode = (
      x: number,
      y: number,
      color: string,
      count: number,
    ) => {
      addFlash(x, y, color, 15)
      for (let index = 0; index < shellCount(count); index += 1) {
        pushSpark({
          x,
          y,
          angle: randomBetween(0, Math.PI * 2),
          speed: randomBetween(0.8, 2.3),
          color,
          gravity: 0.03,
          drag: 0.98,
          decay: randomBetween(0.02, 0.04),
          size: randomBetween(1, 1.8),
          trailLength: 3,
          shimmer: Math.random() < 0.5,
        })
      }
    }

    const explode = (rocket: Rocket) => {
      const mainColor = pickShellColor(rocket.palette)
      addFlash(
        rocket.x,
        rocket.y,
        mainColor,
        rocket.burstType === 'willow' ? 60 : 45,
      )

      if (rocket.burstType === 'peony') {
        const count = shellCount(70 + Math.floor(Math.random() * 30))
        for (let index = 0; index < count; index += 1) {
          pushSpark({
            x: rocket.x,
            y: rocket.y,
            angle: randomBetween(0, Math.PI * 2),
            speed: randomBetween(1.5, 5),
            color:
              Math.random() < 0.85
                ? mainColor
                : pickShellColor(rocket.palette),
            gravity: 0.025,
            drag: 0.985,
            decay: randomBetween(0.008, 0.016),
            size: randomBetween(1.8, 3.3),
            trailLength: 4,
            shimmer: Math.random() < 0.3,
          })
        }
      } else if (rocket.burstType === 'chrysanthemum') {
        const count = shellCount(55 + Math.floor(Math.random() * 25))
        for (let index = 0; index < count; index += 1) {
          pushSpark({
            x: rocket.x,
            y: rocket.y,
            angle:
              (index / count) * Math.PI * 2 + randomBetween(-0.075, 0.075),
            speed: randomBetween(2, 4.5),
            color:
              Math.random() < 0.7
                ? mainColor
                : pickShellColor(rocket.palette),
            gravity: 0.018,
            drag: 0.992,
            decay: randomBetween(0.005, 0.01),
            size: randomBetween(1.5, 2.7),
            trailLength: 10,
          })
        }
      } else if (rocket.burstType === 'willow') {
        const willowPalette =
          Math.random() < 0.5 ? rocket.palette : palettes[9]
        const count = shellCount(50 + Math.floor(Math.random() * 20))
        for (let index = 0; index < count; index += 1) {
          pushSpark({
            x: rocket.x,
            y: rocket.y,
            angle:
              (index / count) * Math.PI * 2 + randomBetween(-0.1, 0.1),
            speed: randomBetween(2, 4),
            velocityYOffset: -1,
            color: pickShellColor(willowPalette),
            gravity: 0.04,
            drag: 0.994,
            decay: randomBetween(0.003, 0.006),
            size: randomBetween(1.2, 2),
            trailLength: 16,
            shimmer: Math.random() < 0.4,
          })
        }
      } else if (rocket.burstType === 'crossette') {
        const count = shellCount(20 + Math.floor(Math.random() * 10))
        for (let index = 0; index < count; index += 1) {
          pushSpark({
            x: rocket.x,
            y: rocket.y,
            angle: (index / count) * Math.PI * 2,
            speed: randomBetween(2.5, 4.5),
            color: mainColor,
            gravity: 0.025,
            drag: 0.988,
            decay: randomBetween(0.015, 0.025),
            size: randomBetween(2, 3),
            trailLength: 5,
            splitAt: randomBetween(0.4, 0.6),
          })
        }
      } else if (rocket.burstType === 'crackle') {
        const count = shellCount(50 + Math.floor(Math.random() * 20))
        for (let index = 0; index < count; index += 1) {
          pushSpark({
            x: rocket.x,
            y: rocket.y,
            angle: randomBetween(0, Math.PI * 2),
            speed: randomBetween(1.5, 4.5),
            color: pickShellColor(rocket.palette),
            gravity: 0.028,
            drag: 0.986,
            decay: randomBetween(0.01, 0.018),
            size: randomBetween(1.5, 3),
            trailLength: 4,
            crackle: true,
            crackleAt: randomBetween(0.3, 0.6),
          })
        }
      } else {
        const brocadePalette =
          Math.random() < 0.5 ? palettes[9] : rocket.palette
        const count = shellCount(80 + Math.floor(Math.random() * 30))
        for (let index = 0; index < count; index += 1) {
          pushSpark({
            x: rocket.x,
            y: rocket.y,
            angle: randomBetween(0, Math.PI * 2),
            speed: randomBetween(1, 4.5),
            color: pickShellColor(brocadePalette),
            gravity: 0.035,
            drag: 0.99,
            decay: randomBetween(0.004, 0.008),
            size: randomBetween(1, 1.8),
            trailLength: 8,
            shimmer: true,
          })
        }
      }
    }

    const launchRocket = (
      position = randomBetween(0.12, 0.88),
      burstType = randomItem(burstTypes),
    ) => {
      if (rockets.length >= MAX_ROCKETS) return

      const rocketPalette = randomItem(palettes)
      rockets.push({
        x: viewportWidth * position,
        y: viewportHeight + 10,
        velocityX: randomBetween(-0.6, 0.6),
        velocityY: randomBetween(-8.5, -5),
        gravity: 0.035,
        targetY: viewportHeight * randomBetween(0.1, 0.4),
        color: pickShellColor(rocketPalette),
        palette: rocketPalette,
        burstType,
        trail: [],
        size: randomBetween(2, 3),
        wobble: randomBetween(0, Math.PI * 2),
        wobbleSpeed: randomBetween(0.05, 0.13),
        wobbleAmplitude: randomBetween(0.3, 0.8),
        sparking: 0,
      })
    }

    const scheduleLaunch = (delay: number, launch: () => void) => {
      const timer = window.setTimeout(() => {
        launchTimers.delete(timer)
        if (!disposed && !document.hidden) launch()
      }, delay)

      launchTimers.add(timer)
    }

    const clearLaunchTimers = () => {
      launchTimers.forEach((timer) => window.clearTimeout(timer))
      launchTimers.clear()
    }

    const launchControlledSequence = () => {
      const pattern = Math.random()

      if (pattern < 0.3) {
        launchRocket()
      } else if (pattern < 0.6) {
        launchRocket()
        scheduleLaunch(randomBetween(200, 500), launchRocket)
      } else if (pattern < 0.85) {
        launchRocket()
        scheduleLaunch(150, launchRocket)
        scheduleLaunch(300, launchRocket)
      } else {
        launchRocket()
        scheduleLaunch(100, launchRocket)
        scheduleLaunch(200, launchRocket)
        scheduleLaunch(300, launchRocket)
        scheduleLaunch(400, launchRocket)
      }
    }

    const drawRocket = (rocket: Rocket) => {
      context.save()
      rocket.trail.forEach((point, index) => {
        const progress = (index + 1) / rocket.trail.length
        context.beginPath()
        context.arc(
          point.x,
          point.y,
          rocket.size * 0.6 * progress,
          0,
          Math.PI * 2,
        )
        context.fillStyle = rocket.color
        context.globalAlpha = progress * 0.35
        context.fill()
      })

      context.globalAlpha = 0.25
      context.beginPath()
      context.arc(rocket.x, rocket.y, rocket.size * 5, 0, Math.PI * 2)
      context.fillStyle = rocket.color
      context.fill()

      context.globalAlpha = 1
      context.beginPath()
      context.arc(rocket.x, rocket.y, rocket.size * 1.2, 0, Math.PI * 2)
      context.fillStyle = '#fff'
      context.fill()

      context.globalAlpha = 0.7
      context.beginPath()
      context.arc(rocket.x, rocket.y, rocket.size * 0.6, 0, Math.PI * 2)
      context.fillStyle = '#fff'
      context.fill()
      context.restore()
    }

    const drawSpark = (spark: Spark, time: number) => {
      const twinkle = spark.shimmer
        ? 0.6 + Math.sin(time * 0.03 + spark.twinkleOffset) * 0.4
        : 1
      const alpha = Math.max(0, spark.life * twinkle)

      context.save()
      context.fillStyle = spark.color
      spark.trail.forEach((point, index) => {
        if (index === spark.trail.length - 1) return
        const progress = (index + 1) / spark.trail.length
        const size =
          spark.size * 0.35 * progress * Math.max(0.2, spark.life)
        if (size < 0.1) return
        context.beginPath()
        context.arc(point.x, point.y, size, 0, Math.PI * 2)
        context.globalAlpha = alpha * 0.2 * progress
        context.fill()
      })

      const headSize = spark.size * Math.max(0.15, spark.life)
      context.beginPath()
      context.arc(spark.x, spark.y, headSize, 0, Math.PI * 2)
      context.globalAlpha = alpha * 0.9
      context.fill()

      if (spark.life > 0.6) {
        context.beginPath()
        context.arc(spark.x, spark.y, headSize * 0.4, 0, Math.PI * 2)
        context.fillStyle = '#fff'
        context.globalAlpha = (spark.life - 0.6) * 2
        context.fill()
      }

      context.beginPath()
      context.arc(spark.x, spark.y, headSize * 3, 0, Math.PI * 2)
      context.fillStyle = spark.color
      context.globalAlpha = alpha * 0.08
      context.fill()
      context.restore()
    }

    const drawFlash = (flash: Flash) => {
      const rgb = hexToRgb(flash.color)
      const radius = flash.radius * (1 + (1 - flash.life) * 0.5)
      const gradient = context.createRadialGradient(
        flash.x,
        flash.y,
        0,
        flash.x,
        flash.y,
        radius,
      )
      gradient.addColorStop(0, `rgba(255,255,255,${flash.life * 0.4})`)
      gradient.addColorStop(
        0.3,
        `rgba(${rgb.r},${rgb.g},${rgb.b},${flash.life * 0.25})`,
      )
      gradient.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)

      context.save()
      context.fillStyle = gradient
      context.globalAlpha = 1
      context.beginPath()
      context.arc(flash.x, flash.y, radius, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    const animate = (time: number) => {
      animationFrame = 0
      if (disposed || document.hidden) return

      const elapsed = previousTime === 0 ? 16.67 : Math.min(time - previousTime, 34)
      const frameScale = elapsed / 16.67
      previousTime = time
      context.clearRect(0, 0, viewportWidth, viewportHeight)

      if (time >= nextSequenceAt) {
        launchControlledSequence()
        nextSequenceAt += sequenceInterval
        if (nextSequenceAt <= time) nextSequenceAt = time + sequenceInterval
      }

      for (let index = flashes.length - 1; index >= 0; index -= 1) {
        const flash = flashes[index]
        flash.life -= flash.decay * frameScale
        if (flash.life <= 0) {
          flashes.splice(index, 1)
        } else {
          drawFlash(flash)
        }
      }

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index]
        rocket.wobble += rocket.wobbleSpeed * frameScale
        rocket.x +=
          (rocket.velocityX +
            Math.sin(rocket.wobble) * rocket.wobbleAmplitude) *
          frameScale
        rocket.y += rocket.velocityY * frameScale
        rocket.velocityY += rocket.gravity * frameScale

        rocket.trail.push({ x: rocket.x, y: rocket.y })
        if (rocket.trail.length > 18) rocket.trail.shift()

        rocket.sparking += frameScale
        if (rocket.sparking >= 2) {
          rocket.sparking -= 2
          pushSpark({
            x: rocket.x + randomBetween(-1.5, 1.5),
            y: rocket.y + randomBetween(0, 4),
            angle: 0,
            speed: 0,
            velocityX: randomBetween(-0.25, 0.25),
            velocityY: randomBetween(0, 1.5),
            color: Math.random() < 0.6 ? '#FFC371' : '#FFFFFF',
            gravity: 0.01,
            drag: 0.99,
            life: randomBetween(0.6, 0.9),
            decay: randomBetween(0.04, 0.07),
            size: randomBetween(0.8, 1.4),
            trailLength: 0,
            shimmer: true,
          })
        }

        drawRocket(rocket)
        if (rocket.y <= rocket.targetY || rocket.velocityY >= 0) {
          rockets.splice(index, 1)
          explode(rocket)
        }
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index]
        spark.velocityX *= Math.pow(spark.drag, frameScale)
        spark.velocityY =
          spark.velocityY * Math.pow(spark.drag, frameScale) +
          spark.gravity * frameScale
        spark.x += spark.velocityX * frameScale
        spark.y += spark.velocityY * frameScale
        spark.life -= spark.decay * frameScale

        if (
          spark.splitAt !== undefined &&
          !spark.hasSplit &&
          spark.life < spark.splitAt
        ) {
          spark.hasSplit = true
          miniExplode(spark.x, spark.y, spark.color, 6)
        }

        if (
          spark.crackle &&
          !spark.crackled &&
          spark.life < (spark.crackleAt ?? 0.3)
        ) {
          spark.crackled = true
          if (Math.random() < 0.4) {
            miniExplode(spark.x, spark.y, '#FFFFFF', 4)
          }
        }

        if (spark.life <= 0 || spark.y > viewportHeight + 20) {
          sparks.splice(index, 1)
        } else {
          if (spark.trailLength > 0) {
            spark.trail.push({ x: spark.x, y: spark.y })
            if (spark.trail.length > spark.trailLength) spark.trail.shift()
          }
          drawSpark(spark, time)
        }
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    const startAnimation = () => {
      if (disposed || document.hidden || animationFrame !== 0) return
      previousTime = 0
      animationFrame = window.requestAnimationFrame(animate)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sequenceRemaining = Math.max(
          0,
          nextSequenceAt - performance.now(),
        )
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        clearLaunchTimers()
      } else {
        nextSequenceAt = performance.now() + sequenceRemaining
        sequenceRemaining = sequenceInterval
        startAnimation()
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    scheduleLaunch(0, launchRocket)
    scheduleLaunch(400, launchRocket)
    scheduleLaunch(700, launchRocket)
    startAnimation()

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      clearLaunchTimers()
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      rockets.length = 0
      sparks.length = 0
      flashes.length = 0
      context.clearRect(0, 0, viewportWidth, viewportHeight)
    }
  }, [])

  const classes = ['celebration-canvas', 'celebration-canvas--fireworks', className]
    .filter(Boolean)
    .join(' ')

  return <canvas ref={canvasRef} aria-hidden="true" className={classes} />
}

export function Fireworks({ active = true, className }: FireworksProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (!active || prefersReducedMotion) return null

  return <FireworksCanvas className={className} />
}

export default Fireworks
