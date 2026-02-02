import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroBackground}></div>
      <div className="container">
        <img 
          src="./img/logo.png" 
          alt={siteConfig.title} 
          className={styles.heroLogo}
        />
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/quick-setup"
            style={{marginLeft: '1rem'}}>
            Quick Setup
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'FFT Wave Simulation',
    description: (
      <>
        Realistic ocean waves powered by Fast Fourier Transform algorithms 
        running in Burst-compiled jobs. Configurable Phillips spectrum with 
        wind-driven wave generation.
      </>
    ),
  },
  {
    title: 'VR Optimized',
    description: (
      <>
        Built for Meta Quest 3 and PC VR. Single-pass stereo rendering, 
        mobile shader variants, and configurable quality presets to hit 
        your frame rate targets.
      </>
    ),
  },
  {
    title: 'Complete Buoyancy System',
    description: (
      <>
        Three buoyancy components for different use cases. Physics-based 
        floating with Burst-compiled water queries. CPU-accessible 
        displacement data for custom effects.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Documentation"
      description="VROcean - High-performance FFT ocean simulation for Unity VR. Optimized for Quest 3 and PC VR platforms.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
