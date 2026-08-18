'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LumenMark } from '@/components/lumen-mark';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      setServerError('E-mail ou senha inválidos.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="bg-navy flex min-h-screen items-center justify-center p-6">
      <Card elevation="lg" className="w-full max-w-[380px] gap-0 p-8 text-center">
        <div className="mx-auto mb-3.5 flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[#111318] text-white">
          <LumenMark className="size-6" />
        </div>
        <div className="font-heading mb-0.5 text-[22px] font-extrabold tracking-tight">
          LUMEN ERP
        </div>
        <h1 className="font-heading mt-4 mb-0.5 text-left text-xl font-semibold">Entrar</h1>
        <p className="text-muted-foreground mb-5 text-left text-[13px]">
          Acesse o ERP com seu e-mail e senha
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-left" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-muted-foreground block text-xs">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive-foreground text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-muted-foreground block text-xs">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive-foreground text-xs">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-destructive-foreground text-sm">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
