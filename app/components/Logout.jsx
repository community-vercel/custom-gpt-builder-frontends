"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition duration-200 ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700 cursor-pointer"
      } text-white font-medium shadow-md`}
    >
      <FaSignOutAlt className="text-lg" />
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}