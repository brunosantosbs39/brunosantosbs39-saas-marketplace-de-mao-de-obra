"use client";

import { MapPin } from "lucide-react";
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-[#d4e9e2] text-[#111111] shadow-[inset_0_0_0_1px_rgba(17,23,19,.12)]">
        <MapPin className="size-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <div className="leading-none">
          <strong className="block text-[15px] font-black tracking-[-0.03em] text-[#111111]">MÃO LOCAL</strong>
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#78807a]">perto. rápido. seguro.</span>
        </div>
      )}
    </div>
  );
}
