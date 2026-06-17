import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Banner } from '@/shared/components/Banner';

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const resetPassword = useAuth((s) => s.resetPassword);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await resetPassword(values.email);
    if (error) {
      setServerError('No se pudo enviar el enlace. Intenta de nuevo.');
      return;
    }
    setSent(true);
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4">
            <Banner tone="info" title="Revisa tu correo">
              Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.
            </Banner>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </div>
        ) : (
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

            <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
              Enviar enlace de recuperación
            </Button>

            {serverError && (
              <Banner tone="error" title="Error">
                {serverError}
              </Banner>
            )}

            <Link
              to="/login"
              className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-brand-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
