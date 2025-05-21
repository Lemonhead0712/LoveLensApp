import PageLayout from "@/components/page-layout"
import ContactForm from "@/components/contact-form"
import { Mail, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <PageLayout title="Contact Us" description="Get in touch with the Love Lens team">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-4">
              We'd love to hear from you! Whether you have questions about Love Lens, need technical support, or want to
              share your feedback, our team is here to help.
            </p>
            <p>Please use the contact form or reach out to us directly using the contact information provided.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="mr-3 h-5 w-5 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href="mailto:Tvnewsome@hotmail.com" className="text-rose-600 hover:underline">
                    Tvnewsome@hotmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <a href="tel:7274825460" className="text-rose-600 hover:underline">
                    (727) 482-5460
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Response Time</h2>
            <p>
              We strive to respond to all inquiries within 24-48 hours during business days. For urgent matters, please
              contact us by phone.
            </p>
          </section>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </PageLayout>
  )
}
