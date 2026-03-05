'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Typography, Box, Chip, Rating, Divider, CircularProgress,
  Alert, Button, TextField, Paper,
} from '@mui/material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ReviewCard from '@/components/ReviewCard';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: { id: string; name: string };
}

interface RestaurantDetail {
  id: string;
  title: string;
  description?: string;
  location: string;
  cuisine: string;
  previewImage?: string;
  averageRating: number | null;
  owner?: { name: string };
  reviews?: Review[];
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await api.restaurants.get(id);
      setRestaurant(data);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRestaurant();
  }, [id, fetchRestaurant]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) { setReviewError('Please select a rating'); return; }
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.reviews.create(id, { rating: reviewRating, comment: reviewComment });
      setReviewRating(null);
      setReviewComment('');
      fetchRestaurant();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setReviewError(apiErr.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await api.reviews.delete(id, reviewId);
      fetchRestaurant();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to delete review');
    }
  };

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!restaurant) return null;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>← Back</Button>

      {restaurant.previewImage && (
        <Box
          component="img"
          src={restaurant.previewImage}
          alt={restaurant.title}
          sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 1, mb: 3 }}
        />
      )}

      <Typography variant="h4">{restaurant.title}</Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
        <Typography color="text.secondary">📍 {restaurant.location}</Typography>
        <Chip label={restaurant.cuisine} />
        {restaurant.averageRating !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={restaurant.averageRating} readOnly precision={0.1} />
            <Typography>({restaurant.averageRating?.toFixed(1)})</Typography>
          </Box>
        )}
      </Box>

      {restaurant.description && (
        <Typography sx={{ mt: 2 }}>{restaurant.description}</Typography>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Owner: {restaurant.owner?.name}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" mb={2}>
        Reviews ({restaurant.reviews?.length || 0})
      </Typography>

      {user?.role === 'Reviewer' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>Write a Review</Typography>
          {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
          <form onSubmit={handleReviewSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} />
            </Box>
            <TextField
              label="Comment"
              multiline
              rows={3}
              fullWidth
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              required
              inputProps={{ minLength: 1, maxLength: 2000 }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={reviewLoading}>
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Paper>
      )}

      {restaurant.reviews?.length === 0 && (
        <Typography color="text.secondary">No reviews yet.</Typography>
      )}

      {restaurant.reviews?.map(review => (
        <ReviewCard
          key={review.id}
          review={review}
          canDelete={user?.id === review.reviewer.id}
          onDelete={handleDeleteReview}
        />
      ))}
    </Container>
  );
}
