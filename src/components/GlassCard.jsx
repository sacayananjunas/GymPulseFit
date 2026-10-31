import { motion } from 'framer-motion'

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
}

export default function GlassCard({ children, className = '', hover = true, index = 0, as = 'div', ...rest }) {
  const Comp = motion[as]
  return (
    <Comp
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      whileHover={hover ? { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } } : undefined}
      className={`glass relative overflow-hidden p-5 transition-shadow duration-300 sm:p-6 ${hover ? 'hover:shadow-glow' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  )
}
