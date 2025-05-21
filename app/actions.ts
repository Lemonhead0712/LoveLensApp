"use server"

import { revalidatePath } from "next/cache"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function analyzeConversation(formData: FormData) {
  try {
    // Extract files from FormData more efficiently
    const files: File[] = []
    const filePromises = []

    for (let i = 0; i < 10; i++) {
      const file = formData.get(`file-${i}`) as File
      if (file) {
        files.push(file)
        // Start processing files immediately
        filePromises.push(processFile(file))
      }
    }

    // Wait for all file processing to complete
    const processedTexts = await Promise.all(filePromises)
    const extractedText = Object.fromEntries(processedTexts.map((text, i) => [`screenshot-${i + 1}`, text]))

    // Prepare the prompt while files are being processed
    const prompt = `
      You are Love Lens — a production-grade relationship insight engine.
      
      Analyze the following conversation between Subject A and Subject B.
      
      Your analysis should reflect emotional tone, communication style, conflict patterns, 
      validation dynamics, and attachment-style energies. Your tone must be emotionally 
      fluent — never clinical, never diagnostic. Use warmth, clarity, and honesty.
      
      IMPORTANT CONSTRAINTS:
      - Do NOT quote or paraphrase actual messages
      - Focus only on the emotional and relational patterns
      - Be warm, fair, emotionally literate, and grounded
      - Provide concise, actionable insights
      
      For this demo, create a realistic analysis based on a hypothetical conversation 
      between a couple with some communication challenges but also strengths.
    `

    // Use a more efficient model with a lower temperature for faster response
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.5, // Lower temperature for faster, more deterministic responses
      maxTokens: 1200, // Reduced from 1500 for faster generation
    })

    // For demo purposes, we'll create a structured response
    // In a real app, we would parse the GPT-4 response

    // Sample data for charts
    const emotionalCharacteristics = [
      { category: "Emotional expressiveness", "Subject A": 8, "Subject B": 5 },
      { category: "Vulnerability", "Subject A": 7, "Subject B": 4 },
      { category: "Defensiveness", "Subject A": 6, "Subject B": 8 },
      { category: "Trust", "Subject A": 3, "Subject B": 4 },
      { category: "Emotional regulation", "Subject A": 4, "Subject B": 6 },
    ]

    const conflictStyles = [
      { category: "Direct confrontation", "Subject A": 8, "Subject B": 5 },
      { category: "Withdrawal", "Subject A": 3, "Subject B": 7 },
      { category: "Criticism", "Subject A": 7, "Subject B": 5 },
      { category: "Defensiveness", "Subject A": 6, "Subject B": 8 },
      { category: "Repair attempts", "Subject A": 5, "Subject B": 3 },
    ]

    const loveLanguages = [
      { category: "Words of affirmation", "Subject A": 7, "Subject B": 4 },
      { category: "Quality time", "Subject A": 8, "Subject B": 6 },
      { category: "Physical touch", "Subject A": 6, "Subject B": 5 },
      { category: "Acts of service", "Subject A": 5, "Subject B": 7 },
      { category: "Receiving gifts", "Subject A": 3, "Subject B": 4 },
    ]

    // Parse the GPT response into sections
    const sections = text.split("\n\n").filter((section) => section.trim() !== "")

    const results = {
      extractedText,
      communicationStyles:
        sections[0] ||
        "Subject A communicates with emotional intensity and directness, often expressing frustration and hurt openly. Their communication style shows a desire for clarity and transparency, though sometimes this manifests as accusatory or defensive. They tend to ask direct questions and make clear statements about their feelings and needs.\n\nSubject B's communication style is more measured and reserved, often responding to emotional intensity with brief, controlled statements. They appear to need more space and time to process emotions before engaging, which can come across as withdrawal or dismissal to Subject A. When they do express themselves, it's often with a focus on practical considerations rather than emotional content.",
      recurringPatterns:
        sections[1] ||
        "A clear pursue-withdraw dynamic is evident, with Subject A pursuing connection, answers, and resolution while Subject B withdraws when emotional intensity increases. This creates a cycle where the more Subject A pursues, the more Subject B withdraws, leading to escalating frustration.\n\nTrust issues appear on both sides, with expressions of suspicion about each other's motives. Subject A questions Subject B's intentions regarding dating apps and living arrangements, while Subject B questions Subject A's financial motivations.\n\nBoth partners make assumptions about each other's thoughts and feelings rather than asking directly, creating misunderstandings that fuel conflict. When one partner attempts to clarify, the other often responds defensively rather than with curiosity.",
      reflectiveFrameworks:
        sections[2] ||
        "Attachment patterns suggest Subject A displays anxious attachment behaviors, seeking reassurance and clarity while fearing abandonment. Their intense pursuit of answers and connection, along with expressions of feeling isolated, align with anxious attachment needs.\n\nSubject B shows avoidant attachment tendencies, requesting space and time when emotional intensity increases. Their brief responses and expressions of feeling overwhelmed by the conversation suggest discomfort with emotional intimacy during conflict.\n\nGottman's Four Horsemen are present in their interactions: criticism (both partners make character judgments), defensiveness (both quickly defend rather than listen), and some stonewalling (Subject B's withdrawal). Fortunately, contempt appears minimal, which is a positive sign for the relationship's potential.\n\nLove languages appear misaligned, with Subject A valuing quality time and words of affirmation, while Subject B may prioritize acts of service (offering financial support) and independence.",
      gettingInTheWay:
        sections[3] ||
        "Trust erosion is a significant barrier, with both partners questioning each other's motives rather than assuming good intentions. This creates a defensive atmosphere where genuine connection becomes difficult.\n\nDifferent processing styles create friction, with Subject A needing immediate engagement and resolution while Subject B requires space and time to process emotions. Neither fully recognizes or accommodates the other's emotional needs during conflict.\n\nFinancial stress and living situation uncertainty add external pressure to the relationship, complicating emotional dynamics with practical concerns. These tangible stressors become intertwined with relationship issues, making it difficult to address either clearly.\n\nUnresolved past hurts appear to influence current interactions, with references to previous assumptions and behaviors affecting how they interpret each other's current actions and words.",
      constructiveFeedback:
        sections[4] ||
        "For Subject A: Your emotional courage and willingness to express your needs directly are strengths. Consider that your partner's requests for space aren't necessarily rejection but may be their way of processing emotions to show up more fully in the relationship. When feeling anxious about your partner's intentions, try framing concerns as \"I\" statements rather than assumptions about their motives.\n\nFor Subject B: Your thoughtfulness and desire to maintain boundaries are valuable. However, brief withdrawals without explanation can trigger abandonment fears in your partner. Even a simple \"I need some time to think about this, but I'm not leaving the conversation\" can help maintain connection while honoring your need for space. Consider that your partner's questions may come from a place of seeking security rather than accusation.\n\nFor both: Creating agreements about how to handle conflict before it arises could help break the pursue-withdraw pattern. This might include agreed-upon language for requesting space, timeframes for returning to difficult conversations, and commitments to avoid assumptions about each other's motives.",
      outlook:
        sections[5] ||
        "This relationship shows both significant challenges and meaningful strengths. The absence of contempt and the presence of some repair attempts (expressions of care, apologies) suggest a foundation of respect and affection that could support healing.\n\nReconciliation would require addressing the trust issues directly, possibly with professional support through couples therapy (which Subject A has mentioned). Both partners would need to develop greater understanding of each other's attachment needs and communication styles.\n\nThe practical concerns about living arrangements and finances need clear, separate discussion from the emotional relationship issues. Resolving these practical matters with fairness and transparency could create space for the emotional work of rebuilding trust.\n\nWith committed effort to understand each other's emotional needs and develop new patterns of communication during conflict, this relationship has potential for growth. However, this would require both partners to prioritize understanding over being understood, and to commit to breaking the current cycles of interaction.",
      optionalAppendix:
        sections[6] ||
        "The conversation reveals moments of vulnerability from both partners that could serve as building blocks for connection. Subject A's expression of feeling anxious and Subject B's acknowledgment of caring suggest emotional investment that could be channeled constructively.\n\nBoth partners show capacity for direct communication about needs, which is a strength that could be built upon with better timing and delivery. Learning to express these needs when both are emotionally regulated would likely yield better results.\n\nThe relationship appears to be at a critical decision point regarding both practical arrangements and emotional commitment. This juncture could serve either as a catalyst for significant positive change or as a natural conclusion, depending on both partners' willingness to engage in the challenging work of rebuilding trust and establishing new patterns.",
      emotionalCharacteristics,
      conflictStyles,
      loveLanguages,
      gottmanQuiz: {
        summary:
          "Your Gottman analysis reveals a relationship with significant challenges in building love maps and accepting influence, balanced by some strengths in shared meaning. The relationship shows concerning levels of criticism and defensiveness, with moderate stonewalling and low contempt. Subject A tends to pursue with emotional intensity while Subject B withdraws, creating a classic demand-withdraw pattern that Gottman research identifies as particularly challenging. Your combined scores indicate a relationship at a crossroads, requiring intentional work on communication patterns and emotional safety to rebuild connection.",
        strengths: [
          "Low levels of contempt, indicating basic respect remains",
          "Some attempts at repair during conflict",
          "Willingness to express needs and concerns directly",
          "Shared history and understanding of each other's situations",
          "Some expressions of care and concern for each other's wellbeing",
        ],
        improvements: [
          "Reducing criticism and defensiveness in communications",
          "Developing strategies to break the pursue-withdraw pattern",
          "Building trust regarding each other's motives and intentions",
          "Creating space for both processing styles during conflict",
          "Separating practical concerns from relationship dynamics",
        ],
        principles: [
          {
            id: "maps",
            title: "1. Build Love Maps",
            description:
              "How well you know each other's inner psychological worlds, history, worries, stresses, joys, and hopes.",
            subjectAScore: 5,
            subjectBScore: 4,
            combined: 4.5,
            interpretation:
              "Both partners show some awareness of each other's worlds but make assumptions rather than asking curious questions. There's a tendency to project intentions rather than explore them with openness.",
            recommendations: [
              "Practice asking open-ended questions without assumptions",
              "Update your knowledge of each other's current stresses and hopes",
              "Share daily experiences with each other without judgment",
            ],
          },
          {
            id: "fondness",
            title: "2. Share Fondness and Admiration",
            description: "The amount of affection and respect you show each other.",
            subjectAScore: 4,
            subjectBScore: 5,
            combined: 4.5,
            interpretation:
              "Expressions of fondness and admiration are limited in the conversation, though there are some indications of care. Negative sentiment override may be preventing appreciation from being expressed or received.",
            recommendations: [
              "Begin conversations by expressing appreciation before addressing concerns",
              "Acknowledge positive traits even during disagreements",
              "Create a daily ritual of sharing one thing you appreciate about each other",
            ],
          },
          {
            id: "turning",
            title: "3. Turn Towards Instead of Away",
            description: "How responsive you are to each other's bids for emotional connection.",
            subjectAScore: 6,
            subjectBScore: 3,
            combined: 4.5,
            interpretation:
              "Subject A makes frequent bids for connection that Subject B often misses or turns away from. Subject B's requests for space are sometimes interpreted as rejection rather than a need for processing time.",
            recommendations: [
              "Recognize and acknowledge bids for connection even when you can't fully engage",
              "When needing space, communicate a timeframe for returning to the conversation",
              "Practice small moments of connection daily to build a habit of turning towards",
            ],
          },
          {
            id: "influence",
            title: "4. Accept Influence",
            description:
              "How much you allow your partner to influence your decision making and how open you are to compromise.",
            subjectAScore: 4,
            subjectBScore: 3,
            combined: 3.5,
            interpretation:
              "Both partners show resistance to accepting influence, with rigid positions about living arrangements and relationship terms. There's limited evidence of collaborative problem-solving or willingness to adjust perspectives.",
            recommendations: [
              "Practice saying 'you may have a point' during disagreements",
              "Actively look for areas of agreement before addressing differences",
              "Consider your partner's needs as equally important to your own when making decisions",
            ],
          },
          {
            id: "solvable",
            title: "5. Solve Your Solvable Problems",
            description: "How effectively you resolve conflicts that can be solved.",
            subjectAScore: 3,
            subjectBScore: 4,
            combined: 3.5,
            interpretation:
              "Problem-solving attempts quickly escalate into defensive patterns. Practical issues like living arrangements become entangled with emotional concerns, making resolution difficult.",
            recommendations: [
              "Separate practical problems from relationship dynamics and address them individually",
              "Use softened startup when raising concerns: 'I feel... about... I need...'",
              "Agree on a specific time to discuss one issue at a time, with clear boundaries",
            ],
          },
          {
            id: "gridlock",
            title: "6. Overcome Gridlock",
            description: "How you handle ongoing, perpetual problems in your relationship.",
            subjectAScore: 3,
            subjectBScore: 3,
            combined: 3,
            interpretation:
              "The relationship shows significant gridlock around trust, space needs, and communication styles. Neither partner appears to fully understand the dreams and core needs behind the other's position.",
            recommendations: [
              "Explore the personal meaning and history behind your positions",
              "Identify your non-negotiable needs versus flexible preferences",
              "Create temporary compromises that honor both perspectives while working on deeper understanding",
            ],
          },
          {
            id: "meaning",
            title: "7. Create Shared Meaning",
            description: "How well you understand and honor each other's dreams and create a shared sense of purpose.",
            subjectAScore: 5,
            subjectBScore: 5,
            combined: 5,
            interpretation:
              "There are indications of shared history and some common values, though current conflict has obscured the sense of shared purpose. Both express desire for the relationship to work under certain conditions.",
            recommendations: [
              "Discuss what your relationship means to each of you beyond practical arrangements",
              "Identify values you both share and how they might guide conflict resolution",
              "Create rituals of connection that affirm your relationship identity",
            ],
          },
        ],
        radarData: [
          { principle: "Love Maps", "Subject A": 5, "Subject B": 4 },
          { principle: "Fondness & Admiration", "Subject A": 4, "Subject B": 5 },
          { principle: "Turn Towards", "Subject A": 6, "Subject B": 3 },
          { principle: "Accept Influence", "Subject A": 4, "Subject B": 3 },
          { principle: "Solve Problems", "Subject A": 3, "Subject B": 4 },
          { principle: "Overcome Gridlock", "Subject A": 3, "Subject B": 3 },
          { principle: "Shared Meaning", "Subject A": 5, "Subject B": 5 },
        ],
      },
    }

    revalidatePath("/test")
    return results
  } catch (error) {
    console.error("Error in analyze route:", error)
    return { error: "Failed to analyze conversation" }
  }
}

// Helper function to process a file
async function processFile(file: File): Promise<string> {
  // In a real implementation, this would extract text from the image
  // For demo purposes, return mock text immediately
  return "Sample extracted text from image"
}

export async function exportToWord(results: any) {
  "use server"

  // In a real app, we would generate a Word document using python-docx
  // For this demo, we'll simulate the export with a delay

  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Create a sample response
  return {
    success: true,
    message: "Word document generated successfully",
    downloadUrl: "/sample-document.docx", // In a real app, this would be a real URL
  }
}
