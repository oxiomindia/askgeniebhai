import * as React from "react";
import { cn } from "@/lib/utils";

// A plain native <select>, styled to match Input. shadcn's own Select
// primitive wraps @radix-ui/react-select, which isn't a project dependency
// yet (see Build 007/008 on why the CLI itself is unreachable here) — for
// the handful of plain dropdowns this build needs, a native element is
// simpler and just as accessible, so it isn't worth adding the dependency.
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
