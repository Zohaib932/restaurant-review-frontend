import { Card, CardContent, CardMedia, Typography, Chip, Box, Rating } from '@mui/material';
import Link from 'next/link';

interface Restaurant {
  id: string;
  title: string;
  description?: string;
  location: string;
  cuisine: string;
  previewImage?: string;
  averageRating: number;
}

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card
      component={Link}
      href={`/restaurants/${restaurant.id}`}
      sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {restaurant.previewImage && (
        <CardMedia component="img" height="160" image={restaurant.previewImage} alt={restaurant.title} />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{restaurant.title}</Typography>
        <Typography variant="body2" color="text.secondary">{restaurant.location}</Typography>
        <Chip label={restaurant.cuisine} size="small" sx={{ mt: 1 }} />
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={restaurant.averageRating} readOnly precision={0.1} size="small" />
          <Typography variant="body2">({restaurant.averageRating.toFixed(1)})</Typography>
        </Box>
        {restaurant.description && (
          <Typography variant="body2" sx={{ mt: 1 }} noWrap>{restaurant.description}</Typography>
        )}
      </CardContent>
    </Card>
  );
}
