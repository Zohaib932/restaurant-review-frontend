'use client';
import { useState } from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import FormTextField from './FormTextField';

interface RestaurantData {
  title: string;
  description: string;
  location: string;
  cuisine: string;
  previewImage: string;
}

export default function RestaurantForm({
  initial,
  restaurantId,
}: {
  initial?: Partial<RestaurantData>;
  restaurantId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [cuisine, setCuisine] = useState(initial?.cuisine || '');
  const [previewImage, setPreviewImage] = useState(initial?.previewImage || '');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const body: Record<string, string> = { title, location, cuisine };
      if (description) body.description = description;
      if (previewImage) body.previewImage = previewImage;
      if (restaurantId) {
        await api.restaurants.update(restaurantId, body);
      } else {
        await api.restaurants.create(body);
      }
      router.push('/my-restaurants');
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> };
      setError(apiErr.message || 'Failed to save restaurant');
      if (apiErr.errors) setFieldErrors(apiErr.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>
        {restaurantId ? 'Edit Restaurant' : 'Add New Restaurant'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <FormTextField
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          errors={fieldErrors.title}
          required
          inputProps={{ maxLength: 200 }}
        />
        <FormTextField
          label="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          errors={fieldErrors.location}
          required
          inputProps={{ maxLength: 200 }}
        />
        <FormTextField
          label="Cuisine"
          value={cuisine}
          onChange={e => setCuisine(e.target.value)}
          errors={fieldErrors.cuisine}
          required
          inputProps={{ maxLength: 100 }}
        />
        <FormTextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          errors={fieldErrors.description}
          multiline
          rows={3}
          inputProps={{ maxLength: 1000 }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" mb={1}>Preview Image (optional)</Typography>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="preview"
              sx={{ mt: 1, maxHeight: 200, maxWidth: '100%', display: 'block' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : restaurantId ? 'Update' : 'Create'}
          </Button>
          <Button onClick={() => router.push('/my-restaurants')}>Cancel</Button>
        </Box>
      </form>
    </Paper>
  );
}
