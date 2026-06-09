declare namespace Express {
  interface Request {
    user?: {
      id: number;
      fullName: string;
    };
  }
}
