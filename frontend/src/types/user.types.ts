export interface User {
  id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  //in the line below for login, we are saying that it returns a Promise of type void
  //even though the server returns a message and user info. The function sets users
  //using setUser internally as a side effect and so it does not need to return the
  //user to the caller. The caller just awaits and it reads user from the context
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
}
