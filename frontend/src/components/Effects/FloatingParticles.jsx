import { useMemo } from 'react';
import clsx from 'clsx';
import styles from './FloatingParticles.module.css';

const PARTICLE_COUNT = 140;

/**
 * Generate a random number between the provided bounds.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number}
 */
const randomInRange = (min, max) => Math.random() * (max - min) + min;

/**
 * Build a deterministic-by-render set of particle configuration objects.
 * @returns {Array<object>}
 */
const createParticles = () => {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const size = randomInRange(2, 10);
    const floatDuration = randomInRange(24, 42);
    const floatDelay = randomInRange(0, 30);
    const drift = randomInRange(-18, 18);
    const startOffset = randomInRange(0, 30);
    const fadeDuration = randomInRange(2.5, 5);
    const scaleDuration = randomInRange(3.5, 7);
    const fadeDelay = randomInRange(0, 4);
    const scaleDelay = randomInRange(0, 4);
    const blur = Math.random() > 0.7 ? randomInRange(1, 3) : 0;

    return {
      id: `particle-${index}`,
      size,
      floatDuration,
      floatDelay,
      drift,
      startOffset,
      fadeDuration,
      scaleDuration,
      fadeDelay,
      scaleDelay,
      blur,
      left: randomInRange(0, 100),
    };
  });
};

/**
 * Render floating particle circles that animate upward behind page content.
 * @param {object} props
 * @param {string} [props.className] - Optional extra classes for container positioning.
 * @returns {JSX.Element}
 */
const FloatingParticles = ({ className }) => {
  const particles = useMemo(() => createParticles(), []);

  return (
    <div className={clsx(styles.container, className)} aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={styles.particle}
          style={{
            '--float-duration': `${particle.floatDuration}s`,
            '--float-delay': `${particle.floatDelay}s`,
            '--drift-x': `${particle.drift}vw`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `calc(100% + ${particle.startOffset}vh)`,
          }}
        >
          <span
            className={styles.circle}
            style={{
              '--fade-duration': `${particle.fadeDuration}s`,
              '--scale-duration': `${particle.scaleDuration}s`,
              '--fade-delay': `${particle.fadeDelay}s`,
              '--scale-delay': `${particle.scaleDelay}s`,
              filter: particle.blur ? `blur(${particle.blur}px)` : undefined,
            }}
          />
        </span>
      ))}
    </div>
  );
};

export default FloatingParticles;

