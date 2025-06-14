import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Lauvit',
  description: 'Create your Lauvit account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
