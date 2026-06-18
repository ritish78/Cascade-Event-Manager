import type { ReactNode } from "react";

interface ToggleButtonProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  shape?: "rounded" | "pill";
}

const ToggleButton = ({ children, active, onClick, shape = "rounded" }: ToggleButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-1.5 text-sm border transition cursor-pointer ${
      shape === "pill" ? "rounded-full" : "rounded-xl"
    } ${
      active
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-slate-700 text-slate-300 hover:border-slate-500"
    }`}
  >
    {children}
  </button>
);

export default ToggleButton;
