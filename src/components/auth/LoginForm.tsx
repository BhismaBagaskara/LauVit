"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, AtSign } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/shared/GlassCard";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, googleSignIn, loading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password);
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Login Failed", description: (error as Error).message });
    }
  }
  
  async function handleGoogleSignIn() {
    try {
      await googleSignIn();
      toast({ title: "Login Successful", description: "Welcome!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Google Sign-In Failed", description: (error as Error).message });
    }
  }

  return (
    <GlassCard className="w-full max-w-md animate-fade-in">
      <GlassCardHeader>
        <GlassCardTitle className="text-2xl font-headline">Welcome Back!</GlassCardTitle>
        <GlassCardDescription>Sign in to continue to Lauvit.</GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><AtSign className="mr-2 h-4 w-4 text-primary" />Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="input-animated" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-primary" />Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="input-animated" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full btn-animated" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
        </Form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full btn-animated" onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.95-4.25 1.95-3.37 0-6.13-2.66-6.13-5.95s2.76-5.95 6.13-5.95c1.65 0 2.99.59 4.02 1.54l2.52-2.38C17.09 3.24 15.04 2.5 12.48 2.5c-4.47 0-8.15 3.55-8.15 7.95s3.68 7.95 8.15 7.95c2.47 0 4.29-.83 5.79-2.32 1.56-1.56 2.27-3.83 2.27-5.47V10.92h-7.84z"></path></svg>
          )}
          Google
        </Button>
      </GlassCardContent>
      <GlassCardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </GlassCardFooter>
    </GlassCard>
  );
}
