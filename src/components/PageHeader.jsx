import { motion } from 'framer-motion'

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow && <p className="label mb-2 !text-accent">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      {action}
    </motion.header>
  )
}
