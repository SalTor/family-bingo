import { GameProvider } from "./lib/GameContext.tsx";

export default Providers;

function Providers(props: { children: React.ReactNode }) {
  return <GameProvider>{props.children}</GameProvider>;
}
