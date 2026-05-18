'use client';
import React from 'react';
import { Home, Bot } from 'lucide-react';
import GavelIcon from '@/components/ui/GavelIcon';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans flex items-center justify-center p-4">

      {/* Centered Error Card */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-sm border border-gray-100 p-10 md:p-14 text-center flex flex-col items-center">

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-8 text-primary select-none">
          <GavelIcon size={24} />
          <span className="font-serif text-xl font-bold tracking-tight">LexCam</span>
        </div>

        {/* 404 */}
        <h2 className="font-serif text-5xl font-bold text-primary tracking-tight mb-4 select-none">
          404
        </h2>

        {/* Message */}
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs mb-8">
          This page doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <a
            href="/"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark transition-colors text-white font-bold text-xs py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm"
          >
            <Home size={14} /> Go Home
          </a>

          <a
            href="/chat"
            className="w-full sm:w-auto border border-primary text-primary bg-white hover:bg-primary/5 font-bold text-xs py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Bot size={14} /> Ask the AI Assistant
          </a>
        </div>

      </div>
    </div>
  );
}
