import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

interface Props {
  children: ReactNode;
  className?: string;
}

/** Container that reveals its <RevealItem> children one after another. */
export function RevealGroup({ children, className }: Props) {
  return (
    <motion.div className={className} variants={groupVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

/** A section that fades and slides up slightly when its group appears. */
export function RevealItem({ children, className }: Props) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
