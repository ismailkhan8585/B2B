"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createRFQ } from "@/actions/rfq.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewRFQPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [deadline, setDeadline] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");

  const canSubmit = useMemo(() => title.trim().length >= 3 && description.trim().length >= 10 && quantity >= 1, [title, description, quantity]);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 pb-16 md:pb-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
            Post New RFQ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Create a requirement for suppliers to quote.</p>
        </div>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          startTransition(async () => {
            const res = await createRFQ({
              title,
              description,
              quantity,
              unit: unit || undefined,
              budget: budget ? Number(budget) : undefined,
              currency,
              deadline: deadline || undefined,
              deliveryCountry: deliveryCountry || undefined,
              isPublic: true,
            });
            if (!res.success) {
              toast.error(res.error ?? "Failed to post RFQ.");
              return;
            }
            toast.success("RFQ posted.");
            router.push("/buyer/dashboard/rfqs");
            router.refresh();
          });
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 10,000 pcs custom packaging boxes" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Describe specifications, certifications, and expectations..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(Number(e.target.value || "1"))} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs / kg / meters" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="budget">Budget (optional)</Label>
            <Input id="budget" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="deliveryCountry">Delivery country/location</Label>
          <Input id="deliveryCountry" value={deliveryCountry} onChange={(e) => setDeliveryCountry(e.target.value)} placeholder="e.g. Germany" />
        </div>

        <Button type="submit" disabled={!canSubmit || isPending} style={{ background: "var(--accent)" }}>
          {isPending ? "Posting..." : "Post RFQ"}
        </Button>
      </form>
    </div>
  );
}

