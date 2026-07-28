'use client';

import React from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';

interface TimeoutErrorStateProps {
  onRetry?: () => void;
  message?: string;
}

export const TimeoutErrorState: React.FC<TimeoutErrorStateProps> = ({
  onRetry,
  message = 'Taking a little longer than usual to fetch your dolls — hang tight 🧶',
}) => {
  return (
    <div className="bg-peach-50 border border-peach-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto my-8 shadow-xs animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl">
        <AlertCircle size={24} />
      </div>
      <div className="space-y-1">
        <h4 className="font-extrabold text-warmbrown-800 text-base">Server Delay Notice</h4>
        <p className="text-xs text-warmbrown-600 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-warmbrown-800 hover:bg-warmbrown-900 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors shadow-sm cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
