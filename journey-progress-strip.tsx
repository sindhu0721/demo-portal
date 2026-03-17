import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type JourneyStep = {
  label: string;
  status: "complete" | "current" | "locked";
};

export function JourneyProgressStrip({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex min-w-max items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-sm",
                step.status === "complete" && "bg-accent/10 text-accent",
                step.status === "current" && "bg-primary/10 text-primary",
                step.status === "locked" && "bg-slate-100 text-slate-500"
              )}
            >
              {step.status === "complete" ? <CheckCircle2 className="h-4 w-4" /> : null}
              {step.status === "locked" ? <Lock className="h-4 w-4" /> : null}
              <span>{step.label}</span>
            </div>
            {index < steps.length - 1 ? <div className="h-px w-6 bg-slate-200" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
