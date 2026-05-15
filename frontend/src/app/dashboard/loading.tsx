import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <Skeleton className="h-10 w-48 mb-2 rounded-lg" />
        <Skeleton className="h-5 w-72 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="md:col-span-3 row-span-2 h-[400px] rounded-[2rem]" />
        <Skeleton className="h-[200px] rounded-[2rem]" />
        <Skeleton className="h-[200px] rounded-[2rem]" />
        <Skeleton className="md:col-span-2 h-[150px] rounded-[2rem]" />
      </div>
    </div>
  )
}
