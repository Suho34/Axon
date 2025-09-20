"use client";

import { signOut } from "next-auth/react";
import { GoSignOut } from "react-icons/go";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/" })}
      className="w-5 h-5 bg-red-500 text-white rounded hover:bg-red-600"
    >
      <GoSignOut />
    </button>
  );
}
