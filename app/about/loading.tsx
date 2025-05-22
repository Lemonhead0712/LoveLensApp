import { Skeleton } from "@/components/ui/skeleton"
import CompactPageLayout from "@/components/compact-page-layout"

export default function AboutLoading() {
  return (
    <CompactPageLayout
      title="About Love Lens"
      description="Learn about our mission, vision, and the team behind Love Lens"
    >
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <section key={i} className="mb-6">
            <Skeleton className="h-8 w-48 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </section>
        ))}
      </div>
    </CompactPageLayout>
  )
}
