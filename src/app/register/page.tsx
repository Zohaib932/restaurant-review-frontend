'use client';
import { useState } from 'react';
import {
  Box, Button, Typography, Paper, Alert, Link as MuiLink,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import FormTextField from '@/components/FormTextField';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Reviewer');
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
      const data = await api.auth.register({ email, name, password, role });
      login(data.user, data.token);
      if (data.user.role === 'Owner') router.push('/my-restaurants');
      else router.push('/restaurants');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.message || 'Registration failed');
      if (apiErr.errors) setFieldErrors(apiErr.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" mb={2}>Create Account</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <FormTextField
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            errors={fieldErrors.name}
            required
          />
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={role} label="Role" onChange={e => setRole(e.target.value)}>
              <MenuItem value="Reviewer">Reviewer</MenuItem>
              <MenuItem value="Owner">Restaurant Owner</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <MuiLink component={Link} href="/login">Sign in</MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
