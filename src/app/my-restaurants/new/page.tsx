'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import RestaurantForm from '@/components/RestaurantForm';

export default function NewRestaurantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Owner')) router.push('/login');
  }, [user, loading, router]);

  return (
    <Container>
      <RestaurantForm />
    </Container>
  );
}
