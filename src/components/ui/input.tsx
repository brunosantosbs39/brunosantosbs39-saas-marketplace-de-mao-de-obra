import { forwardRef } from "react";
import { cn } from "@/lib/cn";
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {return <input {...props} ref={ref} className={cn("min-h-11 w-full rounded-ds border border-hairline bg-canvas px-3 text-ink placeholder:text-ink-muted",props.className)}/>;});
