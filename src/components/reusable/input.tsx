import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

interface InputComponentProps extends Omit<TextFieldProps, "name"> {
  name: string;
  label?: string;
  placeholder?: string;
  slotProps?: TextFieldProps["slotProps"];
}

export default function InputComponent({
  name,
  label,
  placeholder,
  slotProps,
  ...props
}: InputComponentProps) {
  return (
    <TextField
      name={name}
      autoComplete="off"
      label={label}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      slotProps={slotProps}
      fullWidth={false} // default auto width
      {...props} // spreads other MUI TextFieldProps safely
    />
  );
}
