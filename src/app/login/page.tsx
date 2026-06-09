'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail } from 'lucide-react'

/**
 * Login via Magic Link (email sin contraseña).
 * Supabase envía un enlace al email → clic → sesión activa.
 * Sin contraseñas que olvidar — ideal para uso en solitario.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError('')

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError('No se pudo enviar el enlace. Comprueba el email e inténtalo de nuevo.')
      } else {
        setSent(true)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Nombre */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Albert Inmo</h1>
          <p className="mt-1 text-sm text-gray-500">Panel de administración</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {sent ? (
            /* Estado: email enviado */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Revisa tu email</h2>
              <p className="mt-2 text-sm text-gray-500">
                Te hemos enviado un enlace de acceso a{' '}
                <strong className="text-gray-700">{email}</strong>.
                <br />
                Haz clic en el enlace para entrar al panel.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-5 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Usar otro email
              </button>
            </div>
          ) : (
            /* Formulario de login */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Acceder</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Te enviaremos un enlace de acceso por email. Sin contraseña.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending || !email}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {isPending ? 'Enviando…' : 'Enviar enlace de acceso'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
