export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 text-sm font-medium">Loading...</p>
    </div>
  );
}
