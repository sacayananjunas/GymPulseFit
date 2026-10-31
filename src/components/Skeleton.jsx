// Glass-style loading placeholders.

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function SkeletonCard({ className = '', children }) {
  return (
    <div className={`glass relative overflow-hidden p-5 sm:p-6 ${className}`} aria-hidden>
      {children ?? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </>
      )}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-5 lg:grid-cols-3">
        <SkeletonCard className="h-56 lg:col-span-2" />
        <SkeletonCard className="h-56" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} className="flex h-48 items-center justify-center">
            <Skeleton className="h-24 w-24 !rounded-full sm:h-32 sm:w-32" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}
