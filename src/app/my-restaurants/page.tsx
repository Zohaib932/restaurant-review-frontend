'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, Grid, Card, CardContent,
  CardActions, Rating, CircularProgress, Alert, Chip,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Restaurant {
  id: string;
  title: string;
  location: string;
  cuisine: string;
  previewImage?: string;
  averageRating: number;
}

export default function MyRestaurantsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user?.role !== 'Owner') router.push('/restaurants');
  }, [user, authLoading, router]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await api.restaurants.list({ ownedByMe: true });
      setRestaurants(data.items);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchRestaurants();
  }, [user, fetchRestaurants]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await api.restaurants.delete(id);
      fetchRestaurants();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to delete restaurant');
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Restaurants</Typography>
        <Button variant="contained" component={Link} href="/my-restaurants/new">
          Add Restaurant
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {restaurants.length === 0 ? (
        <Typography color="text.secondary">
          You haven&apos;t added any restaurants yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {restaurants.map(r => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {r.previewImage && (
                  <Box
                    component="img"
                    src={r.previewImage}
                    alt={r.title}
                    sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.location}</Typography>
                  <Chip label={r.cuisine} size="small" sx={{ mt: 1 }} />
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={r.averageRating} readOnly precision={0.1} size="small" />
                    <Typography variant="body2">({r.averageRating?.toFixed(1)})</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" component={Link} href={`/my-restaurants/${r.id}/edit`}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                  <Button size="small" component={Link} href={`/restaurants/${r.id}`}>
                    View
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
