type EmptyStateProps = {
  title?: string;
  message: string;
};

export function EmptyState({
  title = 'Nothing here yet',
  message,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 text-center">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <p className="max-w-md text-sm text-stone-600">{message}</p>
    </div>
  );
}
