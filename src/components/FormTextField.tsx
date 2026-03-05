'use client';
import { TextField, TextFieldProps } from '@mui/material';

type FormTextFieldProps = TextFieldProps & { errors?: string[] };

export default function FormTextField({ errors, helperText, ...props }: FormTextFieldProps) {
  return (
    <TextField
      fullWidth
      margin="normal"
      error={!!errors?.length}
      helperText={errors?.join(', ') || helperText}
      {...props}
    />
  );
}
