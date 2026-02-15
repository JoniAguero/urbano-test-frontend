'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 3) errs.password = 'Min. 3 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });
      addToast({ type: 'success', title: 'Welcome back!', message: 'Authentication successful' });
      router.push('/dashboard');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: err instanceof Error ? err.message : 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '20%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 5s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
        }}
      >
        {/* Gradient border glow */}
        <div
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 'calc(var(--radius-xl) + 1px)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2), rgba(124,58,237,0.1))',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 6s ease infinite',
            zIndex: 0,
          }}
        />

        <div
          className="glass-strong"
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            padding: '44px 36px',
            zIndex: 1,
          }}
        >
          {/* Logo / Brand */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--color-violet), var(--color-cyan))',
                marginBottom: 20,
                boxShadow: '0 8px 30px rgba(124,58,237,0.3)',
              }}
            >
              <Zap size={28} color="white" />
            </motion.div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: 8,
              }}
            >
              Urbano Commerce
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Sign in to access the management dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="password"
                  type="password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: 8, height: 48 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              marginTop: 24,
            }}
          >
            Hexagonal Architecture • Event-Driven • NestJS v11
          </p>
        </div>
      </motion.div>
    </div>
  );
}
