export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-light-bg rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
