import { createRng } from "@fmo/engine";

const rng = createRng(2026);

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-100">
      <h1 className="text-3xl font-semibold">FIFA Manager Online</h1>
      <p className="text-zinc-400">
        Moteur branché — tirage déterministe : {rng.int(0, 5)} - {rng.int(0, 5)}
      </p>
    </main>
  );
}

export default App;
