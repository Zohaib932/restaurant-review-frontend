import { Card, CardContent, Typography, Rating, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: { id: string; name: string };
}

export default function ReviewCard({
  review,
  onDelete,
  canDelete,
}: {
  review: Review;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">{review.reviewer.name}</Typography>
          {canDelete && onDelete && (
            <IconButton size="small" onClick={() => onDelete(review.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Rating value={review.rating} readOnly size="small" />
        <Typography variant="body2" sx={{ mt: 1 }}>{review.comment}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(review.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
