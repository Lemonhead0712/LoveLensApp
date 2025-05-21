export default function LoadingAnalysis() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
      <h2 className="text-lg font-semibold text-purple-600 mb-1">Analyzing Your Conversation</h2>
      <p className="text-gray-600 text-center text-sm max-w-md">
        Our AI is examining the emotional patterns and relationship dynamics. This may take a minute.
      </p>
    </div>
  )
}
