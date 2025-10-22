import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

const baseClass = "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg";

function withTitle(icon: React.ReactNode, text: string) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export const epicToast = {
  success(message: string, description?: string) {
    toast({
      title: withTitle(<CheckCircle2 className="h-5 w-5" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },

  error(message: string, description?: string) {
    toast({
      title: withTitle(<XCircle className="h-5 w-5" />, message),
      description,
      className: "bg-red-600 border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  },

  info(message: string, description?: string) {
    toast({
      title: withTitle(<Info className="h-5 w-5" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },

  warning(message: string, description?: string) {
    toast({
      title: withTitle(<AlertCircle className="h-5 w-5" />, message),
      description,
      className: "bg-yellow-600 border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  },
};