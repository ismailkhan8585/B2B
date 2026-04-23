"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, RotateCcw, FileX, Users, Database, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const dangerActions = [
  {
    id: "purge-drafts",
    title: "Purge All Draft Products",
    description: "Delete all products that are currently in DRAFT status",
    icon: FileX,
    color: "destructive",
    confirmationText: "PURGE DRAFTS",
    affectedCount: 47,
    action: "purgeDrafts",
  },
  {
    id: "purge-banned",
    title: "Purge Banned Users",
    description: "Delete all banned users and their associated data",
    icon: Users,
    color: "destructive",
    confirmationText: "PURGE BANNED USERS",
    affectedCount: 12,
    action: "purgeBannedUsers",
  },
  {
    id: "reset-verifications",
    title: "Reset Pending Verifications",
    description: "Set all pending verifications back to UNVERIFIED status",
    icon: RotateCcw,
    color: "destructive",
    confirmationText: "RESET VERIFICATIONS",
    affectedCount: 23,
    action: "resetVerifications",
  },
  {
    id: "clear-notifications",
    title: "Clear All Notifications",
    description: "Delete all user notifications across the platform",
    icon: Trash2,
    color: "destructive",
    confirmationText: "CLEAR NOTIFICATIONS",
    affectedCount: 1547,
    action: "clearNotifications",
  },
  {
    id: "wipe-logs",
    title: "Wipe Old Audit Logs",
    description: "Delete audit logs older than 90 days",
    icon: Database,
    color: "destructive",
    confirmationText: "WIPE OLD LOGS",
    affectedCount: 12580,
    action: "wipeOldLogs",
  },
];

export default function SuperAdminDanger() {
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);

  const handleActionClick = (action: any) => {
    setSelectedAction(action);
    setConfirmationText("");
  };

  const handleConfirm = async () => {
    if (confirmationText !== selectedAction.confirmationText) {
      toast.error("Confirmation text does not match");
      return;
    }

    setIsExecuting(true);
    setShowCountdown(true);
    setCountdown(30); // 30 second countdown

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          executeAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeAction = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`${selectedAction.title} completed successfully`);

      // Log the action to audit log
      console.log("Action executed:", selectedAction.action);

    } catch (error) {
      toast.error(`Failed to execute ${selectedAction.title}`);
    } finally {
      setIsExecuting(false);
      setShowCountdown(false);
      setSelectedAction(null);
      setConfirmationText("");
    }
  };

  const handleCancel = () => {
    setIsExecuting(false);
    setShowCountdown(false);
    setCountdown(0);
    setSelectedAction(null);
    setConfirmationText("");
  };

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Danger Zone</strong> - These actions are irreversible and will permanently affect the platform.
          Please proceed with extreme caution. All actions are logged and cannot be undone.
        </AlertDescription>
      </Alert>

      {/* Re-authentication Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Re-authentication Required</h3>
              <p className="text-sm text-yellow-700">
                For security, you may be asked to re-authenticate before performing destructive actions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Actions */}
      <div className="grid gap-6">
        {dangerActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id} className="border-red-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-red-900">{action.title}</CardTitle>
                      <p className="text-sm text-red-700 mt-1">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">{action.affectedCount.toLocaleString()}</div>
                    <div className="text-sm text-red-500">items affected</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => handleActionClick(action)}
                      className="w-full"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      Execute {action.title}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Confirm Destructive Action</span>
                      </DialogTitle>
                      <DialogDescription className="space-y-2">
                        <p>You are about to execute: <strong>{action.title}</strong></p>
                        <p className="text-red-600 font-medium">
                          This will affect {action.affectedCount.toLocaleString()} items and cannot be undone.
                        </p>
                        <p className="text-sm">
                          Type <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                            {action.confirmationText}
                          </code> to confirm.
                        </p>
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="confirmation">Confirmation Text</Label>
                        <Input
                          id="confirmation"
                          value={confirmationText}
                          onChange={(e) => setConfirmationText(e.target.value)}
                          placeholder={`Type "${action.confirmationText}"`}
                          disabled={isExecuting}
                        />
                      </div>

                      {showCountdown && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Executing in...</span>
                            <span className="font-mono font-bold text-red-600">
                              {countdown}s
                            </span>
                          </div>
                          <Progress value={(30 - countdown) / 30 * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            You can still cancel this action
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isExecuting && !showCountdown}
                      >
                        Cancel
                      </Button>
                      {!showCountdown ? (
                        <Button
                          variant="destructive"
                          onClick={handleConfirm}
                          disabled={confirmationText !== action.confirmationText || isExecuting}
                        >
                          {isExecuting ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Confirm Action
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleCancel}
                          disabled={countdown === 0}
                        >
                          Cancel Execution
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Factory Reset - Most Dangerous */}
      <Card className="border-red-500 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <Database className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900">Factory Reset Platform</CardTitle>
              <p className="text-sm text-red-700 mt-1">
                Complete platform reset - deletes ALL users (except current super admin), companies, products, and data.
                This action requires typing the full platform name.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="w-full">
                <Database className="h-5 w-5 mr-2" />
                Factory Reset Platform
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                  <span>⚠️ FACTORY RESET</span>
                </DialogTitle>
                <DialogDescription className="space-y-2">
                  <p className="font-bold text-red-700">
                    This will permanently delete ALL data on the platform except your super admin account.
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-red-600">
                    <li>All user accounts (buyers, sellers, admins)</li>
                    <li>All company profiles and documents</li>
                    <li>All products and product images</li>
                    <li>All RFQs and quotations</li>
                    <li>All conversations and messages</li>
                    <li>All notifications and audit logs</li>
                  </ul>
                  <p className="text-sm font-medium">
                    Type the full platform name <code className="bg-gray-100 px-1 py-0.5 rounded">
                      TradeHub B2B
                    </code> to confirm.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="factory-reset-confirmation">Platform Name Confirmation</Label>
                  <Input
                    id="factory-reset-confirmation"
                    placeholder="Type 'TradeHub B2B' to confirm"
                  />
                </div>

                <Alert className="border-red-300 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    This action cannot be undone. A final confirmation dialog will appear with a 30-second countdown.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" disabled>
                  <Database className="h-4 w-4 mr-2" />
                  Proceed to Factory Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}