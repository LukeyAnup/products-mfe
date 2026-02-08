import CircularProgress from "@mui/material/CircularProgress";

interface LoaderProps {
  size?: number;
  className?: string;
}

export default function Loader({ size = 40, className = "" }: LoaderProps) {
  return (
    <div
      className={`flex items-center justify-center w-full h-[70vh] ${className}`}
    >
      <CircularProgress size={size} />
    </div>
  );
}
