import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  CreditCard,
  Star,
  StarOff,
  Ban,
  Trash2,
} from "lucide-react";

interface BusinessActionMenuProps {
  companyId: string;
  onAction: (action: string) => void;
}

export function BusinessActionMenu({ companyId, onAction }: BusinessActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction("view")}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit")}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Company
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction("approve-verification")}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Verification
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("reject-verification")}>
          <XCircle className="h-4 w-4 mr-2" />
          Reject Verification
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAction("change-subscription")}>
          <CreditCard className="h-4 w-4 mr-2" />
          Change Subscription
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("toggle-featured")}>
          <Star className="h-4 w-4 mr-2" />
          Toggle Featured
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("toggle-active")}>
          <Ban className="h-4 w-4 mr-2" />
          Toggle Active
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAction("delete")}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}