export default function SkeletonCard() {
    return (
        <div className="card p-5 animate-pulse">
            <div className="flex-1">
                <div className="h-6 skeleton-shimmer rounded mb-3 w-3/4"></div>
                <div className="space-y-2">
                    <div className="h-4 skeleton-shimmer rounded w-full"></div>
                    <div className="h-4 skeleton-shimmer rounded w-5/6"></div>
                    <div className="h-4 skeleton-shimmer rounded w-4/6"></div>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="h-6 skeleton-shimmer rounded-full w-20"></div>
                <div className="h-4 skeleton-shimmer rounded w-24"></div>
            </div>
        </div>
    )
}
