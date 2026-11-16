import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/lumen/App";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <App />;
}
