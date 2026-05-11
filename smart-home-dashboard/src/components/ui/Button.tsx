import { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon; 
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  icon: Icon,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base = "flex items-center justify-center gap-2 font-medium rounded-2xl transition-all active:scale-[0.97]";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: "bg-sky-600 hover:bg-sky-500 text-white shadow-sm",
    secondary: "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100",
    ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}