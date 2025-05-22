import { Shield, BarChart2, Save, History, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccountBenefits() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">Enhance Your Relationship Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a free account to unlock premium features and get the most out of Love Lens.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <Save className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Save Your Analyses</h3>
            <p className="text-gray-600">
              Store all your relationship analyses securely in one place and access them anytime.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Track Progress Over Time</h3>
            <p className="text-gray-600">
              Monitor how your relationship evolves with historical data and trend analysis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Detailed Insights</h3>
            <p className="text-gray-600">
              Get comprehensive reports and personalized recommendations for your relationship.
            </p>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <UserCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Relationship Check-ins</h3>
            <p className="text-gray-600">
              Record your mood and feelings regularly with our check-in feature to maintain awareness of your
              relationship health.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Privacy Protection</h3>
            <p className="text-gray-600">
              Your data is encrypted and securely stored. We never share your personal information or conversation
              details.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 h-auto text-lg">
              Create Free Account
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
