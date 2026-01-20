import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <span className={styles.logo}>🌱</span>
            <h1 className={styles.title}>Idea Garden</h1>
          </div>

          <p className={styles.tagline}>
            Plant your ideas as seeds. Water them with thoughts.<br />
            Harvest when they bloom.
          </p>

          <div className={styles.cta}>
            <Link href="/garden" className="btn btn--primary btn--lg">
              Start Planting
              <span className={styles.ctaEmoji}>🌿</span>
            </Link>
            <button className="btn btn--lg">
              Learn More
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className={styles.heroDecor}>
          <div className={`${styles.floatingEmoji} ${styles.emoji1}`}>🌸</div>
          <div className={`${styles.floatingEmoji} ${styles.emoji2}`}>🌻</div>
          <div className={`${styles.floatingEmoji} ${styles.emoji3}`}>🌷</div>
          <div className={`${styles.floatingEmoji} ${styles.emoji4}`}>💧</div>
          <div className={`${styles.floatingEmoji} ${styles.emoji5}`}>✨</div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>

        <div className={styles.steps}>
          <div className={`glass-card ${styles.step}`}>
            <div className={styles.stepIcon}>🌱</div>
            <h3 className={styles.stepTitle}>Plant</h3>
            <p className={styles.stepDesc}>
              Capture any thought as a seed. Raw, unpolished, just as it comes to you.
            </p>
            <span className="badge badge--seed">0 waterings</span>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={`glass-card ${styles.step}`}>
            <div className={styles.stepIcon}>💧</div>
            <h3 className={styles.stepTitle}>Water</h3>
            <p className={styles.stepDesc}>
              Add new thoughts, connections, and insights. Watch your seed grow.
            </p>
            <span className="badge">2-4 waterings</span>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={`glass-card ${styles.step} ${styles.stepHighlight}`}>
            <div className={styles.stepIcon}>🌾</div>
            <h3 className={styles.stepTitle}>Harvest</h3>
            <p className={styles.stepDesc}>
              Your idea is mature! Transform it into action, a project, or share it.
            </p>
            <span className="badge badge--harvest">5+ waterings</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Idea Garden?</h2>

        <div className={styles.featureGrid}>
          <div className={`glass-card ${styles.feature}`}>
            <span className={styles.featureIcon}>🧠</span>
            <h4>Organic Growth</h4>
            <p>Ideas need time. Our system encourages nurturing, not rushing.</p>
          </div>

          <div className={`glass-card ${styles.feature}`}>
            <span className={styles.featureIcon}>🎮</span>
            <h4>Gamified Progress</h4>
            <p>Earn XP, unlock badges, and maintain daily streaks.</p>
          </div>

          <div className={`glass-card ${styles.feature}`}>
            <span className={styles.featureIcon}>🔗</span>
            <h4>Smart Connections</h4>
            <p>Automatically find similar seeds and merge related ideas.</p>
          </div>

          <div className={`glass-card ${styles.feature}`}>
            <span className={styles.featureIcon}>📱</span>
            <h4>Telegram Bot</h4>
            <p>Capture ideas instantly from your favorite messaging app.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={`glass-card ${styles.statsCard}`}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>5+</span>
            <span className={styles.statLabel}>Waterings to Harvest</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>∞</span>
            <span className={styles.statLabel}>Ideas You Can Plant</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>🏆</span>
            <span className={styles.statLabel}>Badges to Unlock</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className="text-muted text-sm">
          Built with 💚 for thinkers, dreamers, and doers
        </p>
        <p className="text-muted text-sm mt-2">
          © 2026 Idea Garden
        </p>
      </footer>
    </div>
  );
}
