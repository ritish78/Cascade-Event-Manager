import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginFormSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? "Something went wrong! Please try again!");
      } else {
        setError("Could not communicate with the backend! Please try again!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm border rounded-lg p-8 shadow-sm">
        <h1 className="font-bold mb-6">Login</h1>
        {error && <p className="text-sm text-red-300 mb-4">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleLoginFormSubmit}>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-1"
              placeholder="rajeshhamal@email.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-1"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 text-white rounded py-2 px-4 hover:bg-emerald-800 hover:cursor-pointer"
          >
            {isLoading ? "Logging in!" : "Log in!"}
          </button>
        </form>

        <p className="text-sm text-center py-4">
          New here?{" "}
          <a href="/register" className="underline hover:no-underline">
            Create an account here!
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
