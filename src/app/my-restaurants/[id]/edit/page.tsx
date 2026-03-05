'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, CircularProgress, Box, Alert } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import RestaurantForm from '@/components/RestaurantForm';

interface RestaurantData {
  title: string;
  description?: string;
  location: string;
  cuisine: string;
  previewImage?: string;
}

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Owner')) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (id) {
      api.restaurants.get(id)
        .then(data => { setRestaurant(data); setLoading(false); })
        .catch(err => {
          const apiErr = err as { message?: string };
          setError(apiErr.message || 'Failed to load');
          setLoading(false);
        });
    }
  }, [id]);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container>
      <RestaurantForm
        restaurantId={id}
        initial={{
          title: restaurant?.title || '',
          description: restaurant?.description || '',
          location: restaurant?.location || '',
          cuisine: restaurant?.cuisine || '',
          previewImage: restaurant?.previewImage || '',
        }}
      />
    </Container>
  );
}
