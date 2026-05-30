'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import styles from './VideoIntro.module.css'

const CinematicLayer = dynamic(() => import('../CinematicLayer/CinematicLayer'), {
  ssr: false,
})

const VIDEO_SRC = '/hero.mp4'

export default function VideoIntro() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const bgVideoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLSpanElement>(null)
  const firstNameRef = useRef<HTMLDivElement>(null)
  const lastNameRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLButtonElement>(null)
  const soundHintRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)

  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showSoundHint, setShowSoundHint] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  // GSAP entrance animation
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gsap: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any

    async function runEntrance() {
      const mod = await import('gsap')
      gsap = mod.gsap ?? (mod as any).default ?? mod

      // Set initial hidden state
      const elements = [
        taglineRef.current,
        firstNameRef.current,
        lastNameRef.current,
        roleRef.current,
        scrollIndicatorRef.current,
        controlsRef.current,
      ]
      gsap.set(elements, { opacity: 0 })
      gsap.set([firstNameRef.current, lastNameRef.current], { y: 60 })
      gsap.set(taglineRef.current, { y: 20 })
      gsap.set(roleRef.current, { y: 30 })
      gsap.set(scrollIndicatorRef.current, { y: 15 })
      gsap.set(controlsRef.current, { y: -15 })

      tl = gsap.timeline({ delay: 0.6 })

      tl.to(taglineRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
      })
      .to(firstNameRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power4.out',
      }, '-=0.8')
      .to(lastNameRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power4.out',
      }, '-=1.1')
      .to(roleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
      }, '-=0.8')
      .to(scrollIndicatorRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.4')
      .to(controlsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.6')
    }

    runEntrance()
    return () => {
      if (tl) tl.kill()
    }
  }, [])

  // Auto-hide sound hint
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSoundHint(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    const v = videoRef.current
    const bg = bgVideoRef.current
    if (!v) return
    const next = !v.muted
    v.muted = next
    if (bg) bg.muted = next
    setIsMuted(next)
    if (!next) setShowSoundHint(false)
  }, [])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      bgVideoRef.current?.play()
      setIsPlaying(true)
    } else {
      v.pause()
      bgVideoRef.current?.pause()
      setIsPlaying(false)
    }
  }, [])

  // Scroll to next section
  const scrollDown = useCallback(() => {
    document.getElementById('next-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Keep bg video in sync with foreground
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    const bg = bgVideoRef.current
    if (!v || !bg) return
    if (Math.abs(v.currentTime - bg.currentTime) > 0.3) {
      bg.currentTime = v.currentTime
    }
  }, [])

  return (
    <section ref={heroRef} className={styles.hero} aria-label="Portfolio Hero">

      {/* ── Ambient blurred background video ── */}
      <div className={styles.bgVideoWrap} aria-hidden="true">
        <video
          ref={bgVideoRef}
          className={styles.bgVideo}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.bgBlur} />
      </div>

      {/* ── Gradient overlays for cinematic framing ── */}
      <div className={styles.gradientBottom} aria-hidden="true" />
      <div className={styles.gradientTop} aria-hidden="true" />
      <div className={styles.gradientLeft} aria-hidden="true" />
      <div className={styles.gradientRight} aria-hidden="true" />
      <div className={styles.gradientVignette} aria-hidden="true" />

      {/* ── Foreground video ── */}
      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          onCanPlayThrough={() => setVideoReady(true)}
          onTimeUpdate={handleTimeUpdate}
        />
        {/* Cinematic letterbox bars */}
        <div className={styles.letterboxTop} aria-hidden="true" />
        <div className={styles.letterboxBottom} aria-hidden="true" />
      </div>

      {/* ── Three.js Cinematic Particle Layer ── */}
      <CinematicLayer />

      {/* ── Film grain overlay ── */}
      <div className={styles.grain} aria-hidden="true" />

      {/* ── Top controls bar ── */}
      <div ref={controlsRef} className={styles.controls} aria-label="Video controls">
        {/* Brand mark */}
        <div className={styles.brandMark}>
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandName}>TITO</span>
        </div>

        {/* Control buttons */}
        <div className={styles.controlBtns}>
          <button
            className={styles.glassBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          <button
            className={`${styles.glassBtn} ${!isMuted ? styles.glassBtnActive : ''}`}
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <MuteIcon /> : <SoundIcon />}
          </button>
        </div>
      </div>

      {/* ── Sound hint badge ── */}
      <div
        ref={soundHintRef}
        className={`${styles.soundHint} ${showSoundHint ? styles.soundHintVisible : ''}`}
        onClick={toggleMute}
        role="button"
        aria-label="Tap for sound"
      >
        <span className={styles.soundPulse} aria-hidden="true" />
        <span className={styles.soundText}>Tap for sound</span>
      </div>

      {/* ── Main overlay content ── */}
      <div ref={contentRef} className={styles.content} aria-label="Portfolio introduction">

        {/* Tagline */}
        <span ref={taglineRef} className={styles.tagline}>
          Digital Architect &nbsp;·&nbsp; Brand Strategist &nbsp;·&nbsp; Builder
        </span>

        {/* Name stacked */}
        <div className={styles.nameBlock} aria-label="Arun Tito">
          <div ref={firstNameRef} className={styles.firstName} aria-hidden="true">
            ARUN
          </div>
          <div ref={lastNameRef} className={styles.lastName} aria-hidden="true">
            TITO
          </div>
        </div>

        {/* Role description */}
        <div ref={roleRef} className={styles.roleBlock}>
          <div className={styles.roleTitle}>
            Founder &amp; Creative Director
          </div>
          <div className={styles.roleSubtitle}>
            TITORA &nbsp;/&nbsp; SMXM &nbsp;/&nbsp; DOOB &nbsp;/&nbsp; KARADAVI
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <button
        ref={scrollIndicatorRef}
        className={styles.scrollIndicator}
        onClick={scrollDown}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} aria-hidden="true">
          <span className={styles.scrollPulse} />
        </span>
      </button>

      {/* Cinematic edge line */}
      <div className={styles.edgeLine} aria-hidden="true" />
    </section>
  )
}

// ── SVG Icons ──

function PlayIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
      <path d="M1 1L13 8L1 15V1Z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="4" height="16" rx="1.5" fill="currentColor" />
      <rect x="8" y="0" width="4" height="16" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
      <path d="M1 5H5L10 1V15L5 11H1V5Z" fill="currentColor" />
      <line x1="13" y1="5" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="5" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SoundIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
      <path d="M1 5H5L10 1V15L5 11H1V5Z" fill="currentColor" />
      <path d="M13 4C14.5 5.5 14.5 10.5 13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 2C18 4.5 18 11.5 15.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
