import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AIAnswerBadge() {
  return (
    <Badge
      className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-2.5 py-1 text-xs font-semibold shadow-sm"
    >
      <Sparkles className="w-3 h-3" />
      AI Answer
    </Badge>
  );
}