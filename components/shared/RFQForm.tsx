"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RFQFormSchema = z.object({
  quantity: z.coerce.number().int().min(1),
  targetPrice: z.coerce.number().nonnegative().optional(),
  deliveryLocation: z.string().min(2).max(120),
  requiredBy: z.string().optional(),
  message: z.string().min(5).max(2000),
});

export type RFQFormValues = z.infer<typeof RFQFormSchema>;

export function RFQForm({
  action,
  initial,
  submitLabel = "Send RFQ",
}: {
  action: (input: RFQFormValues) => Promise<{ success: boolean; error?: string | null }>;
  initial?: Partial<RFQFormValues>;
  submitLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<RFQFormValues>({
    resolver: zodResolver(RFQFormSchema),
    defaultValues: {
      quantity: initial?.quantity ?? 1,
      targetPrice: initial?.targetPrice,
      deliveryLocation: initial?.deliveryLocation ?? "",
      requiredBy: initial?.requiredBy ?? "",
      message: initial?.message ?? "",
    },
  });

  const canSubmit = useMemo(() => form.formState.isValid, [form.formState.isValid]);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const values = form.getValues();
          const parsed = RFQFormSchema.safeParse(values);
          if (!parsed.success) {
            toast.error("Please check your RFQ details.");
            return;
          }

          const res = await action(parsed.data);
          if (!res.success) {
            toast.error(res.error ?? "Failed to send RFQ.");
            return;
          }

          toast.success("RFQ sent to supplier.");
          form.reset({ quantity: 1, targetPrice: undefined, deliveryLocation: "", requiredBy: "", message: "" });
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" inputMode="numeric" {...form.register("quantity")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="targetPrice">Target Price</Label>
          <Input id="targetPrice" inputMode="decimal" placeholder="Optional" {...form.register("targetPrice")} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="deliveryLocation">Delivery Location</Label>
        <Input id="deliveryLocation" placeholder="e.g. Dubai, UAE" {...form.register("deliveryLocation")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="requiredBy">Required By</Label>
        <Input id="requiredBy" type="date" {...form.register("requiredBy")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell the supplier your requirements..."
          {...form.register("message")}
        />
      </div>
      <Button
        type="submit"
        disabled={!canSubmit || isPending}
        className="w-full"
        style={{ background: "var(--primary)" }}
      >
        {isPending ? "Sending..." : submitLabel}
      </Button>
    </form>
  );
}

