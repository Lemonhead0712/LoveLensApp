import { Heart } from "lucide-react"

export default function CompactFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Love Lens
            </h3>
            <span className="text-xs text-gray-500">© {currentYear}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for relationships
          </div>
        </div>
      </div>
    </footer>
  )
}
