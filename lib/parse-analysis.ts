export function parseAnalysisData(analysisText: string) {
  // In a real implementation, this would parse the analysis text
  // to extract structured data for the different sections

  // For demo purposes, we'll return sample data
  return {
    communicationStyles: `
      <ul>
        <li><strong>Subject A:</strong> Tends to communicate with logical, measured responses. Often takes time to process emotions before responding, creating a steady but sometimes delayed communication rhythm.</li>
        <li><strong>Subject B:</strong> Communicates with emotional immediacy and expressiveness. Seeks validation through frequent check-ins and reassurance-seeking questions.</li>
        <li><strong>Pacing:</strong> Noticeable mismatch in response timing—Subject B often sends multiple messages before Subject A responds with a single, comprehensive reply.</li>
        <li><strong>Regulation:</strong> Subject A tends to withdraw when emotional intensity increases, while Subject B tends to pursue with increasing urgency.</li>
      </ul>
    `,

    recurringPatterns: `
      <ul>
        <li><strong>Pursue-Withdraw Cycle:</strong> Subject B expresses needs or concerns with emotional intensity, Subject A feels overwhelmed and creates distance, which triggers more urgent pursuit from Subject B.</li>
        <li><strong>Mismatched Emotional Processing:</strong> Subject A processes internally before responding, which Subject B sometimes interprets as disinterest or dismissal.</li>
        <li><strong>Repair Attempts:</strong> Subject B makes frequent emotional repair attempts through questions and reassurance-seeking. Subject A attempts repair through practical solutions and logical explanations.</li>
        <li><strong>Tone Misinterpretation:</strong> Subject A's concise responses are sometimes read as cold or dismissive by Subject B, while Subject B's emotional expressions can feel overwhelming to Subject A.</li>
      </ul>
    `,

    attachmentStyles: `
      <ul>
        <li><strong>Subject A:</strong> Shows avoidant-leaning tendencies—values independence, processes emotions privately, and may withdraw when feeling emotionally pressured.</li>
        <li><strong>Subject B:</strong> Displays anxious-seeking behaviors—desires frequent reassurance, worries about the relationship status, and becomes more activated when receiving less communication.</li>
        <li><strong>Dynamic:</strong> Classic anxious-avoidant dance where one partner's need for space triggers the other's need for closeness, creating a self-reinforcing cycle.</li>
      </ul>
    `,

    loveLanguages: `
      <ul>
        <li><strong>Subject A:</strong> Expresses care through acts of service and practical problem-solving. Values consistency and reliability over intense emotional expressions.</li>
        <li><strong>Subject B:</strong> Prioritizes words of affirmation and emotional availability. Seeks verbal reassurance and explicit expressions of feelings.</li>
        <li><strong>Mismatch:</strong> Subject A's practical expressions of care may not register as emotional connection for Subject B, while Subject B's need for verbal affirmation may feel demanding to Subject A.</li>
      </ul>
    `,

    gottmanBehaviors: `
      <ul>
        <li><strong>Criticism:</strong> Subject B occasionally frames concerns as character flaws in Subject A ("you never tell me how you feel").</li>
        <li><strong>Defensiveness:</strong> Both partners show defensiveness when feeling misunderstood—Subject A through logical explanations, Subject B through emotional intensification.</li>
        <li><strong>Stonewalling:</strong> Subject A shows signs of emotional withdrawal when conversations become intense.</li>
        <li><strong>Repair Attempts:</strong> Both make repair attempts in their own languages—practical solutions (Subject A) and emotional reconnection efforts (Subject B).</li>
      </ul>
    `,

    obstacles: `
      <ul>
        <li><strong>Emotional Expression Gap:</strong> Different vocabularies and comfort levels with emotional expression create misunderstandings.</li>
        <li><strong>Reassurance Asymmetry:</strong> Subject B requires more frequent reassurance than Subject A naturally provides.</li>
        <li><strong>Processing Speed Mismatch:</strong> Subject A needs time to process emotions internally, while Subject B processes through external expression.</li>
        <li><strong>Indirect Communication:</strong> Both sometimes hint at needs rather than stating them directly, leading to missed connections.</li>
      </ul>
    `,

    subjectAStrengths: `
      <ul>
        <li>Provides stability and consistency in communication</li>
        <li>Offers thoughtful, measured responses when given processing time</li>
        <li>Demonstrates commitment through practical actions and problem-solving</li>
        <li>Maintains emotional equilibrium during challenging conversations</li>
      </ul>
    `,

    subjectAGrowth: `
      <ul>
        <li>May unintentionally create emotional distance through delayed responses</li>
        <li>Could be more explicit about needing processing time</li>
        <li>Sometimes prioritizes logical solutions over emotional validation</li>
      </ul>
    `,

    subjectABoosters: `
      <ul>
        <li>Brief acknowledgment messages when needing processing time</li>
        <li>Occasional unprompted expressions of appreciation or affection</li>
        <li>Validating emotions before offering solutions</li>
      </ul>
    `,

    subjectBStrengths: `
      <ul>
        <li>Creates emotional openness and vulnerability in the relationship</li>
        <li>Actively initiates repair after disconnections</li>
        <li>Clearly expresses needs and feelings</li>
        <li>Shows consistent interest in the relationship's emotional health</li>
      </ul>
    `,

    subjectBGrowth: `
      <ul>
        <li>May overwhelm with the volume and intensity of messages when anxious</li>
        <li>Sometimes interprets delayed responses as rejection</li>
        <li>Could frame concerns as observations rather than criticisms</li>
      </ul>
    `,

    subjectBBoosters: `
      <ul>
        <li>Recognizing when partner needs processing time</li>
        <li>Acknowledging practical acts as expressions of care</li>
        <li>Condensing multiple messages into single, clear communications</li>
      </ul>
    `,

    outlook: `
      <p>With awareness of their different emotional languages, this relationship shows strong potential for deeper connection. If Subject A can offer more frequent verbal reassurance and Subject B can recognize practical actions as expressions of care, their communication gap would narrow significantly. The foundation of commitment is evident—both partners are actively trying to connect, just through different channels. Small adjustments in expression and reception could transform their interaction pattern from occasionally frustrating to mutually fulfilling.</p>
    `,

    appendix: `
      <h4>Emotional Looping Notes</h4>
      <p>The conversation shows a recurring pattern where emotional intensity builds, peaks, then resolves temporarily before beginning again. These loops typically start with Subject B expressing a concern, escalate through misunderstanding, and resolve when Subject A provides the reassurance needed.</p>
      
      <h4>Responsibility Imbalance</h4>
      <p>Subject B appears to carry more of the emotional maintenance work in the relationship, while Subject A contributes more through practical support and stability. Recognizing and valuing both forms of contribution could help balance perceived responsibility.</p>
    `,
  }
}
