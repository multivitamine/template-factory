import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const scoutDir = process.env.SCOUT_DIR || "C:/claude/ideas-app-8-16/data/scout";

// Every reachable site in the scout folder that has a URL (keys = file names). Read once at startup.
function scoutSites(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).filter((f) => {
      const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      return s.reachable !== false && /^https?:\/\//.test((s.evidence?.[0] || "").split(" ")[0]);
    }).map((f) => f.replace(/\.json$/, "")).sort();
  } catch {
    return [];
  }
}

// Used when the scout folder is missing (with config.siteUrls and factory/samples).
const fallbackSites = [
  "brinkscoffeeroasters", "aiki-budo", "birthbear", "nacrasailing", "terpstrav2",
  "fredimare", "kartstoreinternational", "bohlt", "hotelnavarra", "droogijs365", "spaansen",
];
const scouted = scoutSites(scoutDir);

export const config = {
  port: Number(process.env.PORT || 4321),
  root,
  scoutDir,
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
  // The sites a simulation picks from: all usable scout sites, or the fixed list when the scout folder is missing.
  sites: scouted.length ? scouted : fallbackSites,
  // Homepage per site, used when the scout file is not available (scoutDir lives outside this repo).
  siteUrls: {
    brinkscoffeeroasters: "https://www.brinkscoffeeroasters.nl",
    "aiki-budo": "https://www.aiki-budo.nl",
    birthbear: "https://www.birthbear.com",
    nacrasailing: "https://nacrasailing.com",
    terpstrav2: "https://www.terpstra-muziek.nl",
    fredimare: "https://www.fredimare.com",
    kartstoreinternational: "https://www.kartstoreinternational.com",
    bohlt: "https://www.bohlt.nl",
    hotelnavarra: "https://www.hotelnavarra.com",
    droogijs365: "https://www.droogijs365.nl",
    spaansen: "https://www.spaansen.nl",
  },
};
