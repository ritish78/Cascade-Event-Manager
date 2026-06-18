import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const PaginationButton = ({ children, disabled, ...rest }: PaginationButtonProps) => (
  <button
    disabled={disabled}
    className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
    {...rest}
  >
    {children}
  </button>
);

export default PaginationButton;
