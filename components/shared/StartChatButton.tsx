"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getOrCreateConversationWithCompany } from "@/actions/message.actions";

export function StartChatButton({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await getOrCreateConversationWithCompany(companyId);
          if (!res.success) {
            toast.error(res.error ?? "Failed to start chat.");
            return;
          }
          router.push(`/buyer/dashboard/messages?c=${encodeURIComponent(res.data!.id)}`);
          router.refresh();
        });
      }}
      className="w-full"
    >
      {isPending ? "Opening..." : "Chat with Supplier"}
    </Button>
  );
}

