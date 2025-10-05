import { CompactPageLayout } from "@/components/compact-page-layout"
import ContactForm from "@/components/contact-form"
import { Mail, MessageSquare, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <CompactPageLayout
      title="Contact Us"
      description="Have questions or feedback? We're here to help. Reach out to our team."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Get in Touch</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Whether you have questions about how Love Lens works, need technical support, or want to share feedback,
            we're here to listen. Fill out the form below and we'll get back to you as soon as possible.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Email Support</h3>
                <p className="text-sm text-gray-600">support@lovelens.app</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Live Chat</h3>
                <p className="text-sm text-gray-600">Available 9am-5pm EST</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Response Time</h3>
                <p className="text-sm text-gray-600">Within 24-48 hours</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Send Us a Message</h2>
          <ContactForm />
        </section>
      </div>
    </CompactPageLayout>
  )
}
