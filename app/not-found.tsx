import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <h2 className="text-2xl font-medium text-gray-600 mt-4">Analysis Not Found</h2>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        The relationship analysis you're looking for doesn't exist or has expired.
      </p>
      <Button asChild className="mt-8 bg-rose-500 hover:bg-rose-600">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
