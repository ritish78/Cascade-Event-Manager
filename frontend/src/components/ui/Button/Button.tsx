import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "danger" | "disabled";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-emerald-600 hover:bg-emerald-700 text-slate-50",
  danger: "border border-red-500 hover:bg-red-500/10 text-red-400",
  disabled: "border border-emerald-600 text-emerald-400 opacity-60 cursor-not-allowed",
};

const Button = ({
  variant = "primary",
  fullWidth = true,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) => {
  const base = "rounded-xl py-3 font-medium transition cursor-pointer";
  const widthClass = fullWidth ? "w-full" : "flex-1";
  const disabledClass = disabled ? "disabled:opacity-50 disabled:cursor-not-allowed" : "";

  return (
    <button
      disabled={disabled}
      className={`${base} ${widthClass} ${variantStyles[variant]} ${disabledClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
