"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { getConversationMessages, sendMessage } from "@/actions/message.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ConversationListItem = {
  id: string;
  title: string | null;
  updatedAt: string | Date;
};

type MessageItem = {
  id: string;
  senderId: string;
  content: string | null;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string | Date;
};

export function MessagesClient({
  meId,
  conversations,
}: {
  meId: string;
  conversations: ConversationListItem[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const selected = sp.get("c") ?? conversations[0]?.id ?? null;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    if (!selected) return;
    const res = await getConversationMessages(selected);
    if (!res.success) {
      toast.error(res.error ?? "Failed to load messages.");
      return;
    }
    setMessages(res.data!.messages as any);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const selectedMeta = useMemo(() => conversations.find((c) => c.id === selected) ?? null, [conversations, selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr] pb-16 md:pb-0">
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
          Messages
        </div>
        <div className="mt-3 space-y-1">
          {conversations.length ? (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  router.push(`/buyer/dashboard/messages?c=${encodeURIComponent(c.id)}`);
                  router.refresh();
                }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left hover:bg-muted",
                  c.id === selected && "bg-muted"
                )}
              >
                <div className="truncate text-sm font-semibold">{c.title ?? "Conversation"}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleString()}</div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-border p-6 text-sm text-muted-foreground">No conversations yet.</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{selectedMeta?.title ?? "Chat"}</div>
            <div className="text-xs text-muted-foreground">Polling every 5 seconds</div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={load}>
            Refresh
          </Button>
        </div>

        <div className="mt-4 h-[420px] space-y-2 overflow-auto rounded-xl border border-border bg-background p-3">
          {messages.length ? (
            messages.map((m) => (
              <div key={m.id} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", m.senderId === meId ? "ml-auto bg-white" : "bg-muted")}>
                {m.type === "FILE" && m.fileUrl ? (
                  <a href={m.fileUrl} target="_blank" rel="noreferrer" className="underline">
                    {m.fileName ?? "File"}
                  </a>
                ) : null}
                {m.content ? <div className="whitespace-pre-line">{m.content}</div> : null}
                <div className="mt-1 text-[11px] text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}</div>
              </div>
            ))
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">Select a conversation to view messages.</div>
          )}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selected || !draft.trim()) return;
            startTransition(async () => {
              const res = await sendMessage({ conversationId: selected, content: draft.trim() });
              if (!res.success) {
                toast.error(res.error ?? "Failed to send.");
                return;
              }
              setDraft("");
              await load();
            });
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." aria-label="Message" />
          <Button type="submit" disabled={isPending || !draft.trim()} style={{ background: "var(--primary)" }}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

