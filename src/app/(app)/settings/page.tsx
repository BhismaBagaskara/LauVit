"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, UserCircle, Bell, Palette, LogOut, Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});

const preferencesSchema = z.object({
  enableNotifications: z.boolean().default(true),
  theme: z.enum(["dark", "light", "system"]).default("dark"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { // Use values instead of defaultValues to reflect auth state
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { // Load from localStorage or defaults
      enableNotifications: typeof window !== 'undefined' ? localStorage.getItem('lauvit_enableNotifications') === 'true' : true,
      theme: typeof window !== 'undefined' ? (localStorage.getItem('lauvit_theme') as "dark" | "light" | "system" || "dark") : "dark",
    },
  });
  
  // Update form if user data changes after initial load
  if (user && (profileForm.getValues("email") !== user.email || profileForm.getValues("name") !== user.name)) {
      profileForm.reset({ name: user.name || "", email: user.email || ""});
  }


  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSavingProfile(true);
    console.log("Profile Update:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, update user in AuthProvider/backend
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    setIsSavingProfile(false);
  };

  const onPreferencesSubmit = async (data: PreferencesFormValues) => {
    setIsSavingPrefs(true);
    console.log("Preferences Update:", data);
    // Simulate saving to localStorage
    localStorage.setItem('lauvit_enableNotifications', String(data.enableNotifications));
    localStorage.setItem('lauvit_theme', data.theme);
    if (data.theme === 'dark') document.documentElement.classList.add('dark');
    else if (data.theme === 'light') document.documentElement.classList.remove('dark');
    // 'system' theme would need more logic based on OS preference

    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Preferences Saved", description: "Your application settings have been updated." });
    setIsSavingPrefs(false);
  };

  if (authLoading && !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
        icon={Settings}
      />

      <GlassCard className="animate-slide-in-up">
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary" />Profile Information</GlassCardTitle>
          <GlassCardDescription>Update your personal details.</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <FormItem>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...profileForm.register("name")} className="input-animated" />
              {profileForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.name.message}</p>}
            </FormItem>
            <FormItem>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...profileForm.register("email")} readOnly className="input-animated bg-muted/50 cursor-not-allowed" />
               {profileForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.email.message}</p>}
            </FormItem>
            <Button type="submit" className="btn-animated" disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Profile
            </Button>
          </form>
        </GlassCardContent>
      </GlassCard>

      <GlassCard className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center"><Bell className="mr-2 h-6 w-6 text-primary" />Preferences</GlassCardTitle>
          <GlassCardDescription>Customize your app experience.</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/50">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates and reminders.</p>
              </div>
              <Switch
                checked={preferencesForm.watch("enableNotifications")}
                onCheckedChange={(checked) => preferencesForm.setValue("enableNotifications", checked)}
              />
            </FormItem>
             {/* Theme switcher placeholder - actual theme switching logic needs more setup */}
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/50">
               <div className="space-y-0.5">
                <Label className="flex items-center"><Palette className="mr-2 h-4 w-4 text-primary" />App Theme</Label>
                 <p className="text-xs text-muted-foreground">Choose your preferred interface look.</p>
              </div>
               {/* Basic theme switch example - real one would use context/localStorage and affect <html> class */}
              <select 
                {...preferencesForm.register("theme")}
                className="bg-input border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2"
                defaultValue={preferencesForm.getValues("theme")}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </FormItem>
            <Button type="submit" className="btn-animated" disabled={isSavingPrefs}>
              {isSavingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </form>
        </GlassCardContent>
      </GlassCard>

      <GlassCard className="animate-slide-in-up" style={{animationDelay: '0.4s'}}>
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center"><LogOut className="mr-2 h-6 w-6 text-destructive" />Account Actions</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Button variant="destructive" onClick={logout} className="w-full sm:w-auto btn-animated" disabled={authLoading}>
            {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log Out
          </Button>
          <p className="text-sm text-muted-foreground mt-2">Securely sign out of your Lauvit account.</p>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

// Minimal FormItem component
function FormItem({children, className}: {children: React.ReactNode, className?: string}) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}

