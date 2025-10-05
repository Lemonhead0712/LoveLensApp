import { Card, CardContent } from "@mui/material"
import { MessageSquare, Heart, TrendingUp, Users } from "react-feather"

const EnhancedAnalysisResults = ({ totalMessages, avgSentiment, healthScore, balanceRatio }) => {
  return (
    <div>
      {/* Quick Insights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5 truncate">Total Messages</p>
                <p className="text-xl font-bold text-gray-900 truncate">{String(totalMessages)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5 truncate">Avg Sentiment</p>
                <p className="text-xl font-bold text-gray-900 truncate">{avgSentiment}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5 truncate">Health Score</p>
                <p className="text-xl font-bold text-gray-900 truncate">{healthScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5 truncate">Balance</p>
                <p className="text-xl font-bold text-gray-900 truncate">{balanceRatio}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional components can be added here */}
    </div>
  )
}

export default EnhancedAnalysisResults
