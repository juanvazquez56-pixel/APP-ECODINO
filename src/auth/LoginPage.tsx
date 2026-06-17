import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Banner } from '@/shared/components/Banner';

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setServerError('Correo o contraseña incorrectos.');
      return;
    }
    navigate('/', { replace: true });
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-700">Auditoría Operativa</h1>
            <p className="mt-1 text-sm text-slate-500">Control operativo · Mantenimiento industrial</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            leftIcon={<Mail className="h-5 w-5" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Field
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Iniciar sesión
          </Button>

          {serverError && (
            <Banner tone="error" title="No se pudo iniciar sesión">
              {serverError}
            </Banner>
          )}

          <Link
            to="/forgot-password"
            className="mt-2 text-center text-sm font-medium text-brand-600 hover:underline"
          >
            Olvidé mi contraseña
          </Link>
        </form>
      </div>
    </div>
  );
}
