import { useMemo } from "react";
import { motion } from "framer-motion";

export default function StarField({ count = 60 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: ((i * 37) % 100) + ((i % 5) * 0.7),
        top: ((i * 53) % 100) + ((i % 7) * 0.4),
        size: (i % 3) + 1,
        delay: (i % 6) * 0.45,
        duration: 2 + (i % 5) * 0.5,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-primary/60"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
