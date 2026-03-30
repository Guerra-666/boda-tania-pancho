'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/actions/auth'; // Cambiamos a ruta relativa

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Llamamos a la función de validación del servidor
    const res = await loginAdmin(password);

    if (res.success) {
      router.push('/dashboard'); // Si es correcta, lo mandamos al dashboard
    } else {
      setError(res.error || 'Contraseña incorrecta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-boda-cream)] p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-[var(--color-boda-beige)]">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[var(--color-boda-olivo-dark)] mb-2">
            Acceso Privado
          </h1>
          <p className="text-[var(--color-boda-taupe)]">
            Ingresa la contraseña para gestionar las invitaciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-boda-beige)] focus:outline-none focus:ring-2 focus:ring-[var(--color-boda-olivo-light)] text-[var(--color-boda-taupe)] placeholder:text-[var(--color-boda-taupe)]/50"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-boda-olivo-dark)] hover:bg-[var(--color-boda-olivo-light)] text-white font-medium py-3 rounded-xl transition-colors duration-300 flex justify-center items-center disabled:opacity-70"
          >
            {loading ? 'Verificando...' : 'Entrar al Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}