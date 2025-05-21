"use client";
import { signIn } from "next-auth/react";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      alert(res?.error || "Invalid email or password");
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await signIn("google", { callbackUrl: "/dashboard" });
      console.log(res);
      if (res?.error) {
        alert(res.error);
      }
    } catch (error) {
      alert("Failed to login with Google");
    }
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md animate-fade-in-up transform transition-all duration-500">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-wide animate-fade-in">
          👋 Welcome Back!
        </h1>

        <div className="space-y-5">
          <div className="relative group">
            <FaEnvelope className="absolute top-3.5 left-3 text-blue-500 group-focus-within:text-blue-700 transition" />
            <input
              type="email"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute top-3.5 left-3 text-blue-500 group-focus-within:text-blue-700 transition" />
            <input
              type="password"
              className="border border-gray-300 pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              "Login"
            )}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-3 shadow transition-all duration-300 disabled:opacity-70"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500"></div>
            ) : (
              <>
                <FaGoogle className="text-red-500 text-lg" />
                Continue with Google
              </>
            )}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6 animate-fade-in">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 font-semibold hover:underline transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );}