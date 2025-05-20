import CommunicationStyleReflection from "@/components/reflections/communication-style-reflection"
import CompatibilityReflection from "@/components/reflections/compatibility-reflection"
import EmotionalIntelligenceReflection from "@/components/reflections/emotional-intelligence-reflection"
import ImprovementPlan from "@/components/reflections/improvement-plan"
import PsychologyReflection from "@/components/reflections/psychology-reflection"
import RelationshipDynamicsReflection from "@/components/reflections/relationship-dynamics-reflection"

export default function ReflectionsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Reflections</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Communication Style Reflection</h2>
        <CommunicationStyleReflection />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Compatibility Reflection</h2>
        <CompatibilityReflection />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Emotional Intelligence Reflection</h2>
        <EmotionalIntelligenceReflection />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Psychology Reflection</h2>
        <PsychologyReflection />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Relationship Dynamics Reflection</h2>
        <RelationshipDynamicsReflection />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Improvement Plan</h2>
        <ImprovementPlan />
      </section>
    </div>
  )
}
