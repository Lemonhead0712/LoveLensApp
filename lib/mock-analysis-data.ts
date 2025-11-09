import type { AnalysisResults } from "@/types/analysis"

export const mockAnalysisResults: AnalysisResults = {
  subjectALabel: "Alex",
  subjectBLabel: "Jordan",
  introductionNote:
    "This analysis is based on mock conversation data and demonstrates the type of insights Love Lens provides. In production, this would be replaced with AI-powered analysis of your actual conversations.",
  overallScore: 78,
  overallRelationshipHealth: {
    score: 78,
    description:
      "Your relationship shows strong foundations with healthy communication patterns and emotional connection. There are some areas for growth, particularly around conflict resolution and emotional expression during stressful moments.",
  },
  communicationStylesAndEmotionalTone: {
    description:
      "The conversation demonstrates a warm, engaged dynamic with both partners actively participating. There's a balance of practical planning and emotional connection, with moments of humor and affection interspersed throughout.",
    emotionalVibeTags: ["Supportive", "Playful", "Caring", "Collaborative"],
    regulationPatternsObserved:
      "Both partners show good emotional regulation, with the ability to shift from practical discussions to emotional support smoothly. There's evidence of co-regulation when one partner seems stressed.",
    messageRhythmAndPacing:
      "Messages flow naturally with good back-and-forth rhythm. Response times are generally quick, indicating engagement and prioritization of the conversation.",
    subjectAStyle:
      "Direct and solution-focused, with occasional bursts of warmth and humor. Tends to lead with practical suggestions.",
    subjectBStyle:
      "More emotionally expressive, often checking in on feelings and adding emotional context to practical discussions.",
  },
  communicationPatterns: {
    personA: {
      style:
        "Alex communicates with clarity and directness, often taking a problem-solving approach. They balance practical concerns with emotional awareness, though they sometimes lead with logic before emotion.",
      strengths: [
        "Clear and direct communication",
        "Takes initiative in planning and decision-making",
        "Uses humor to lighten tense moments",
        "Responsive and engaged in conversations",
      ],
      areasForGrowth: [
        "Could express emotions more explicitly before jumping to solutions",
        "Sometimes moves past emotional moments too quickly",
        "Could ask more follow-up questions about feelings",
      ],
      notableQuotes: [
        "I noticed you seemed stressed earlier, want to talk about it?",
        "Let's figure this out together",
      ],
      communicationTendencies:
        "Alex tends to be the planner and organizer in conversations, often suggesting next steps or solutions. They show care through actions and practical support.",
    },
    personB: {
      style:
        "Jordan communicates with emotional depth and expressiveness, often naming feelings and checking in on the emotional temperature of situations. They bring warmth and vulnerability to conversations.",
      strengths: [
        "Emotionally articulate and expressive",
        "Regularly checks in on partner's feelings",
        "Creates space for vulnerability",
        "Affirms and validates partner's experiences",
      ],
      areasForGrowth: [
        "Could be more direct about practical needs",
        "Sometimes assumes emotional context without stating it",
        "Could balance emotional expression with action steps",
      ],
      notableQuotes: ["I really appreciate you thinking of that", "How are you feeling about everything?"],
      communicationTendencies:
        "Jordan is the emotional anchor in conversations, often bringing awareness to feelings and relational dynamics. They show care through emotional attunement and verbal affirmation.",
    },
    dynamicBetweenThem:
      "Alex and Jordan complement each other well, with Alex providing structure and Jordan providing emotional depth. They've developed a rhythm where Alex often initiates plans and Jordan ensures emotional needs are met. There's mutual respect and appreciation, though they could benefit from occasionally switching roles to build flexibility.",
  },
  emotionalDynamics: {
    positiveIndicators: [
      "Regular expressions of appreciation and gratitude",
      "Humor and playfulness present even during practical discussions",
      "Both partners initiate emotional check-ins",
      "Evidence of active listening and validation",
      "Collaborative problem-solving approach",
    ],
    concerningPatterns: [
      "Occasional tendency to avoid deeper conflict discussions",
      "Some emotional needs expressed indirectly rather than explicitly",
      "Minor imbalance in who initiates difficult conversations",
    ],
    emotionalBalance:
      "The emotional give-and-take is generally balanced, with both partners contributing to the emotional labor of the relationship. Jordan tends to do more emotional processing out loud, while Alex processes internally before sharing. This difference is managed well most of the time, though it can create moments of disconnect.",
    emotionalHighlights: [
      {
        moment: "When Alex noticed Jordan seemed stressed and proactively asked about it",
        significance: "Shows emotional attunement and willingness to create space for vulnerability",
        tone: "positive",
      },
      {
        moment: "Jordan expressing appreciation for Alex's planning efforts",
        significance: "Demonstrates recognition and validation of partner's contributions",
        tone: "positive",
      },
      {
        moment: "Brief moment where a concern was mentioned but not fully explored",
        significance: "Indicates a pattern of conflict avoidance that could benefit from attention",
        tone: "concerning",
      },
    ],
  },
  recurringPatternsIdentified: {
    description: "Several patterns emerge consistently across the conversation, both positive and areas for growth.",
    loopingMiscommunicationsExamples: [
      "Assumptions about plans without explicit confirmation",
      "Emotional subtext not always made explicit",
    ],
    commonTriggersAndResponsesExamples: [
      "When stressed, Alex becomes more solution-focused and less emotionally expressive",
      "When anxious, Jordan seeks more reassurance and emotional connection",
    ],
    repairAttemptsOrEmotionalAvoidancesExamples: [
      "Quick use of humor to move past tension",
      "Changing subject when emotions get intense",
      "Offering practical solutions instead of sitting with feelings",
    ],
    positivePatterns: [
      "Regular check-ins throughout the day",
      "Collaborative decision-making on important matters",
      "Mutual support during stressful times",
      "Shared humor and inside jokes",
    ],
  },
  deeperInsights: [
    {
      title: "Complementary Communication Styles",
      observation:
        "Alex and Jordan have developed complementary communication styles that generally serve them well. Alex's practical, solution-oriented approach balances Jordan's emotional, process-oriented style. However, this complementarity can sometimes lead to role rigidity, where Alex always plays the 'fixer' and Jordan always plays the 'feeler.'",
      category: "communication",
      impact:
        "This dynamic works well for everyday situations but may limit flexibility during major conflicts or life transitions where both partners need to access both practical and emotional modes.",
    },
    {
      title: "Conflict Avoidance Tendency",
      observation:
        "Both partners show a subtle pattern of redirecting away from potential conflict through humor, subject changes, or quick problem-solving. While this keeps the peace in the short term, it may prevent deeper issues from being fully addressed.",
      category: "behavioral",
      impact:
        "Unresolved issues may accumulate over time, potentially leading to larger conflicts or resentment. Building capacity for constructive conflict could strengthen the relationship.",
    },
    {
      title: "Strong Foundation of Mutual Respect",
      observation:
        "Throughout the conversation, there's consistent evidence of mutual respect, appreciation, and genuine liking. Both partners actively work to understand and support each other.",
      category: "relational",
      impact:
        "This strong foundation provides resilience and makes the relationship well-positioned to work through challenges and grow together.",
    },
  ],
  reflectiveFrameworks: {
    description:
      "Looking at your relationship through various psychological and therapeutic frameworks reveals interesting patterns.",
    attachmentEnergies:
      "Alex shows secure attachment with some avoidant tendencies under stress (moving toward problem-solving rather than emotional processing). Jordan shows secure attachment with some anxious tendencies (seeking reassurance and emotional connection when stressed). Overall, both demonstrate secure attachment patterns with minor activation of insecure patterns during stress.",
    loveLanguageFriction:
      "Alex primarily expresses love through Acts of Service and Quality Time, while Jordan expresses love through Words of Affirmation and Physical Touch. This difference is generally navigated well, though each partner could benefit from more intentionally speaking the other's love language.",
    gottmanConflictMarkers:
      "Minimal presence of Gottman's 'Four Horsemen' (criticism, contempt, defensiveness, stonewalling). Some evidence of conflict avoidance, which Gottman identifies as a risk factor. Strong presence of positive sentiment override and repair attempts.",
    emotionalIntelligenceIndicators:
      "Both partners demonstrate good emotional intelligence with self-awareness, empathy, and social skills. Jordan shows particularly strong emotional awareness and expression, while Alex shows strong emotional regulation and practical application of emotional insights.",
  },
  strengthsToGelebrate: [
    {
      strength: "Collaborative Partnership",
      whyItMatters:
        "You approach challenges and decisions as a team, which builds trust and shared ownership of your relationship.",
      examples: [
        "Joint problem-solving on practical matters",
        "Mutual support during stressful times",
        "Shared decision-making process",
      ],
    },
    {
      strength: "Emotional Attunement",
      whyItMatters:
        "You notice and respond to each other's emotional states, creating a sense of being seen and understood.",
      examples: [
        "Proactive check-ins when partner seems stressed",
        "Validation of feelings and experiences",
        "Adjusting communication based on partner's emotional state",
      ],
    },
    {
      strength: "Balanced Communication",
      whyItMatters:
        "Both partners actively participate in conversations and feel heard, preventing resentment and disconnection.",
      examples: [
        "Equal participation in conversations",
        "Both partners initiate discussions",
        "Active listening and engagement from both sides",
      ],
    },
  ],
  growthOpportunities: [
    {
      area: "Conflict Engagement",
      currentPattern:
        "Tendency to avoid or quickly resolve conflicts through humor or problem-solving without fully processing emotions.",
      whyItMatters:
        "Unaddressed conflicts can accumulate and create distance. Learning to engage with conflict constructively can deepen intimacy and prevent resentment.",
      suggestions: [
        "Practice staying with difficult emotions for a few minutes before problem-solving",
        "Use 'I feel' statements to express concerns directly",
        "Schedule regular relationship check-ins to address small issues before they grow",
        "Agree on a signal when you need to have a deeper conversation about something",
      ],
      priority: "high",
    },
    {
      area: "Emotional Expression Balance",
      currentPattern:
        "Jordan does more emotional processing out loud, while Alex processes internally. This can create moments where Jordan feels alone in their feelings.",
      whyItMatters:
        "Balanced emotional expression helps both partners feel connected and understood, preventing one person from carrying the emotional load.",
      suggestions: [
        "Alex: Practice sharing feelings before solutions, even if briefly",
        "Jordan: Give Alex time to process before expecting emotional responses",
        "Both: Explicitly state when you need emotional support vs. practical solutions",
      ],
      priority: "medium",
    },
    {
      area: "Role Flexibility",
      currentPattern: "Alex typically takes the planner/fixer role, while Jordan takes the emotional processor role.",
      whyItMatters:
        "Role rigidity can limit growth and create pressure. Building flexibility allows both partners to develop new skills and share responsibilities more evenly.",
      suggestions: [
        "Occasionally switch roles - Jordan takes lead on planning, Alex initiates emotional conversations",
        "Acknowledge and appreciate when partner steps into a less typical role",
        "Discuss how these roles developed and whether they still serve you",
      ],
      priority: "low",
    },
  ],
  whatsGettingInTheWay: {
    description: "Several subtle patterns may be limiting deeper connection and growth in your relationship.",
    emotionalMismatches:
      "Different emotional processing speeds and styles can create temporary disconnects. Alex's internal processing can leave Jordan feeling shut out, while Jordan's immediate emotional expression can feel overwhelming to Alex at times.",
    communicationGaps:
      "Assumptions about what the other person knows or feels sometimes go unchecked. More explicit communication about needs and expectations could prevent minor misunderstandings.",
    subtlePowerStrugglesOrMisfires:
      "Minimal evidence of power struggles. Occasional moments where one partner's needs take precedence without explicit discussion, but this appears balanced over time.",
    externalStressors:
      "Work stress and life demands occasionally impact communication quality, with both partners having less emotional bandwidth during busy periods.",
  },
  recommendations: [
    {
      title: "Implement Weekly Relationship Check-ins",
      description:
        "Set aside 20-30 minutes each week for a structured conversation about your relationship. Use this time to share appreciations, address small concerns before they grow, and stay aligned on goals and needs. This creates a safe container for addressing issues proactively.",
      priority: "high",
      expectedOutcome:
        "Reduced accumulation of unaddressed issues, increased feeling of being heard and understood, stronger sense of partnership.",
    },
    {
      title: "Practice 'Emotion First, Solution Second'",
      description:
        "When one partner shares a problem or concern, practice a 5-minute rule: spend the first 5 minutes just listening and validating emotions before moving to problem-solving. Ask 'Do you want support or solutions?' before jumping in.",
      priority: "high",
      expectedOutcome:
        "Deeper emotional connection, reduced feeling of being dismissed or misunderstood, more effective problem-solving when it does happen.",
    },
    {
      title: "Develop a Conflict Engagement Ritual",
      description:
        "Create a specific process for engaging with conflicts: set a time, choose a comfortable space, use 'I feel' statements, take breaks if needed, and end with appreciation. Practice with small issues first to build confidence.",
      priority: "medium",
      expectedOutcome:
        "Increased comfort with conflict, better resolution of issues, prevention of conflict avoidance patterns.",
    },
    {
      title: "Explore Each Other's Love Languages",
      description:
        "Take the Love Languages quiz together and discuss how you each prefer to give and receive love. Make a conscious effort to express love in your partner's preferred language, not just your own.",
      priority: "medium",
      expectedOutcome:
        "Increased feeling of being loved and appreciated, more effective expressions of care, deeper understanding of each other.",
    },
  ],
  constructiveFeedback: {
    subjectA: {
      strengths: [
        "Excellent at taking initiative and moving things forward",
        "Reliable and consistent in communication",
        "Good at noticing when partner needs support",
      ],
      gentleGrowthNudges: [
        "Try sharing your feelings before jumping to solutions",
        "Stay with emotional moments a bit longer before moving on",
        "Ask more follow-up questions about your partner's emotional experience",
      ],
      connectionBoosters: [
        "Share more about your internal emotional process",
        "Initiate deeper emotional conversations occasionally",
        "Express vulnerability more explicitly",
      ],
    },
    subjectB: {
      strengths: [
        "Wonderful emotional awareness and expression",
        "Creates safe space for vulnerability",
        "Excellent at validating and affirming partner",
      ],
      gentleGrowthNudges: [
        "Practice being more direct about practical needs",
        "Give partner time to process before expecting emotional responses",
        "Balance emotional expression with action steps sometimes",
      ],
      connectionBoosters: [
        "Take the lead on planning occasionally",
        "Acknowledge your partner's practical contributions more explicitly",
        "Share appreciation for different communication styles",
      ],
    },
    forBoth: {
      sharedStrengths: [
        "Strong mutual respect and appreciation",
        "Good balance of practical and emotional communication",
        "Collaborative approach to challenges",
      ],
      sharedGrowthNudges: [
        "Build capacity for constructive conflict",
        "Make implicit expectations explicit",
        "Practice role flexibility",
      ],
      sharedConnectionBoosters: [
        "Regular relationship check-ins",
        "Shared vulnerability practices",
        "Celebrating small wins together",
      ],
    },
  },
  conversationMetrics: {
    totalMessages: 127,
    messageBalance: {
      personA: 48,
      personB: 52,
    },
    averageMessageLength: {
      personA: 42,
      personB: 38,
    },
    emotionalTone: "Warm and engaged with occasional moments of stress or tension",
    conversationFlow: "Natural back-and-forth with good rhythm and responsiveness",
    engagementLevel: "High - both partners actively participating and responsive",
  },
  visualInsightsData: {
    descriptionForChartsIntro:
      "These visualizations provide a quantitative look at communication patterns and emotional dynamics in your relationship.",
    emotionalCommunicationCharacteristics: [
      { category: "Warmth", "Subject A": 75, "Subject B": 85 },
      { category: "Directness", "Subject A": 85, "Subject B": 70 },
      { category: "Emotional Depth", "Subject A": 65, "Subject B": 90 },
      { category: "Humor", "Subject A": 80, "Subject B": 75 },
      { category: "Vulnerability", "Subject A": 60, "Subject B": 85 },
    ],
    conflictExpressionStyles: [
      { category: "Direct Address", "Subject A": 70, "Subject B": 60 },
      { category: "Avoidance", "Subject A": 40, "Subject B": 45 },
      { category: "Humor Deflection", "Subject A": 55, "Subject B": 50 },
      { category: "Problem-Solving", "Subject A": 85, "Subject B": 65 },
      { category: "Emotional Processing", "Subject A": 55, "Subject B": 80 },
    ],
    validationAndReassurancePatterns: [
      { category: "Verbal Affirmation", "Subject A": 65, "Subject B": 90 },
      { category: "Practical Support", "Subject A": 90, "Subject B": 70 },
      { category: "Emotional Validation", "Subject A": 70, "Subject B": 85 },
      { category: "Physical Affection", "Subject A": 60, "Subject B": 80 },
      { category: "Quality Time", "Subject A": 85, "Subject B": 75 },
    ],
    communicationMetrics: {
      responseTimeBalance: 85,
      messageLengthBalance: 92,
      emotionalDepth: 75,
      conflictResolution: 68,
      affectionLevel: 82,
    },
  },
  professionalInsights: {
    attachmentTheoryAnalysis: {
      subjectA: {
        primaryAttachmentStyle: "Secure with Avoidant tendencies under stress",
        attachmentBehaviors: [
          "Generally comfortable with intimacy and independence",
          "Tends toward self-reliance when stressed",
          "May withdraw emotionally during conflict",
        ],
        triggersAndDefenses:
          "Triggered by feeling emotionally overwhelmed or pressured for immediate emotional responses. Defense mechanism is to retreat into problem-solving mode.",
      },
      subjectB: {
        primaryAttachmentStyle: "Secure with Anxious tendencies under stress",
        attachmentBehaviors: [
          "Comfortable with intimacy and emotional expression",
          "Seeks reassurance when anxious",
          "May pursue connection more actively during stress",
        ],
        triggersAndDefenses:
          "Triggered by emotional distance or perceived withdrawal. Defense mechanism is to increase emotional expression and connection-seeking.",
      },
      dyad: "This is a secure-secure pairing with complementary stress responses. The key is recognizing when stress activates insecure patterns and having strategies to return to secure functioning.",
    },
    traumaInformedObservations: {
      identifiedPatterns: [
        "Conflict avoidance may indicate past experiences where conflict was unsafe",
        "Strong co-regulation capacity suggests secure early attachment experiences",
        "Emotional expression differences may reflect different family-of-origin norms",
      ],
      copingMechanisms:
        "Both partners use adaptive coping mechanisms (humor, problem-solving, emotional expression) with minimal evidence of maladaptive patterns.",
      safetyAndTrust:
        "High levels of safety and trust evident in the relationship. Both partners feel secure enough to be vulnerable, though there's room to deepen this further.",
    },
    therapeuticRecommendations: {
      immediateInterventions: [
        "Implement structured communication practices for addressing conflicts",
        "Practice emotion-focused conversations without problem-solving",
        "Develop awareness of attachment pattern activation",
      ],
      longTermGoals: [
        "Build capacity for constructive conflict engagement",
        "Increase role flexibility and emotional range for both partners",
        "Deepen vulnerability and emotional intimacy",
      ],
      suggestedModalities: [
        "Emotionally Focused Therapy (EFT) for deepening attachment security",
        "Gottman Method for conflict management skills",
        "Imago Relationship Therapy for understanding childhood patterns",
      ],
      contraindications: [
        "No evidence of abuse, manipulation, or severe dysfunction",
        "No indication that individual therapy is needed before couples work",
        "Relationship appears stable enough for growth-focused work",
      ],
    },
    clinicalExercises: {
      communicationExercises: [
        {
          title: "Speaker-Listener Technique",
          description:
            "Take turns being speaker and listener. Speaker shares using 'I' statements, listener reflects back what they heard before responding. Switch roles after 5 minutes.",
          frequency: "2-3 times per week, especially during disagreements",
        },
        {
          title: "Appreciation Practice",
          description:
            "Each day, share one specific thing you appreciate about your partner and why it matters to you. Be specific and genuine.",
          frequency: "Daily, ideally at the same time each day",
        },
        {
          title: "Conflict Debrief",
          description:
            "After any disagreement, take 10 minutes to discuss what went well, what could improve, and what each person needs going forward.",
          frequency: "After each significant disagreement",
        },
      ],
      emotionalRegulationPractices: [
        {
          title: "Emotion Naming",
          description:
            "Throughout the day, practice naming your emotions to yourself and your partner. Use specific emotion words beyond 'good' or 'bad.'",
          frequency: "Daily, multiple times",
        },
        {
          title: "Pause and Breathe",
          description:
            "When feeling activated, take 3 deep breaths before responding. Signal to your partner that you're taking a moment.",
          frequency: "As needed during tense moments",
        },
        {
          title: "Emotional Check-in",
          description:
            "Set aside 5 minutes each evening to share your emotional state and any needs you have. No problem-solving, just sharing and listening.",
          frequency: "Daily",
        },
      ],
      relationshipRituals: [
        {
          title: "Weekly Connection Time",
          description:
            "Dedicate 1-2 hours each week to quality time together without distractions. Alternate who plans the activity.",
          frequency: "Weekly",
        },
        {
          title: "Morning or Evening Ritual",
          description:
            "Create a brief daily ritual (coffee together, evening walk, bedtime chat) that's just for connection.",
          frequency: "Daily",
        },
        {
          title: "Monthly Relationship Review",
          description:
            "Once a month, discuss what's working well, what needs attention, and goals for the coming month. Celebrate progress.",
          frequency: "Monthly",
        },
      ],
    },
    prognosis: {
      shortTerm:
        "Excellent. The relationship has strong foundations and both partners are engaged. With some focused work on conflict engagement and emotional expression, expect continued growth and deepening connection.",
      mediumTerm:
        "Very positive. As you build skills in areas identified for growth, expect increased intimacy, better conflict resolution, and greater relationship satisfaction. The main risk is complacency - continuing to invest in the relationship will be key.",
      longTerm:
        "Strong potential for a deeply satisfying, resilient partnership. The secure attachment base and mutual respect provide excellent foundation for navigating life transitions and challenges together.",
      riskFactors: [
        "Conflict avoidance pattern could lead to accumulated resentment if not addressed",
        "Role rigidity might limit growth and create pressure over time",
        "External stressors could activate insecure attachment patterns",
      ],
      protectiveFactors: [
        "Strong mutual respect and appreciation",
        "Good communication foundation",
        "Willingness to work on the relationship",
        "Secure attachment base",
        "Complementary strengths",
      ],
    },
    differentialConsiderations: {
      individualTherapyConsiderations:
        "No immediate indication that individual therapy is needed, though it could be beneficial for exploring personal attachment patterns and family-of-origin influences on current relationship dynamics.",
      couplesTherapyReadiness:
        "Highly ready for couples therapy if desired. Both partners show good insight, willingness to grow, and absence of severe dysfunction. Therapy could accelerate growth and provide tools for long-term success.",
      externalResourcesNeeded: [
        "Books: 'Hold Me Tight' by Sue Johnson, 'The Seven Principles for Making Marriage Work' by John Gottman",
        "Apps: Lasting, Paired, or similar relationship apps for daily practices",
        "Workshops: Consider a couples communication workshop or Gottman weekend intensive",
      ],
    },
  },
  summary:
    "Alex and Jordan have a strong, healthy relationship with excellent foundations in mutual respect, communication, and emotional connection. Their complementary styles - Alex's practical, solution-focused approach and Jordan's emotional, process-oriented style - generally serve them well. Key strengths include collaborative partnership, emotional attunement, and balanced participation. Primary growth opportunities involve building capacity for constructive conflict engagement, balancing emotional expression styles, and developing role flexibility. With focused attention on these areas, this relationship has excellent potential for continued growth and deepening intimacy.",
  openingThoughts:
    "What strikes me most about your relationship is the genuine warmth and respect that flows through your conversations. You've built something really special - a partnership where both people feel valued and heard. There's a lovely balance of practical collaboration and emotional connection, with moments of humor and affection woven throughout. At the same time, I notice some patterns that, while not problematic now, could benefit from attention to prevent future challenges. The good news is that you have all the ingredients for addressing these: mutual respect, good communication skills, and what appears to be a genuine commitment to each other's wellbeing and growth.",
  outlook:
    "The outlook for your relationship is very positive. You have strong foundations and the willingness to grow together. The areas identified for growth are common and addressable with focused effort. By building skills in conflict engagement, balancing emotional expression, and maintaining flexibility in your roles, you can deepen your connection and build even greater resilience. The key is to stay proactive - don't wait for problems to grow before addressing them. Regular relationship maintenance through check-ins, intentional practices, and continued investment in your connection will serve you well.",
  closingThoughts:
    "Relationships are living things that need tending, and you're both clearly invested in that work. The fact that you're seeking this kind of analysis shows your commitment to understanding and improving your dynamic. Remember that growth isn't always linear - there will be moments of challenge and regression, and that's normal. What matters is your overall trajectory and your willingness to keep showing up for each other. Celebrate your strengths, approach your growth areas with curiosity rather than criticism, and remember that the goal isn't perfection - it's connection, understanding, and mutual support through all of life's ups and downs. You're doing great, and with continued attention and care, your relationship can continue to flourish.",
  optionalAppendix:
    "This analysis is based on mock data and serves as a demonstration of the type of insights Love Lens provides. In a real analysis, all observations would be drawn from your actual conversation screenshots, with specific examples and quotes from your exchanges. The framework and depth of analysis shown here represents what you can expect from the full Love Lens experience.",
  keyTakeaways: [
    "Your relationship has strong foundations in mutual respect, communication, and emotional connection",
    "Complementary communication styles (practical vs. emotional) generally serve you well but could benefit from more flexibility",
    "Primary growth opportunity: building capacity for constructive conflict engagement rather than avoidance",
    "Both partners show secure attachment with minor activation of insecure patterns under stress",
    "Regular relationship maintenance through check-ins and intentional practices will support continued growth",
    "The relationship is well-positioned for long-term success with continued investment and attention",
  ],
  messageCount: 127,
  screenshotCount: 8,
  extractionConfidence: 95,
  processingTimeMs: 2500,
}

export function getMockAnalysisResults(): AnalysisResults {
  return mockAnalysisResults
}
