import { createContext } from "react";
import { type AuthContextType } from "../types/user.types";

export const AuthContext = createContext<AuthContextType | null>(null);
