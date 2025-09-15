interface ErrorProps {
  message?: string;
}

export function Error({ 
  message = "Something went wrong. Please try again later."
}: ErrorProps) {
  return (
    <div className="flex items-center justify-center p-50">
      <div className="max-w-md w-full mx-auto rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 w-full">
            <div className="text-sm text-red-700">
              <p>{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
