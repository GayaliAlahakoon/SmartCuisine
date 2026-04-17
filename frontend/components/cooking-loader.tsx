"use client";

import { ChefHat, Flame } from "lucide-react";

export function CookingLoader() {
  return (
    <div className="flex items-center justify-center py-20 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Cooking pot animation */}
        <div className="relative">
          {/* Pot */}
          <div className="w-32 h-24 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-3xl border-4 border-gray-800 relative overflow-hidden">
            {/* Bubbling liquid */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-primary/20 animate-bubble" />

            {/* Steam bubbles */}
            <div className="absolute top-2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-steam-1" />
            <div className="absolute top-4 left-1/2 w-2 h-2 bg-white/30 rounded-full animate-steam-2" />
            <div className="absolute top-3 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-steam-3" />
          </div>

          {/* Pot lid */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-t-full border-4 border-gray-800 animate-lid-bounce">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-700 rounded-full" />
          </div>

          {/* Steam rising */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="text-4xl animate-steam-rise-1 opacity-60">💨</div>
            <div className="text-4xl animate-steam-rise-2 opacity-60">💨</div>
            <div className="text-4xl animate-steam-rise-3 opacity-60">💨</div>
          </div>

          {/* Flames */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
            <Flame className="w-6 h-6 text-orange-500 animate-flame-1" />
            <Flame className="w-8 h-8 text-orange-600 animate-flame-2" />
            <Flame className="w-6 h-6 text-orange-500 animate-flame-3" />
          </div>
        </div>

        {/* Chef hat icon */}
        <div className="flex items-center gap-3 mt-8">
          <ChefHat className="w-8 h-8 text-primary animate-bounce" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground animate-pulse">
              Getting Cooked...
            </p>
            <p className="text-sm text-foreground-muted mt-1">
              Preparing your delicious recipes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
