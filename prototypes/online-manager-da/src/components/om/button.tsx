import { forwardRef, type ButtonHTMLAttributes } from "react"

/** Unstyled design-system control: reference components own exact visual states. */
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(props, ref) { return <button {...props} ref={ref} /> })
