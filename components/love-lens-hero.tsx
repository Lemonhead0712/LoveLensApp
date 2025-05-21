import { Heart } from "lucide-react"

export function LoveLensHero() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-rose-100 p-3 rounded-full">
          <Heart className="h-8 w-8 text-rose-500" />
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Love Lens</h1>
      <p className="mt-3 text-xl text-gray-500 sm:mt-4">
        Relationship insight engine that analyzes conversations and provides emotional clarity
      </p>
      <div className="mt-6 max-w-2xl mx-auto">
        <p className="text-gray-600">
          Upload screenshots of conversations between two people in a relationship. Our AI will analyze communication
          patterns, emotional tones, and relationship dynamics to provide insights without judgment or advice.
        </p>
      </div>
    </div>
  )
}
