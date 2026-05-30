'use client'

import { useEffect, useRef } from 'react'
import styles from './CinematicLayer.module.css'

export default function CinematicLayer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let THREE: typeof import('three')
    let renderer: import('three').WebGLRenderer
    let scene: import('three').Scene
    let camera: import('three').PerspectiveCamera
    let particles: import('three').Points
    let particlePositions: Float32Array
    let particleSpeeds: Float32Array
    let time = 0

    const container = mountRef.current
    if (!container) return

    async function init() {
      THREE = await import('three')

      // Scene
      scene = new THREE.Scene()

      // Camera
      camera = new THREE.PerspectiveCamera(
        60,
        container!.offsetWidth / container!.offsetHeight,
        0.1,
        1000
      )
      camera.position.set(0, 0, 5)

      // Renderer — transparent overlay
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(container!.offsetWidth, container!.offsetHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      container!.appendChild(renderer.domElement)

      // Particle geometry
      const COUNT = 280
      const geometry = new THREE.BufferGeometry()
      particlePositions = new Float32Array(COUNT * 3)
      particleSpeeds = new Float32Array(COUNT * 3)
      const colors = new Float32Array(COUNT * 3)
      const sizes = new Float32Array(COUNT)

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        // Spread particles across a wide field
        particlePositions[i3]     = (Math.random() - 0.5) * 24
        particlePositions[i3 + 1] = (Math.random() - 0.5) * 14
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 10 - 2

        // Drift speeds — very slow
        particleSpeeds[i3]     = (Math.random() - 0.5) * 0.003
        particleSpeeds[i3 + 1] = (Math.random() * 0.004) + 0.001
        particleSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.002

        // Color palette: warm orange, amber, soft white, cool blue accent
        const palette = Math.random()
        if (palette < 0.45) {
          // Warm orange
          colors[i3]     = 0.91 + Math.random() * 0.09
          colors[i3 + 1] = 0.40 + Math.random() * 0.25
          colors[i3 + 2] = 0.10 + Math.random() * 0.15
        } else if (palette < 0.70) {
          // Soft white/cream
          colors[i3]     = 0.95 + Math.random() * 0.05
          colors[i3 + 1] = 0.90 + Math.random() * 0.08
          colors[i3 + 2] = 0.80 + Math.random() * 0.15
        } else if (palette < 0.85) {
          // Amber/gold
          colors[i3]     = 1.0
          colors[i3 + 1] = 0.65 + Math.random() * 0.2
          colors[i3 + 2] = 0.05 + Math.random() * 0.1
        } else {
          // Cool blue monitor glow (rare)
          colors[i3]     = 0.20 + Math.random() * 0.15
          colors[i3 + 1] = 0.55 + Math.random() * 0.20
          colors[i3 + 2] = 0.90 + Math.random() * 0.10
        }

        // Varied sizes — bokeh feel
        sizes[i] = Math.random() * 28 + 6
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      // Soft bokeh circle texture
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')!
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0,   'rgba(255,255,255,1)')
      grad.addColorStop(0.15,'rgba(255,255,255,0.85)')
      grad.addColorStop(0.40,'rgba(255,255,255,0.35)')
      grad.addColorStop(0.70,'rgba(255,255,255,0.08)')
      grad.addColorStop(1,   'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 128, 128)
      const texture = new THREE.CanvasTexture(canvas)

      // Shader material — additive blending for glow
      const material = new THREE.PointsMaterial({
        size: 0.35,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      // Start render loop
      animate()
    }

    function animate() {
      frameRef.current = requestAnimationFrame(animate)
      time += 0.008

      // Lerp mouse
      targetMouseRef.current.x += (mouseRef.current.x - targetMouseRef.current.x) * 0.035
      targetMouseRef.current.y += (mouseRef.current.y - targetMouseRef.current.y) * 0.035

      // Parallax camera drift
      camera.position.x = targetMouseRef.current.x * 0.6
      camera.position.y = -targetMouseRef.current.y * 0.4

      // Animate particle positions — sine wave drift
      const positions = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3
        positions[i3]     += particleSpeeds[i3] + Math.sin(time * 0.7 + i * 0.4) * 0.0018
        positions[i3 + 1] += particleSpeeds[i3 + 1]
        positions[i3 + 2] += Math.sin(time * 0.5 + i * 0.3) * 0.001

        // Wrap vertically — particles rise and loop
        if (positions[i3 + 1] > 8) positions[i3 + 1] = -8
        // Wrap horizontally
        if (positions[i3] > 13)  positions[i3] = -13
        if (positions[i3] < -13) positions[i3] = 13
      }
      particles.geometry.attributes.position.needsUpdate = true

      // Slow global rotation
      particles.rotation.y = Math.sin(time * 0.08) * 0.04
      particles.rotation.z = Math.cos(time * 0.06) * 0.015

      renderer.render(scene, camera)
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    function onResize() {
      if (!container) return
      camera.aspect = container.offsetWidth / container.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.offsetWidth, container.offsetHeight)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)
    init()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (renderer) {
        renderer.dispose()
        if (container && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
      if (particles) {
        particles.geometry.dispose()
        ;(particles.material as import('three').Material).dispose()
      }
    }
  }, [])

  return <div ref={mountRef} className={styles.layer} aria-hidden="true" />
}
