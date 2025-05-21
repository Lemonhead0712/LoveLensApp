import { Card } from "@/components/ui/card"

interface SectionDisplayProps {
  title: string
  content: string
}

export default function SectionDisplay({ title, content }: SectionDisplayProps) {
  // Check if this is the communication styles section
  const isCommunicationStyles = title.includes("Communication Styles") || title.includes("Emotional Tone")

  // Function to extract subject-specific content
  const extractSubjectContent = (content: string, subject: string) => {
    const paragraphs = content.split("\n")
    // Look for paragraphs that start with or clearly reference the subject
    return paragraphs
      .filter(
        (p) =>
          p.trim().startsWith(`Subject ${subject}`) ||
          p.includes(`Subject ${subject}'s`) ||
          p.includes(`Subject ${subject} `),
      )
      .join("\n")
  }

  // If this is the communication styles section, display in a structured format
  if (isCommunicationStyles) {
    // Try to extract content for each subject
    const subjectAContent = extractSubjectContent(content, "A")
    const subjectBContent = extractSubjectContent(content, "B")

    // If we couldn't clearly separate the subjects, fall back to the original format
    const hasSubjectContent = subjectAContent.length > 0 || subjectBContent.length > 0

    return (
      <Card className="border-gray-200 p-6 shadow-sm h-full">
        <h3 className="mb-4 text-xl font-semibold text-purple-600">{title}</h3>

        {hasSubjectContent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-md">
              <h4 className="font-medium text-purple-700 mb-2">Subject A</h4>
              <div className="prose max-w-none text-sm">
                {subjectAContent ? (
                  subjectAContent.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-2 text-gray-700">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No specific information available</p>
                )}
              </div>
            </div>

            <div className="bg-pink-50 p-4 rounded-md">
              <h4 className="font-medium text-pink-600 mb-2">Subject B</h4>
              <div className="prose max-w-none text-sm">
                {subjectBContent ? (
                  subjectBContent.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-2 text-gray-700">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No specific information available</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Fall back to original format if we couldn't separate the subjects
          <div className="prose max-w-none">
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-3 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </Card>
    )
  }

  // For all other sections, use the original format
  return (
    <Card className="border-gray-200 p-6 shadow-sm h-full">
      <h3 className="mb-4 text-xl font-semibold text-purple-600">{title}</h3>
      <div className="prose max-w-none">
        {content.split("\n").map((paragraph, index) => (
          <p key={index} className="mb-3 text-gray-700">
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  )
}
