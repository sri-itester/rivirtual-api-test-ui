"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Welcome back!");
      router.push("/leads");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.UrHw-g-mApsi_h8UBW9DUgHaEK%3Fpid%3DApi&f=1&ipt=cc3c250915d1b61aaad814aad7672f8a7d038457c42c8948b883f53496da2d5c&ipo=images"
            alt="RiVirtual Logo"
            width={120}
            height={60}
            className="rounded-md"
          />
        </div>

        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Welcome to RiVirtual CRM
        </h1>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 text-left"
          autoComplete="off"
        >
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rivGreen"
              placeholder="you@rivirtual.com"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rivGreen"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-rivGreen hover:bg-rivGreenDark text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} RiVirtual CRM — All Rights Reserved
        </p>
      </div>
    </div>
  );
}
