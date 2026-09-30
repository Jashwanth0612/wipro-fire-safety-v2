import { motion } from 'framer-motion'

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
