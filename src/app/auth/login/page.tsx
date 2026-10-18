import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: '登录',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/80" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
