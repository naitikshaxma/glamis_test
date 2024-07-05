import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ThemeProvider } from "@material-tailwind/react";
import SidebarProvider from "./hooks/SideBarContextHook";
import { RecoilRoot } from "recoil";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider>
        <RecoilRoot>
        <App />
        </RecoilRoot>
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>
);