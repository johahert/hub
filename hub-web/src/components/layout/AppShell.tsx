import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { useDefaultLayout } from "react-resizable-panels";
import { useTheme } from "../../hooks/use-theme";
import { Button } from "../ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";

interface Props {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
}

export function AppShell({ left, middle, right }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: "hub-panes" });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text">
      <header className="flex h-11 flex-none items-center justify-between border-b border-divider px-4">
        <span className="font-heading text-base">Hub</span>
        <Button variant="secondary" size="icon" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun size={16} strokeWidth={2.75} /> : <Moon size={16} strokeWidth={2.75} />}
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <nav className="scroll-pane w-[300px] flex-none overflow-y-auto border-r border-divider bg-neutral-200 p-2.5">
          {left}
        </nav>
        <ResizablePanelGroup
          orientation="horizontal"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
          className="flex-1"
        >
          <ResizablePanel id="board" defaultSize="64" minSize="35" className="flex min-h-0 flex-col">
            {middle}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="detail" defaultSize="36" minSize="20" maxSize="55" className="scroll-pane p-4">
            {right}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
