import React, { ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GameProvider } from "./lib/GameContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);

function Providers(props: { children: ReactNode }) {
  return <GameProvider>{props.children}</GameProvider>;
}
