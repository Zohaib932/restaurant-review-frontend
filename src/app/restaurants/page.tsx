'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, ToggleButton, ToggleButtonGroup, Pagination,
  CircularProgress, Alert,
} from '@mui/material';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import RestaurantCard from '@/components/RestaurantCard';
import { useRouter } from 'next/navigation';

interface Meta {
  page: number;
  totalPages: number;
  total: number;
}

interface Restaurant {
  id: string;
  title: string;
  description?: string;
  location: string;
  cuisine: string;
  previewImage?: string;
  averageRating: number;
}

export default function RestaurantsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('averageRating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.preferences.get()
        .then(prefs => {
          setSortBy(prefs.sortBy);
          setSortOrder(prefs.sortOrder);
          setPrefsLoaded(true);
        })
        .catch(() => setPrefsLoaded(true));
    }
  }, [user]);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 10, sortBy, sortOrder };
      if (search) params.search = search;
      if (cuisine) params.cuisine = cuisine;
      if (minRating) params.minRating = Number(minRating);
      const data = await api.restaurants.list(params);
      setRestaurants(data.items);
      setMeta(data.meta);
    } catch (err: unknown) {
      
      setError(err instanceof ApiError ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search, cuisine, minRating]);

  useEffect(() => {
    if (prefsLoaded && user) fetchRestaurants();
  }, [fetchRestaurants, prefsLoaded, user]);

  const handleSortOrderChange = async (newOrder: string) => {
    if (!newOrder) return;
    setSortOrder(newOrder);
    setPage(1);
    try { await api.preferences.update({ sortBy, sortOrder: newOrder }); } catch { /* ignore */ }
  };

  const handleSortByChange = async (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(1);
    try { await api.preferences.update({ sortBy: newSortBy, sortOrder }); } catch { /* ignore */ }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>Restaurants</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          size="small"
        />
        <TextField
          label="Cuisine"
          value={cuisine}
          onChange={e => { setCuisine(e.target.value); setPage(1); }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Min Rating</InputLabel>
          <Select value={minRating} label="Min Rating" onChange={e => { setMinRating(e.target.value); setPage(1); }}>
            <MenuItem value="">Any</MenuItem>
            {[1, 2, 3, 4, 5].map(r => (
              <MenuItem key={r} value={r}>{r}+ Stars</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={e => handleSortByChange(e.target.value)}>
            <MenuItem value="averageRating">Rating</MenuItem>
            <MenuItem value="createdAt">Date Added</MenuItem>
            <MenuItem value="title">Name</MenuItem>
            <MenuItem value="cuisine">Cuisine</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={(_, v) => handleSortOrderChange(v)}
          size="small"
        >
          <ToggleButton value="desc">Best First</ToggleButton>
          <ToggleButton value="asc">Worst First</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {meta.total} restaurants found
          </Typography>
          <Grid container spacing={3}>
            {restaurants.map(r => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
                <RestaurantCard restaurant={r} />
              </Grid>
            ))}
          </Grid>
          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={meta.totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
