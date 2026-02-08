import { IconButton } from "@mui/material";
import type { IconButtonProps } from "@mui/material";

interface AppIconButtonProps extends IconButtonProps {
  children: React.ReactNode;
}

export default function ButtonIcon({ children, ...props }: AppIconButtonProps) {
  return <IconButton {...props}>{children}</IconButton>;
}
