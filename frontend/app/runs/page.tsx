import type { Metadata } from "next";
import RunsClient from "./RunsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Run Viewer - Analyze Your Runs | Spire Codex",
  description:
    "Paste your Slay the Spire 2 run history JSON to view detailed run breakdowns — deck evolution, card choices, floor-by-floor stats, and more.",
};

export default function RunsPage() {
  return <RunsClient />;
}
