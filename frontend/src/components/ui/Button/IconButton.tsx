import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

//this button is for small buttons which we can different icons or letters
//currently, we are passing x in InviteModal as children.
const IconButton = ({ children, className = "", ...rest }: IconButtonProps) => (
  <button
    className={`text-slate-400 hover:text-slate-100 transition text-xl cursor-pointer ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default IconButton;
