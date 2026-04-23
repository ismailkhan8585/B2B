import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { SubscriptionPlan } from "@prisma/client";

interface ChangeSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  currentPlan: SubscriptionPlan;
  companyName: string;
  onConfirm: (newPlan: SubscriptionPlan) => void;
  isLoading?: boolean;
}

const planOptions = [
  { value: "FREE", label: "Free", description: "Basic features, limited products" },
  { value: "BASIC", label: "Basic", description: "Standard features, up to 50 products" },
  { value: "PREMIUM", label: "Premium", description: "Advanced features, up to 200 products" },
  { value: "ENTERPRISE", label: "Enterprise", description: "All features, unlimited products" },
];

const planColors = {
  FREE: "secondary",
  BASIC: "default",
  PREMIUM: "destructive",
  ENTERPRISE: "destructive",
} as const;

export function ChangeSubscriptionModal({
  open,
  onOpenChange,
  companyId,
  currentPlan,
  companyName,
  onConfirm,
  isLoading = false,
}: ChangeSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(currentPlan);

  const handleConfirm = () => {
    onConfirm(selectedPlan);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedPlan(currentPlan); // Reset on close
    }
    onOpenChange(newOpen);
  };

  const isUpgrade = getPlanLevel(selectedPlan) > getPlanLevel(currentPlan);
  const isDowngrade = getPlanLevel(selectedPlan) < getPlanLevel(currentPlan);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Subscription Plan</DialogTitle>
          <DialogDescription>
            Change the subscription plan for <strong>{companyName}</strong>. This action will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Plan</label>
            <div className="mt-1">
              <Badge variant={planColors[currentPlan]}>
                {currentPlan}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">New Plan</label>
            <Select value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as SubscriptionPlan)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(isUpgrade || isDowngrade) && (
            <div className={`flex items-start space-x-2 p-3 border rounded-md ${
              isUpgrade ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                isUpgrade ? 'text-green-600' : 'text-amber-600'
              }`} />
              <div className={`text-sm ${
                isUpgrade ? 'text-green-800' : 'text-amber-800'
              }`}>
                <strong>{isUpgrade ? 'Plan Upgrade' : 'Plan Downgrade'}:</strong>{" "}
                {isUpgrade
                  ? "This will grant the company access to additional features and higher limits."
                  : "This may restrict the company's access to certain features and reduce their limits."
                }
              </div>
            </div>
          )}

          {selectedPlan !== currentPlan && (
            <div className="text-sm text-muted-foreground">
              Plan will change from{" "}
              <Badge variant={planColors[currentPlan]} className="mx-1">
                {currentPlan}
              </Badge>{" "}
              to{" "}
              <Badge variant={planColors[selectedPlan]} className="mx-1">
                {selectedPlan}
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedPlan === currentPlan || isLoading}
          >
            {isLoading ? "Changing..." : "Change Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get plan hierarchy level
function getPlanLevel(plan: SubscriptionPlan): number {
  const levels = { FREE: 0, BASIC: 1, PREMIUM: 2, ENTERPRISE: 3 };
  return levels[plan];
}