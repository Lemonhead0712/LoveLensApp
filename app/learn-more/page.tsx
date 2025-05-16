import { EmotionalIntelligenceDiagram } from "@/components/emotional-intelligence-diagram"
import { ScienceDiagram } from "@/components/science-diagram"

export default function LearnMorePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Understanding Emotional Intelligence</h1>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">The Four Components of Emotional Intelligence</h2>

          <div className="mb-8">
            <EmotionalIntelligenceDiagram />
          </div>

          <div className="space-y-6 mt-8">
            <div>
              <h3 className="text-xl font-semibold text-rose-600">1. Perceiving Emotions</h3>
              <p className="mt-2">
                The ability to identify and interpret emotions in faces, pictures, voices, and cultural artifacts. It
                includes the capacity to identify one's own emotions. Perceiving emotions represents a basic aspect of
                emotional intelligence, as it makes all other processing of emotional information possible.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-cyan-600">2. Using Emotions</h3>
              <p className="mt-2">
                The ability to harness emotions to facilitate various cognitive activities, such as thinking and
                problem-solving. The emotionally intelligent person can capitalize fully upon their changing moods in
                order to best fit the task at hand.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-600">3. Managing Emotions</h3>
              <p className="mt-2">
                The ability to regulate emotions in both ourselves and in others. The emotionally intelligent person can
                harness emotions, even negative ones, and manage them to achieve intended goals.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-purple-600">4. Understanding Emotions</h3>
              <p className="mt-2">
                The ability to understand emotional language and to appreciate complicated relationships among emotions.
                It includes the ability to recognize and describe how emotions evolve over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">The Science Behind Emotional Intelligence</h2>
          <div className="mb-6">
            <ScienceDiagram />
          </div>
          <p className="mt-4">
            The Gottman Method is a research-based approach to understanding relationships and emotional intelligence.
            It focuses on nine components of healthy relationships, including building love maps, nurturing fondness and
            admiration, turning towards each other, maintaining a positive perspective, managing conflict, making life
            dreams come true, creating shared meaning, trust, and commitment.
          </p>
        </div>
      </div>
    </main>
  )
}
