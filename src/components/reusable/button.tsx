import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface AppButtonProps extends ButtonProps {
  text?: string;
}

export default function ButtonComponent({ text, ...props }: AppButtonProps) {
  return (
    <Button variant="contained" color="primary" {...props}>
      {text}
    </Button>
  );
}
