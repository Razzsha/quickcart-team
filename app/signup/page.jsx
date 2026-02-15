'use client'

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI only - no backend logic
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 md:px-16 lg:px-32 py-16">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image
              className="w-28 md:w-32"
              src={assets.logo}
              alt="logo"
            />
          </div>
          <p className="text-2xl md:text-3xl text-gray-500 text-center mb-2">
            Create <span className="font-medium text-orange-600">account</span>
          </p>
          <p className="text-sm text-gray-500/80 text-center mb-8">
            Sign up to get started with QuickCart
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="px-3 py-3 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
            <input
              className="px-3 py-3 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <input
              className="px-3 py-3 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <input
              className="px-3 py-3 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 hover:bg-orange-700 transition uppercase font-medium"
            >
              Sign up
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-orange-600 font-medium hover:text-orange-700 transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp;
