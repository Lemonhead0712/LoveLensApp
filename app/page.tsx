import { UploadForm } from "@/components/upload-form"
import { LoveLensHero } from "@/components/love-lens-hero"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <LoveLensHero />
        <div className="mt-12">
          <UploadForm />
        </div>
      </div>
    </main>
  )
}
