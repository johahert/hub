import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme, type MantineColorsTuple } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import App from "./App.tsx";

const myColor: MantineColorsTuple = [
  '#f1f1ff',
  '#e0dff2',
  '#bfbdde',
  '#9b98ca',
  '#7d79b9',
  '#6a66af',
  '#605cac',
  '#504c97',
  '#464388',
  '#3b3979'
];

const myTheme = createTheme({
  colors: {
    myColor,
  },
  primaryColor: 'myColor',
}); 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={myTheme} defaultColorScheme="dark">
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
