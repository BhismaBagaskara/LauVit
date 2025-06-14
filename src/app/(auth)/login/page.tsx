import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Lauvit',
  description: 'Log in to your Lauvit account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
