"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.UrHw-g-mApsi_h8UBW9DUgHaEK%3Fpid%3DApi&f=1&ipt=cc3c250915d1b61aaad814aad7672f8a7d038457c42c8948b883f53496da2d5c&ipo=images"
            alt="RiVirtual CRM"
            width={180}
            height={100}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome to <span className="text-rivGreen">RiVirtual CRM</span>
        </h1>

        {/* If logged out */}
        {!user && (
          <>
            <p className="mt-3 text-gray-600">
              Please login to access your CRM dashboard.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-5 px-6 py-2 bg-rivGreen text-white rounded-md hover:bg-rivGreenDark transition"
            >
              Login
            </button>
          </>
        )}

        {/* If logged in */}
        {user && (
          <div className="mt-4 space-y-3">
            <p className="text-gray-700">
              Welcome back, <span className="font-medium">{user.name}</span> 👋
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/leads")}
                className="px-5 py-2 bg-rivGreen text-white rounded-md hover:bg-rivGreenDark transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={logout}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
