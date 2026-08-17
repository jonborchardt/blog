import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Post-local React island: the smallest thing that genuinely needs client-side state. */
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="not-prose flex items-center gap-3 rounded-md border p-4" data-testid="island">
      <Button type="button" onClick={() => setCount((c) => c + 1)}>
        Clicked {count} {count === 1 ? "time" : "times"}
      </Button>
      <span className="text-muted-foreground text-sm">Hydrated React island</span>
    </div>
  );
}
