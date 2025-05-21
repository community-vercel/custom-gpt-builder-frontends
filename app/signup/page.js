"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please login.");
        router.push("/login");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      alert("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Account</h1>

        <div className="space-y-4">
          <div className="relative">
            <FaUser className="absolute top-3.5 left-3 text-blue-500" />
            <input
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="Full Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3 text-blue-500" />
            <input
              type="email"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-blue-500" />
            <input
              type="password"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-medium flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}