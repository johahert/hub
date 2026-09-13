import { AppShell as MantineAppShell, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
}

export function AppShell({ left, middle, right }: Props) {
  return (
    <MantineAppShell
      navbar={{ width: 300, breakpoint: "sm" }}
      aside={{ width: 380, breakpoint: "sm" }}
      padding={0}
      header={{ height: 44 }}
    >
      <MantineAppShell.Header
        px="md"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Text fw={600}>Hub</Text>
      </MantineAppShell.Header>
      <MantineAppShell.Navbar p="xs">{left}</MantineAppShell.Navbar>
      <MantineAppShell.Main>{middle}</MantineAppShell.Main>
      <MantineAppShell.Aside p="md">{right}</MantineAppShell.Aside>
    </MantineAppShell>
  );
}
