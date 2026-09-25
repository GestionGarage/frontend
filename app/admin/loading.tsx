export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48" style={{ backgroundColor: 'rgba(197,160,89,0.1)' }}></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32" style={{ backgroundColor: 'rgba(197,160,89,0.1)' }}></div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl border border-gray-100"></div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="h-96 bg-gray-100 rounded-xl border border-gray-100 mt-6"></div>
    </div>
  );
}
