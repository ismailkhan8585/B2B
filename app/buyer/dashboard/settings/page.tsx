"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { changeMyPassword, updateMyProfile, uploadMyAvatar } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BuyerSettingsPage() {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const canSaveProfile = useMemo(() => name.trim().length > 0 || phone.trim().length > 0, [name, phone]);
  const canChangePw = useMemo(() => currentPassword.length > 0 && newPassword.length >= 8, [currentPassword, newPassword]);

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="rounded-2xl border border-border bg-white p-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your profile and password.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Profile
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  startTransition(async () => {
                    const res = await uploadMyAvatar(file);
                    if (!res.success) toast.error(res.error ?? "Upload failed.");
                    else toast.success("Avatar updated.");
                  });
                }}
              />
            </div>

            <Button
              type="button"
              disabled={!canSaveProfile || isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await updateMyProfile({ name: name.trim() || undefined, phone: phone.trim() || undefined });
                  if (!res.success) toast.error(res.error ?? "Update failed.");
                  else toast.success("Profile updated.");
                });
              }}
              style={{ background: "var(--accent)" }}
            >
              Save profile
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              Change password
            </div>
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!canChangePw || isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await changeMyPassword({ currentPassword, newPassword });
                  if (!res.success) toast.error(res.error ?? "Change password failed.");
                  else {
                    toast.success("Password updated.");
                    setCurrentPassword("");
                    setNewPassword("");
                  }
                });
              }}
            >
              Change password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

