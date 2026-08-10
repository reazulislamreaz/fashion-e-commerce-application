type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center"
    >
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <p className="max-w-md text-sm text-stone-600">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 cursor-pointer"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
