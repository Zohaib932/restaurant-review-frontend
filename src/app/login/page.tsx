'use client';
import { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import FormTextField from '@/components/FormTextField';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      login(data.user, data.token);
      if (data.user.role === 'Owner') router.push('/my-restaurants');
      else router.push('/restaurants');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.message || 'Login failed');
      if (apiErr.errors) setFieldErrors(apiErr.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" mb={2}>Sign In</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <FormTextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            errors={fieldErrors.email}
            required
          />
          <FormTextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            errors={fieldErrors.password}
            required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don&apos;t have an account?{' '}
          <MuiLink component={Link} href="/register">Register</MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
