import { useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import type { InviteModalProps } from "../../types/event.types";

export const InviteModal = ({ eventId, onClose }: InviteModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await api.post(`/events/${eventId}/invite`, { email });
      setSuccess(res.data.message);
      setEmail("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Could not invite user!");
      } else {
        setError("Could not communicate with the backend. Please try again!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Invite Member</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition text-xl cursor-pointer"
          >
            X
          </button>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="keanureeves@email.com"
              required
              className="border rounded px-1 py-1.5"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 border border-red-400 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && (
            <p className="text-sm text-emerald-400 border border-emerald-400 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Inviting!" : "Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
};
