// Commits and pushes finished work to GitHub, one operation at a time (builds finish in parallel).
import { execFile } from "node:child_process";
import { config } from "../config.js";

const git = (...args) => new Promise((resolve, reject) => {
  execFile("git", args, { cwd: config.root, windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) =>
    err ? reject(new Error((stderr || err.message).trim())) : resolve(stdout.trim()));
});

let chain = Promise.resolve();

// paths: files/folders to stage (respecting .gitignore). Resolves to a short status string; never throws.
export function commitAndPush({ paths, message }) {
  const job = chain.then(async () => {
    if (process.env.AUTO_PUSH === "0") return "auto-push disabled";
    await git("add", "--", ...paths);
    const staged = await git("diff", "--cached", "--name-only");
    if (!staged) return "nothing to commit";
    await git("commit", "-q", "-m", `${message}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`);
    try {
      await git("push", "-q");
    } catch {
      // Someone pushed in between: rebase onto it and try once more.
      await git("pull", "--rebase", "-q");
      await git("push", "-q");
    }
    return "pushed " + (await git("rev-parse", "--short", "HEAD"));
  }).catch((e) => `push failed: ${e.message.slice(0, 160)}`);
  chain = job;
  return job;
}
