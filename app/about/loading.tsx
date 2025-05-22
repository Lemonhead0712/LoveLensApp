import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <div className="h-16 bg-white border-b border-gray-200"></div>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <Card className="mb-8 border-gray-200 p-4 md:p-6 shadow-md">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <section key={i} className="mb-6">
                  <Skeleton className="h-6 w-48 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </section>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <div className="h-16 bg-gray-100"></div>
    </div>
  )
}
