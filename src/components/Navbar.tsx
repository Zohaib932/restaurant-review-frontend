'use client';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          Restaurant Reviews
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {user ? (
            <>
              <Typography variant="body2">{user.name} ({user.role})</Typography>
              {user.role === 'Owner' && (
                <Button color="inherit" component={Link} href="/my-restaurants">
                  My Restaurants
                </Button>
              )}
              {user.role === 'Reviewer' && (
                <Button color="inherit" component={Link} href="/restaurants">
                  Restaurants
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/login">Login</Button>
              <Button color="inherit" component={Link} href="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
