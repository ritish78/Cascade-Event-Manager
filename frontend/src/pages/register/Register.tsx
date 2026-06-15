import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password.trim() !== confirmPassword.trim();

  const handleRegsiterFormSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.trim() !== confirmPassword.trim()) {
      setError("Passwords don't match!");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await register(fullName, email, password, confirmPassword);
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
        <h1 className="font-bold mb-6">Register with us</h1>
        {error && <p className="text-sm text-red-300 mb-4">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleRegsiterFormSubmit}>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Full Name:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border rounded px-1"
              placeholder="Rajesh Hamal"
              required
            />
          </div>
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
          <div className="flex flex-col gap-1">
            <label className="font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded px-1"
              placeholder="********"
              required
            />
            {passwordMismatch && <p className="text-xs text-red-300">Mismatch password!</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 text-white rounded py-2 px-4 hover:bg-emerald-800 hover:cursor-pointer"
          >
            {isLoading ? "Regsitering!" : "Regsiter!"}
          </button>
        </form>

        <p className="text-sm text-center py-4">
          Already have an account?{" "}
          <a href="/login" className="underline hover:no-underline">
            Login here!
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
