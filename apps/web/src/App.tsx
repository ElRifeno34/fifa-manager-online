import { createRng } from "@fmo/engine";
import { RevealGroup, RevealItem } from "./components/Reveal";

const rng = createRng(2026);

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <RevealGroup className="flex flex-col items-center gap-2">
        <RevealItem>
          <h1 className="text-3xl font-semibold">FIFA Manager Online</h1>
        </RevealItem>
        <RevealItem>
          <p className="text-zinc-400">
            Moteur branché — tirage déterministe : {rng.int(0, 5)} - {rng.int(0, 5)}
          </p>
        </RevealItem>
      </RevealGroup>
    </main>
  );
}

export default App;
