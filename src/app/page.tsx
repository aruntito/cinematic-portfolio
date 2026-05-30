'use client'

import VideoIntro from '@/components/VideoIntro/VideoIntro'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <VideoIntro />

      {/* Next Section — scroll target */}
      <section id="next-section" className={styles.nextSection}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>Selected Work</span>
          <h2 className={styles.sectionTitle}>
            Crafting digital<br />
            <em>experiences</em> that last.
          </h2>
          <p className={styles.sectionBody}>
            From brand systems to SaaS infrastructure — every pixel,<br />
            every decision, every line of code serves a singular purpose.
          </p>
        </div>
      </section>
    </main>
  )
}
