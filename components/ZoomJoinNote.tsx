import { Info } from "lucide-react";
import { ZOOM_SIGN_IN_NOTE } from "@/utils/classJoinNotice";

export default function ZoomJoinNote({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ${className}`}>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{ZOOM_SIGN_IN_NOTE}</span>
      </div>
    </div>
  );
}
