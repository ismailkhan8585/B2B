"use client";

import { useState } from "react";
import { Settings, Save, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock settings data - in production this would come from the API
const settings = {
  general: {
    platformName: "TradeHub B2B",
    supportEmail: "support@tradehub.com",
    defaultCurrency: "USD",
    defaultLanguage: "en",
    platformTagline: "Connecting Businesses Worldwide",
  },
  homepage: {
    heroHeadline: "Find the Perfect Business Partner",
    heroSubline: "Connect with verified suppliers and buyers in our global marketplace",
    featuredProductsCount: 12,
  },
  registration: {
    allowBuyerRegistration: true,
    allowSellerRegistration: true,
    requireEmailVerification: true,
    autoApproveSellers: false,
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
  },
};

export default function SuperAdminSettings() {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (section: string) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`${section} settings saved successfully`);
    setIsSaving(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("All settings saved successfully");
    setIsSaving(false);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure global platform settings and preferences
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>General Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Basic platform configuration
                </p>
              </div>
              <Button onClick={() => handleSave("general")} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    value={currentSettings.general.platformName}
                    onChange={(e) => updateSetting("general", "platformName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={currentSettings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Input
                    id="default-currency"
                    value={currentSettings.general.defaultCurrency}
                    onChange={(e) => updateSetting("general", "defaultCurrency", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Input
                    id="default-language"
                    value={currentSettings.general.defaultLanguage}
                    onChange={(e) => updateSetting("general", "defaultLanguage", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-tagline">Platform Tagline</Label>
                <Textarea
                  id="platform-tagline"
                  value={currentSettings.general.platformTagline}
                  onChange={(e) => updateSetting("general", "platformTagline", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Homepage Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize the homepage appearance and content
                </p>
              </div>
              <Button onClick={() => handleSave("homepage")} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hero-headline">Hero Headline</Label>
                <Input
                  id="hero-headline"
                  value={currentSettings.homepage.heroHeadline}
                  onChange={(e) => updateSetting("homepage", "heroHeadline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subline">Hero Subline</Label>
                <Textarea
                  id="hero-subline"
                  value={currentSettings.homepage.heroSubline}
                  onChange={(e) => updateSetting("homepage", "heroSubline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured-count">Featured Products Count</Label>
                <Input
                  id="featured-count"
                  type="number"
                  value={currentSettings.homepage.featuredProductsCount}
                  onChange={(e) => updateSetting("homepage", "featuredProductsCount", parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registration Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control user registration and verification requirements
                </p>
              </div>
              <Button onClick={() => handleSave("registration")} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Buyer Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new buyers to register accounts
                  </p>
                </div>
                <Switch
                  checked={currentSettings.registration.allowBuyerRegistration}
                  onCheckedChange={(checked) => updateSetting("registration", "allowBuyerRegistration", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Seller Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new sellers to register accounts
                  </p>
                </div>
                <Switch
                  checked={currentSettings.registration.allowSellerRegistration}
                  onCheckedChange={(checked) => updateSetting("registration", "allowSellerRegistration", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={currentSettings.registration.requireEmailVerification}
                  onCheckedChange={(checked) => updateSetting("registration", "requireEmailVerification", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Sellers</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve seller accounts without verification
                  </p>
                </div>
                <Switch
                  checked={currentSettings.registration.autoApproveSellers}
                  onCheckedChange={(checked) => updateSetting("registration", "autoApproveSellers", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage subscription plans and pricing
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Subscription plan management interface would go here</p>
                <p className="text-sm">Edit plan names, prices, and feature limits</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Mode</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Put the platform in maintenance mode
                </p>
              </div>
              <Button onClick={() => handleSave("maintenance")} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, all public pages show maintenance message
                  </p>
                </div>
                <Switch
                  checked={currentSettings.maintenance.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("maintenance", "maintenanceMode", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  value={currentSettings.maintenance.maintenanceMessage}
                  onChange={(e) => updateSetting("maintenance", "maintenanceMessage", e.target.value)}
                  disabled={!currentSettings.maintenance.maintenanceMode}
                />
              </div>
              {currentSettings.maintenance.maintenanceMode && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <Settings className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Maintenance mode is currently enabled. The platform is not accessible to regular users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}