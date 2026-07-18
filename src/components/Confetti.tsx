import { useEffect, useRef, useState } from 'react'

interface ConfettiProps {
  active?: boolean
  className?: string
}

type ConfettiShape = 'circle' | 'rect' | 'star' | 'strip'

interface ConfettiParticle {
  x: number
  y: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  gravity: number
  drag: number
  rotation: number
  rotationVelocity: number
  wobble: number
  wobbleVelocity: number
  wobbleAmplitude: number
  tilt: number
  tiltVelocity: number
  flip: number
  flipVelocity: number
  opacity: number
  color: string
  shape: ConfettiShape
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const MAX_PARTICLES = 85
const SOFT_PARTICLE_CAP = 70
const INITIAL_PARTICLES = 40
const BURST_INTERVAL = 8_000
const palette = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFC371',
  '#A29BFE',
  '#2ED573',
  '#FF85A2',
  '#FDCB6E',
  '#6C5CE7',
  '#00B894',
  '#FD79A8',
  '#E17055',
  '#74B9FF',
  '#FFEAA7',
  '#FF9FF3',
]
const shapes: ConfettiShape[] = ['rect', 'circle', 'strip', 'star']

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

function ConfettiCanvas({ className = '' }: Pick<ConfettiProps, 'className'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof CanvasRenderingContext2D === 'undefined') return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    const particles: ConfettiParticle[] = []
    let viewportWidth = 1
    let viewportHeight = 1
    let pixelRatio = 1
    let animationFrame = 0
    let previousTime = 0
    let nextBurstAt = performance.now() + BURST_INTERVAL
    let burstRemaining = BURST_INTERVAL
    let disposed = false

    const resizeCanvas = () => {
      const previousWidth = viewportWidth
      const bounds = canvas.getBoundingClientRect()
      viewportWidth = Math.max(bounds.width, 1)
      viewportHeight = Math.max(bounds.height, 1)
      pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2)

      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      if (previousWidth > 1 && previousWidth !== viewportWidth) {
        const horizontalScale = viewportWidth / previousWidth
        particles.forEach((particle) => {
          particle.x *= horizontalScale
        })
      }
    }

    const createParticle = (fromBurst = false): ConfettiParticle => {
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const size =
        shape === 'strip' ? randomBetween(3, 7) : randomBetween(5, 12)

      return {
        x: fromBurst
          ? viewportWidth * 0.5 + randomBetween(-0.3, 0.3) * viewportWidth
          : Math.random() * viewportWidth,
        y: fromBurst ? -20 : randomBetween(-120, -20),
        width: shape === 'strip' ? size * 0.4 : size,
        height:
          shape === 'strip' ? size * 3 : shape === 'rect' ? size * 0.6 : size,
        velocityX: randomBetween(
          fromBurst ? -1.25 : -0.4,
          fromBurst ? 1.25 : 0.4,
        ),
        velocityY: randomBetween(0.4, 1.2),
        gravity: randomBetween(0.006, 0.016),
        drag: randomBetween(0.993, 0.998),
        rotation: randomBetween(0, Math.PI * 2),
        rotationVelocity: randomBetween(-1.5, 1.5) * (Math.PI / 180),
        wobble: randomBetween(0, Math.PI * 2),
        wobbleVelocity: randomBetween(0.008, 0.023),
        wobbleAmplitude: randomBetween(0.8, 2.8),
        tilt: randomBetween(0, Math.PI * 2),
        tiltVelocity: randomBetween(0.01, 0.03),
        flip: randomBetween(0, Math.PI * 2),
        flipVelocity: randomBetween(0.3, 1.3),
        opacity: randomBetween(0.75, 0.95),
        color: palette[Math.floor(Math.random() * palette.length)],
        shape,
      }
    }

    const addParticles = (count: number, fromBurst = false) => {
      const availableSlots = Math.max(MAX_PARTICLES - particles.length, 0)
      const particleCount = Math.min(count, availableSlots)

      for (let index = 0; index < particleCount; index += 1) {
        particles.push(createParticle(fromBurst))
      }
    }

    const drawStar = (radius: number) => {
      let rotation = (Math.PI / 2) * 3
      const step = Math.PI / 5
      context.beginPath()
      context.moveTo(0, -radius)
      for (let point = 0; point < 5; point += 1) {
        context.lineTo(
          Math.cos(rotation) * radius,
          Math.sin(rotation) * radius,
        )
        rotation += step
        context.lineTo(
          Math.cos(rotation) * radius * 0.5,
          Math.sin(rotation) * radius * 0.5,
        )
        rotation += step
      }
      context.closePath()
    }

    const drawParticle = (particle: ConfettiParticle) => {
      const fadeStart = viewportHeight * 0.8
      const opacity =
        particle.y <= fadeStart
          ? particle.opacity
          : particle.opacity *
            Math.max(
              0,
              1 -
                (particle.y - fadeStart) /
                  Math.max(viewportHeight - fadeStart, 1),
            )

      context.save()
      context.globalAlpha = opacity
      context.fillStyle = particle.color
      context.translate(particle.x, particle.y)
      context.rotate(particle.rotation)
      context.scale(Math.cos(particle.flip), Math.cos(particle.tilt))

      if (particle.shape === 'circle') {
        context.beginPath()
        context.arc(0, 0, particle.width / 2, 0, Math.PI * 2)
        context.fill()
      } else if (particle.shape === 'star') {
        drawStar(particle.width / 2)
        context.fill()
      } else {
        context.fillRect(
          -particle.width / 2,
          -particle.height / 2,
          particle.width,
          particle.height,
        )
      }

      context.restore()
    }

    const animate = (time: number) => {
      animationFrame = 0
      if (disposed || document.hidden) return

      const elapsed = previousTime === 0 ? 16.67 : Math.min(time - previousTime, 34)
      const frameScale = elapsed / 16.67
      previousTime = time

      context.clearRect(0, 0, viewportWidth, viewportHeight)

      const spawnProbability = 1 - Math.pow(1 - 0.12, frameScale)
      if (
        particles.length < SOFT_PARTICLE_CAP &&
        Math.random() < spawnProbability
      ) {
        particles.push(createParticle())
      }

      if (time >= nextBurstAt) {
        addParticles(15, true)
        nextBurstAt = time + BURST_INTERVAL
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.velocityX *= Math.pow(particle.drag, frameScale)
        particle.velocityY += particle.gravity * frameScale
        particle.x +=
          (particle.velocityX +
            Math.sin(particle.wobble) * particle.wobbleAmplitude) *
          frameScale
        particle.y += particle.velocityY * frameScale
        particle.rotation += particle.rotationVelocity * frameScale
        particle.wobble += particle.wobbleVelocity * frameScale
        particle.tilt += particle.tiltVelocity * frameScale
        particle.flip += particle.flipVelocity * 0.05 * frameScale

        if (particle.y >= viewportHeight) {
          particles.splice(index, 1)
        } else {
          drawParticle(particle)
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
        burstRemaining = Math.max(0, nextBurstAt - performance.now())
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
      } else {
        nextBurstAt = performance.now() + burstRemaining
        burstRemaining = BURST_INTERVAL
        startAnimation()
      }
    }

    resizeCanvas()
    addParticles(INITIAL_PARTICLES, true)
    window.addEventListener('resize', resizeCanvas)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startAnimation()

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      particles.length = 0
      context.clearRect(0, 0, viewportWidth, viewportHeight)
    }
  }, [])

  const classes = ['celebration-canvas', 'celebration-canvas--confetti', className]
    .filter(Boolean)
    .join(' ')

  return <canvas ref={canvasRef} aria-hidden="true" className={classes} />
}

export function Confetti({ active = true, className }: ConfettiProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (!active || prefersReducedMotion) return null

  return <ConfettiCanvas className={className} />
}

export default Confetti
