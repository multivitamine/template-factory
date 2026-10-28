// Runs one headless Claude Code agent (`claude -p`) on the user's own account and
// translates its stream-json output into human-readable progress events.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const CLAUDE_EXE =
  process.env.CLAUDE_EXE ||
  path.join(process.env.APPDATA || "", "npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe");

function describeTool(name, input = {}) {
  const file = path.basename(input.file_path || input.path || "");
  switch (name) {
    case "Read":
      if (/\.(png|jpe?g)$/i.test(file)) return { step: "Looking at their site", detail: `viewing ${file}` };
      if (file === "styles.json") return { step: "Choosing a Refero template", detail: "reading the style catalog" };
      if (/^[0-9a-f-]{36}\.json$/.test(file)) return { step: "Choosing a Refero template", detail: "reading template spec" };
      return { step: "Analysing brand", detail: `reading ${file}` };
    case "Write":
    case "Edit":
      if (file === "brand.json") return { step: "Template chosen", detail: "brand.json written" };
      if (file === "index.html") return { step: "Building homepage", detail: `${name === "Edit" ? "refining" : "writing"} index.html` };
      if (file === "catalog.html") return { step: "Building catalog page", detail: `${name === "Edit" ? "refining" : "writing"} catalog.html` };
      return { step: null, detail: `writing ${file}` };
    case "WebFetch":
      return { step: null, detail: `fetching ${input.url}` };
    default:
      return { step: null, detail: name };
  }
}

// One-shot call without tools: prompt in, text out. Used for fast JSON generation.
export function runClaudeText({ prompt, model = config.model, cwd = config.root }) {
  return new Promise((resolve) => {
    const args = ["-p", "--output-format", "json", "--model", model, "--tools", "", "--no-session-persistence",
      "--strict-mcp-config", "--disable-slash-commands", "--setting-sources", "project,local"];
    const child = spawn(CLAUDE_EXE, args, { cwd, windowsHide: true });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      try {
        const r = JSON.parse(out);
        resolve({ ok: !r.is_error, text: r.result, costUsd: r.total_cost_usd, durationMs: r.duration_ms, error: r.is_error ? r.result : null });
      } catch {
        resolve({ ok: false, text: "", error: err.slice(-400) || `exit ${code}` });
      }
    });
    child.stdin.end(prompt);
  });
}

export function runAgent({ cwd, prompt, model = config.model, onEvent, timeoutMs = config.agentTimeoutMs, logName = "agent.log.jsonl" }) {
  return new Promise((resolve) => {
    const args = [
      "-p",
      "--output-format", "stream-json",
      "--verbose",
      // Token-level events, so the UI can show "writing template.html · 23 KB" during long writes.
      "--include-partial-messages",
      "--model", model,
      // Only these tools exist for the agent (no shell), and all of them are pre-approved.
      "--tools", "Read,Write,Edit,Glob,Grep,WebFetch",
      "--allowedTools", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch",
      "--permission-mode", "acceptEdits",
      "--add-dir", config.dataDir,
      "--no-session-persistence",
      // Keep agents lean: no MCP servers, skills, or user-level plugins/hooks (login still uses your account).
      "--strict-mcp-config",
      "--disable-slash-commands",
      "--setting-sources", "project,local",
    ];
    const child = spawn(CLAUDE_EXE, args, { cwd, windowsHide: true, env: { ...process.env } });
    const log = fs.createWriteStream(path.join(cwd, logName));
    const timer = setTimeout(() => {
      onEvent({ type: "detail", detail: "timeout, stopping agent" });
      child.kill();
    }, timeoutMs);

    let buf = "";
    let result = null;
    // Live size of the file/text being generated (from partial message deltas).
    let streaming = null, streamedChars = 0, lastEmit = 0, streamStart = 0;
    const emitStreaming = (force) => {
      if (!streaming || (!force && Date.now() - lastEmit < 1500)) return;
      lastEmit = Date.now();
      onEvent({ type: "detail", detail: streaming === "thinking"
        ? `thinking · ${Math.round((Date.now() - streamStart) / 1000)}s`
        : `${streaming} · ${(streamedChars / 1024).toFixed(1)} KB` });
    };
    child.stdout.on("data", (chunk) => {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let msg;
        try { msg = JSON.parse(line); } catch { continue; }
        if (msg.type === "stream_event") {
          const ev = msg.event || {};
          if (ev.type === "content_block_start") {
            const b = ev.content_block || {};
            streaming = b.type === "tool_use" ? (b.name === "Write" ? "writing file" : b.name === "Edit" ? "editing file" : null)
              : b.type === "thinking" ? "thinking" : null;
            streamedChars = 0;
            streamStart = Date.now();
          } else if (ev.type === "content_block_delta") {
            const d = ev.delta || {};
            streamedChars += (d.partial_json || d.thinking || d.text || "").length;
            emitStreaming(false);
          }
          continue; // partial events are not written to the log (it would get huge)
        }
        log.write(line + "\n");
        if (msg.type === "assistant") {
          for (const block of msg.message?.content || []) {
            if (block.type === "tool_use") onEvent({ type: "tool", ...describeTool(block.name, block.input) });
            else if (block.type === "text" && block.text.trim()) onEvent({ type: "detail", detail: block.text.trim().slice(0, 200) });
          }
        } else if (msg.type === "result") {
          result = msg;
        }
      }
    });
    let stderr = "";
    child.stderr.on("data", (d) => { stderr += d; log.write(d); });
    child.on("error", (e) => { stderr += e.message; });
    child.on("close", (code) => {
      clearTimeout(timer);
      log.end();
      resolve({
        ok: code === 0 && result && !result.is_error,
        code,
        text: result?.result,
        costUsd: result?.total_cost_usd,
        durationMs: result?.duration_ms,
        turns: result?.num_turns,
        error: code === 0 ? (result?.is_error ? result.result : null) : stderr.slice(-500) || `exit ${code}`,
      });
    });
    child.stdin.end(prompt);
  });
}
