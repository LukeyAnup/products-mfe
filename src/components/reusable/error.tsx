import ButtonComponent from "./button";

interface ErrorStateProps {
  message: string | null;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorComponent({
  message,
  onRetry,
  retryText = "Retry",
}: ErrorStateProps) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{message}</p>

        {onRetry && <ButtonComponent onClick={onRetry} text={retryText} />}
      </div>
    </div>
  );
}
