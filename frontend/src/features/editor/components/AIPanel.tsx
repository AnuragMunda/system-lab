"use client";

// Collapsible AI Architect panel. Talks to the (mock) AiClient and renders a small
// chat. Quick actions explain / find bottlenecks / suggest improvements; the input
// drives "modify", and "Generate" turns a prompt into component proposals the user
// can drop onto the canvas. All persistence/persistence seams live in aiClient.ts.
import { useState } from "react";
import { Sparkles, Send } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addNode, toggleAiPanel } from "@/store/editorSlice";
import { aiClient, type AiMessage, type AiProposal } from "../aiClient";
import { CLICK_DROP_POSITION } from "../constants";
import { toast } from "@/lib/utils";

export function AIPanel() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.editor.aiPanelOpen);
  const nodes = useAppSelector((s) => s.editor.nodes);
  const edges = useAppSelector((s) => s.editor.edges);
  const name = useAppSelector((s) => s.editor.name);
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: "assistant", content: "Hi! I can explain this architecture, spot bottlenecks, or generate components. Try a quick action below." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => dispatch(toggleAiPanel())}
        aria-label="Open AI panel"
        className="flex w-9 shrink-0 flex-col items-center justify-center gap-1 border-l border-border bg-card text-primary transition-colors hover:bg-muted"
      >
        <Sparkles className="size-4" />
        <span className="text-[10px] [writing-mode:vertical-rl]">AI</span>
      </button>
    );
  }

  const ctx = { name, nodes, edges };

  async function ask(fn: () => Promise<{ content: string; proposals?: AiProposal[] }>, userText?: string) {
    if (busy) return;
    setBusy(true);
    if (userText) setMessages((m) => [...m, { role: "user", content: userText }]);
    try {
      const res = await fn();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.content, proposals: res.proposals },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function applyProposal(p: AiProposal) {
    const near = p.nearId ? nodes.find((n) => n.id === p.nearId) : undefined;
    const pos = near
      ? { x: near.position.x + 60, y: near.position.y + 60 }
      : CLICK_DROP_POSITION;
    dispatch(addNode({ kind: p.kind, position: pos }));
    toast(`Added ${p.label}`);
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">AI Architect</h2>
        </div>
        <button
          type="button"
          onClick={() => dispatch(toggleAiPanel())}
          aria-label="Collapse AI panel"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Hide
        </button>
      </div>

      <div className="flex flex-col gap-2 border-b border-border p-3">
        <QuickAction label="Explain architecture" onClick={() => ask(() => aiClient.explain(ctx))} />
        <QuickAction label="Identify bottlenecks" onClick={() => ask(() => aiClient.bottlenecks(ctx))} />
        <QuickAction label="Suggest improvements" onClick={() => ask(() => aiClient.suggestions(ctx))} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {m.role === "user" ? "You" : "AI"}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
              {m.content}
            </p>
            {"proposals" in m && m.proposals ? (
              <div className="mt-2 flex flex-col gap-1">
                {m.proposals.map((p, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => applyProposal(p)}
                    className="rounded-sm border border-border bg-muted/40 px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {busy ? <p className="text-xs text-muted-foreground">Thinking…</p> : null}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text) return;
          setInput("");
          ask(() => aiClient.modify(ctx, text), text);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to modify…"
          aria-label="Ask the AI architect"
          className="h-9 flex-1 rounded-sm border border-border bg-muted px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-border-strong"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Send"
          className="inline-flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const text = input.trim();
            setInput("");
            ask(() => aiClient.generate(ctx, text || "a cache and a queue"), text || undefined);
          }}
          className="w-full rounded-sm border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Generate components
        </button>
      </div>
    </aside>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-border bg-muted/40 px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      {label}
    </button>
  );
}
