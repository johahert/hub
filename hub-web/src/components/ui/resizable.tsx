import type * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "../../lib/utils";

export { Panel as ResizablePanel };

export function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return <Group className={cn("h-full w-full", className)} {...props} />;
}

export function ResizableHandle({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={cn(
        "group grid w-[9px] cursor-col-resize place-items-center border-x border-divider bg-neutral-200 transition-colors data-[separator=active]:bg-accent-200",
        className
      )}
      {...props}
    >
      <span className="h-8 w-0.5 rounded-full bg-neutral-400 transition-colors group-hover:bg-accent group-data-[separator=active]:bg-accent" />
    </Separator>
  );
}
