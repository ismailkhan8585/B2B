import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getMyConversations } from "@/actions/message.actions";
import { MessagesClient } from "@/components/shared/MessagesClient";

export default async function SellerMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await getMyConversations();
  return <MessagesClient meId={session.user.id} conversations={conversations as any} />;
}

