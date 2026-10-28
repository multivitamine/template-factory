import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 4321),
  root,
  scoutDir: "C:/claude projects/ai overview ideas/data/scout",
  outputDir: path.join(root, "output"),
  dataDir: path.join(root, "data"),
  chromePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  // Model used by each headless Claude Code agent ("sonnet" is fast; "opus" is higher quality).
  model: process.env.AGENT_MODEL || "sonnet",
  // Models selectable on the dashboard (aliases passed to claude --model).
  models: ["sonnet", "opus", "haiku"],
  // How many agents run at the same time.
  concurrency: Number(process.env.CONCURRENCY || 10),
  // Template factory: how many templates are designed at the same time.
  factoryConcurrency: Number(process.env.FACTORY_CONCURRENCY || 5),
  // Kill an agent that takes longer than this.
  agentTimeoutMs: 20 * 60 * 1000,
  // Factory agents write large creative files with Opus: give them more room.
  factoryAgentTimeoutMs: 45 * 60 * 1000,
  // The 10 scout sites used for the simulation (keys = scout JSON file names).
  sites: [
    "brinkscoffeeroasters",
    "aiki-budo",
    "birthbear",
    "nacrasailing",
    "terpstrav2",
    "fredimare",
    "kartstoreinternational",
    "bohlt",
    "hotelnavarra",
    "droogijs365",
  ],
};
