import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import ContactForm from "@/components/contact-form"
import { Card } from "@/components/ui/card"
import { Mail, MessageSquare, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">Contact Us</h1>
            <p className="mx-auto max-w-2xl text-gray-600 text-sm md:text-base">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <span>support@lovelens.ai</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span>Live chat available 9 AM - 5 PM EST</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>We typically respond within 24 hours</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <ContactForm />
            </Card>
          </div>
        </div>
      </main>

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <CompactFooter />
      </Suspense>
    </div>
  )
}
