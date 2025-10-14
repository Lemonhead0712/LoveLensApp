# Love Lens Analysis System - Product Requirements Document

## 1. Overview

**Product Name:** Love Lens Relationship Communication Analysis  
**Version:** 2.0  
**Last Updated:** January 2025

### Purpose
Love Lens analyzes relationship conversations from screenshots to provide evidence-based insights about communication patterns, emotional dynamics, and relationship health using established psychological frameworks including the Gottman Method, attachment theory, and emotional intelligence research.

### Core Philosophy
- **Empathetic & Non-judgmental:** No blame assignment; both partners' contributions acknowledged
- **Evidence-based:** Grounded in psychological research and clinical frameworks
- **Balanced:** Identifies both strengths and growth areas
- **Actionable:** Provides specific, constructive guidance
- **Privacy-first:** Local processing, no data storage, one-time use

---

## 2. Analysis Methodology

### 2.1 Input Processing

**Accepted Input:**
- 1-10 conversation screenshots (PNG, JPG, JPEG, WEBP)
- Maximum 10MB per file
- Text-based conversations (iMessage, WhatsApp, SMS, etc.)

**Processing Pipeline:**
1. **Image Enhancement** (automatic)
   - Contrast enhancement
   - Sharpening
   - Noise reduction
   - Resolution normalization
   
2. **OCR Extraction** (batch processing)
   - GPT-4o Vision API for text extraction
   - Speaker identification with consistent labels
   - Chronological message ordering
   - Timestamp detection (if visible)
   - Platform identification
   - Emotional tone markers (emojis, punctuation)
   - Retry logic with graceful fallback

3. **Text Normalization**
   - Speaker label standardization
   - Message deduplication
   - Chronological sorting
   - Metadata extraction

### 2.2 Pattern Detection Algorithms

#### A. Punctuation Analysis
Interprets emotional meaning from text formatting:

- **Periods (.)** → Seriousness, tension, emotional distance
- **Exclamation marks (!)** → Enthusiasm, connection, intensity
- **Ellipses (…)** → Hesitation, uncertainty, exhaustion
- **Question marks (?)** → Curiosity or concern
  - Multiple (??) → Frustration, urgency
- **ALL CAPS** → Emotional intensity, anger, excitement
- **Lack of punctuation** → Comfort, fatigue, or detachment

#### B. Message Style Analysis
Evaluates communication patterns:

- **Brief messages** (< 10 words) → Potential emotional shutdown, anxiety, or comfort
- **Expressive messages** (> 30 words) → Emotional engagement, explanation attempts
- **One-word replies** → Emotional withdrawal, overwhelm, or casual comfort
- **Rapid-fire sequences** (< 30 seconds apart) → Anxious pursuit, flooding
- **Long pauses** (> 2 hours) → Stonewalling, processing time, emotional flooding

#### C. Emotional Tone Detection
Identifies underlying emotional states:

**Warmth Indicators:**
- "love you", "miss you", "thinking of you"
- Heart emojis, affectionate language
- Appreciation expressions
- Supportive statements

**Tension Indicators:**
- Short, clipped responses
- Periods after brief messages
- Lack of warmth markers
- Defensive language

**Fatigue Indicators:**
- Ellipses, minimal responses
- Delayed responses
- Lack of engagement
- "fine", "whatever", "ok"

**Enthusiasm Indicators:**
- Exclamation marks
- Emojis (positive)
- Longer, engaged messages
- Questions showing interest

**Distance Indicators:**
- Formal language
- Lack of personal pronouns
- Minimal emotional content
- One-word responses

#### D. Gottman's Four Horsemen Detection

**1. Criticism** (vs. Complaint)
- "You always...", "You never..."
- Character attacks vs. specific concerns
- Generalizations about partner's personality
- Blame language

**2. Contempt** (Most destructive)
- Sarcasm, mockery, name-calling
- Eye-roll language ("seriously?", "oh please")
- Superiority expressions
- Hostile humor
- Dismissive statements

**3. Defensiveness**
- "Yes, but..." responses
- Counter-complaints
- Playing victim
- Making excuses
- Denying responsibility

**4. Stonewalling**
- One-word responses ("fine", "whatever", "ok")
- Sudden silence after engagement
- Refusal to engage
- Emotional withdrawal

#### E. Profanity & Emotional Intensity
Tracks emotional escalation:

- **Profanity detection** → Frustration, loss of control, intensity
- **Intensity scoring** → Combination of caps, punctuation, profanity
- **Escalation patterns** → Increasing intensity over time
- **De-escalation attempts** → Calming language after intensity

#### F. Repair Attempts & Rejection
Evaluates conflict resolution:

**Repair Attempts:**
- Apologies ("I'm sorry", "I apologize")
- Acknowledgment ("You're right", "I understand")
- Responsibility ("I'll work on", "Let me try")
- Appreciation ("Thank you for", "I appreciate")
- Humor (appropriate, not hostile)
- Affection ("I love you", "I care about you")

**Repair Rejection:**
- Dismissing apologies
- Continuing criticism after repair
- Ignoring repair attempts
- Escalating after de-escalation attempt

#### G. Emotional Bids & Responses
Tracks connection attempts:

**Bid Types:**
- Questions about feelings/day
- Sharing personal information
- Requests for attention/support
- Attempts at humor/playfulness

**Response Types:**
- **Turning Toward** → Engaged, supportive response
- **Turning Away** → Ignoring, minimal response
- **Turning Against** → Hostile, dismissive response

#### H. Validation vs. Invalidation
Measures emotional attunement:

**Validation:**
- "I understand", "That makes sense"
- Reflecting feelings
- Acknowledging perspective
- Empathetic responses

**Invalidation:**
- "You're overreacting", "It's not a big deal"
- Dismissing feelings
- Minimizing concerns
- Changing subject

#### I. Accountability Analysis
Evaluates responsibility-taking:

**Taking Responsibility:**
- Owning mistakes
- Apologizing without "but"
- Acknowledging impact
- Committing to change

**Blaming:**
- Deflecting responsibility
- Pointing to partner's faults
- Making excuses
- Justifying behavior

#### J. Emotional Labor Assessment
Identifies relationship work distribution:

**Emotional Labor Indicators:**
- Who initiates difficult conversations
- Who apologizes more frequently
- Who validates more often
- Who pursues vs. withdraws
- Who does emotional processing work

---

## 3. Scoring Systems

### 3.1 Overall Relationship Health Score (0-10)

**Calculation:**
\`\`\`
Overall Score = (Harmony Score + Emotional Safety Score + Repair Effort Score) / 30
\`\`\`

**Components:**
- **Harmony Score** (0-100): Balance of positive vs. negative interactions, message balance, emotional tone
- **Emotional Safety Score** (0-100): Validation, support, absence of contempt, emotional attunement
- **Repair Effort Score** (0-100): Repair attempts, effectiveness, timing, and acceptance

**Contextual Weighting:**
The system applies contextual adjustments based on:
- Emotional flow state (connection, tension, repair, escalation, shutdown, calm)
- Presence of humor or lightness
- Silence patterns and timing gaps
- Accountability demonstrated by either partner
- Emotional flooding indicators

### 3.2 Analysis Confidence Calculation

**New Approach (v2.5):**
Confidence reflects the system's ability to analyze observable patterns from available data, NOT knowledge of the complete relationship context.

**Pattern Recognition Quality:**
- Minimum 3 messages per person = sufficient for pattern analysis
- Text length threshold: 200 characters = good analysis capability (reduced from 500)
- Pattern bonus: +20 points when sufficient messages exist

**Extraction Confidence:**
\`\`\`
textAnalysisQuality = min(100, (conversationText.length / 200) * 100)
messageBalance = (min(subjectA, subjectB) / max(subjectA, subjectB)) * 100
patternBonus = hasPatternData ? 20 : 0
extractionConfidence = min(100, round((textAnalysisQuality + messageBalance) / 2) + patternBonus)
\`\`\`

**Emotional Inference Confidence:**
\`\`\`
baseEmotionalConfidence = (subjectAMotivation.confidence + subjectBMotivation.confidence) / 2
emotionalInferenceConfidence = min(100, baseEmotionalConfidence + 15)
\`\`\`

**Data Completeness Thresholds:**
- **High** (>60%): "Strong pattern recognition capability—analysis provides reliable insights into communication dynamics, emotional patterns, and relationship behaviors observable in the conversation."
- **Medium** (>35%): "Good pattern analysis capability—insights accurately reflect observable communication patterns and emotional dynamics, though additional context may deepen understanding."
- **Low** (≤35%): "Basic pattern analysis capability—insights identify key communication patterns and emotional themes present in the conversation."

### 3.3 Communication Metrics (0-100)

**Response Time Balance:**
\`\`\`
Balance = 100 - |Subject A Response Time - Subject B Response Time|
\`\`\`

**Message Length Balance:**
\`\`\`
Balance = 100 - |Subject A Avg Length - Subject B Avg Length|
\`\`\`

**Emotional Depth:**
\`\`\`
Depth = (Warmth + Vulnerability + Engagement) / 3
\`\`\`

**Conflict Resolution:**
\`\`\`
Resolution = (Repair Attempts - Repair Rejections + Accountability) / 3
\`\`\`

**Affection Level:**
\`\`\`
Affection = (Warmth Markers + Positive Emojis + Affectionate Language) / 3
\`\`\`

### 3.4 Emotional Communication Characteristics (0-10)

Radar chart dimensions:
- **Warmth:** Affection, care, positive emotional expression
- **Clarity:** Direct communication, clear expression of needs
- **Responsiveness:** Engagement, timely responses, attentiveness
- **Assertiveness:** Boundary-setting, expressing needs, standing ground
- **Empathy:** Understanding, validation, perspective-taking

### 3.5 Conflict Expression Styles (0-10)

Radar chart dimensions:
- **Direct Address:** Openly discussing issues
- **Avoidance:** Sidestepping conflict, changing subject
- **Compromise:** Finding middle ground, flexibility
- **Escalation:** Increasing intensity, raising stakes
- **Repair Attempts:** De-escalation, apologies, reconnection

### 3.6 Validation & Reassurance Patterns (0-100%)

Pie chart showing distribution:
- **Acknowledges Feelings:** Recognizing partner's emotions
- **Offers Reassurance:** Providing comfort and support
- **Validates Perspective:** Affirming partner's viewpoint
- **Dismisses Concerns:** Minimizing or invalidating
- **Neutral/Unclear:** Ambiguous responses

**Note:** Each subject gets distinct validation patterns based on their actual behavior

---

## 4. Output Structure

### 4.1 Analysis Results Schema

\`\`\`typescript
interface AnalysisResults {
  // Metadata
  subjectALabel: string
  subjectBLabel: string
  analyzedConversationText: string
  messageCount: { subjectA: number; subjectB: number }
  screenshotCount: number
  extractionConfidence: "high" | "medium" | "low"
  emotionalInferenceConfidence: number
  
  // Introduction
  introductionNote: string
  
  // Overall Health
  overallRelationshipHealth: {
    score: number // 0-10
    description: string
  }
  
  // Communication Analysis
  communicationStylesAndEmotionalTone: {
    description: string
    emotionalVibeTags: string[]
    regulationPatternsObserved: string
    messageRhythmAndPacing: string
    subjectAStyle: string
    subjectBStyle: string
  }
  
  // Patterns
  recurringPatternsIdentified: {
    description: string
    positivePatterns: string[]
    loopingMiscommunicationsExamples: string[]
    commonTriggersAndResponsesExamples: string[]
    repairAttemptsOrEmotionalAvoidancesExamples: string[]
  }
  
  // Frameworks
  reflectiveFrameworks: {
    description: string
    attachmentEnergies: string
    loveLanguageFriction: string
    gottmanConflictMarkers: string
    emotionalIntelligenceIndicators: string
  }
  
  // Obstacles
  whatsGettingInTheWay: {
    description: string
    emotionalMismatches: string
    communicationGaps: string
    subtlePowerStrugglesOrMisfires: string
    externalStressors: string
  }
  
  // Feedback
  constructiveFeedback: {
    subjectA: PersonFeedback
    subjectB: PersonFeedback
    forBoth: SharedFeedback
  }
  
  // Visual Data
  visualInsightsData: {
    descriptionForChartsIntro: string
    emotionalCommunicationCharacteristics: ChartData[]
    conflictExpressionStyles: ChartData[]
    validationAndReassurancePatterns: ChartData[]
    communicationMetrics: MetricsData
  }
  
  // Professional Insights
  professionalInsights: {
    attachmentTheoryAnalysis: AttachmentAnalysis
    traumaInformedObservations: TraumaObservations
    therapeuticRecommendations: TherapeuticRecs
    clinicalExercises: ClinicalExercises
    prognosis: Prognosis
    differentialConsiderations: DifferentialConsiderations
  }
  
  // Summary
  outlook: string
  keyTakeaways: string[]
  optionalAppendix: string
}
\`\`\`

### 4.2 Content Guidelines

**Language Principles:**
- Empathetic and nonjudgmental
- Balanced (both partners' contributions acknowledged)
- Specific and evidence-based
- Constructive and actionable
- Avoids clinical jargon where possible
- Uses "may" and "might" to avoid absolute statements

**Example Phrases:**
- "This message may have felt distant or final."
- "It's possible they were emotionally fatigued rather than disengaged."
- "Both partners seem to be reacting to emotional tension differently."
- "This isn't about one person being wrong—it's about two different nervous systems responding to stress."
- "Both moves make sense from each person's perspective."

---

## 5. Psychological Frameworks

### 5.1 Gottman Method
- Four Horsemen (Criticism, Contempt, Defensiveness, Stonewalling)
- Repair attempts and effectiveness
- Positive-to-negative interaction ratio (5:1 ideal)
- Emotional bids and responses
- Conflict management styles

### 5.2 Attachment Theory
- Secure, anxious, avoidant, disorganized patterns
- Protest behaviors (pursuit)
- Deactivating strategies (withdrawal)
- Attachment wounds and triggers
- Secure base and safe haven dynamics

### 5.3 Emotional Intelligence
- Self-awareness (recognizing own emotions)
- Self-regulation (managing emotional responses)
- Social awareness (empathy, perspective-taking)
- Relationship management (communication, conflict resolution)

### 5.4 Polyvagal Theory
- Nervous system states (ventral vagal, sympathetic, dorsal vagal)
- Co-regulation vs. dysregulation
- Safety cues and threat detection
- Emotional flooding and shutdown

### 5.5 Nonviolent Communication (NVC)
- Observations vs. evaluations
- Feelings vs. thoughts
- Needs identification
- Requests vs. demands

---

## 6. Technical Implementation

### 6.1 Architecture

**Frontend:**
- Next.js 14 App Router
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization

**Backend:**
- Next.js Server Actions
- OpenAI GPT-4o Vision API for OCR
- Client-side image processing
- No database (privacy-first)

**Processing Flow:**
\`\`\`
1. User uploads screenshots
2. Automatic image enhancement (client-side)
3. Batch OCR extraction (OpenAI API)
4. Text normalization and parsing
5. Pattern detection algorithms
6. Scoring calculations
7. Analysis generation
8. Results display with visualizations
9. Optional Word document export
\`\`\`

### 6.2 Performance Considerations

**Image Processing:**
- Client-side enhancement to reduce API load
- Batch processing (all images in one API call)
- Retry logic for failed extractions
- Graceful fallback to pattern-based analysis

**Analysis Speed:**
- Target: < 30 seconds for 3-5 screenshots
- Progress indicators with specific steps
- Optimized scoring algorithms
- Cached calculations where possible

**Mobile Optimization:**
- Touch-optimized UI (44px minimum touch targets)
- Swipe gestures for navigation
- Responsive layouts
- Reduced motion support

### 6.3 Privacy & Security

**Data Handling:**
- No server-side storage
- No user accounts required
- No tracking or analytics
- Local image processing
- API calls use ephemeral data
- Results stored only in browser session
- Clear privacy messaging

**Disclaimers:**
- Not a substitute for professional therapy
- Educational and informational purposes only
- Encourages professional help when needed
- Acknowledges limitations of automated analysis

---

## 7. User Experience

### 7.1 Upload Flow

1. **Landing Page**
   - Clear value proposition
   - Privacy assurances
   - "Try with Example" option

2. **Upload Interface**
   - Drag-and-drop or click to upload
   - File preview thumbnails
   - Drag-to-reorder functionality
   - Delete individual files
   - Progress indicators

3. **Subject Names**
   - Two text inputs for partner names
   - Validation (required, non-empty)
   - Mobile-optimized layout

4. **Analysis Progress**
   - Detailed progress steps
   - Estimated time remaining
   - Visual progress bar
   - Engaging loading animation

5. **Results Display**
   - Tabbed interface (Overview, Communication, Patterns, etc.)
   - Swipe navigation on mobile
   - Interactive charts
   - Export to Word option
   - Retry on error

### 7.2 Accessibility

**WCAG 2.1 AA Compliance:**
- Proper heading hierarchy
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Color contrast ratios
- Skip links
- Alt text for images

**Mobile Accessibility:**
- Minimum 16px font size (prevents iOS zoom)
- Touch targets ≥ 44px
- Swipe gestures with alternatives
- Reduced motion support
- Safe area insets for notched devices

---

## 8. Future Enhancements

### 8.1 Planned Features
- Multi-language support
- Voice message analysis
- Video call transcript analysis
- Longitudinal tracking (optional, with consent)
- Personalized exercise recommendations
- Integration with therapy platforms

### 8.2 Research & Development
- Machine learning for pattern recognition
- Sentiment analysis improvements
- Cultural context awareness
- Relationship stage detection
- Predictive modeling for relationship outcomes

---

## 9. Success Metrics

### 9.1 User Satisfaction
- Analysis completion rate
- Export usage rate
- Return visits (for new analyses)
- User feedback and ratings

### 9.2 Analysis Quality
- OCR accuracy rate
- Pattern detection precision
- User-reported accuracy
- Professional therapist validation

### 9.3 Technical Performance
- Average analysis time
- API success rate
- Error rate and recovery
- Mobile vs. desktop usage

---

## 10. Ethical Considerations

### 10.1 Responsible AI Use
- Transparent about AI limitations
- Clear disclaimers about professional help
- Balanced, nonjudgmental language
- Avoids pathologizing normal relationship dynamics
- Encourages professional support when needed

### 10.2 Privacy Protection
- No data retention
- No user tracking
- Clear privacy policy
- Informed consent
- Secure API communications

### 10.3 Harm Prevention
- Identifies abuse patterns (recommends professional help)
- Avoids blame or shame
- Provides crisis resources when needed
- Acknowledges complexity of relationships
- Encourages mutual respect and safety

---

## Appendix A: Pattern Detection Examples

### Example 1: Emotional Flooding
**Input:**
\`\`\`
[Alex]: We need to talk about last night
[Jordan]: Not now
[Alex]: When then?
[Alex]: You always do this
[Alex]: Just talk to me
[Jordan]: Fine
\`\`\`

**Detection:**
- Rapid-fire messages from Alex (anxious pursuit)
- Brief responses from Jordan (stonewalling)
- Criticism ("You always do this")
- Emotional flooding indicators

**Analysis:**
"Alex appears to be pursuing connection while feeling anxious, sending multiple messages in quick succession. Jordan's brief responses ('Not now', 'Fine') suggest emotional withdrawal or overwhelm. This pursue-withdraw pattern is common when one partner needs to process internally while the other seeks immediate resolution."

### Example 2: Successful Repair
**Input:**
\`\`\`
[Sam]: I'm sorry I snapped at you earlier
[Taylor]: I appreciate that. I was hurt.
[Sam]: I know. I was stressed about work but that's not an excuse
[Taylor]: Thank you for understanding. Want to talk about it?
[Sam]: Yes please. Can we grab dinner?
\`\`\`

**Detection:**
- Repair attempt (apology)
- Validation (acknowledging hurt)
- Accountability (no excuses)
- Turning toward (offering support)
- Positive resolution

**Analysis:**
"This exchange demonstrates healthy repair. Sam takes responsibility without defensiveness, Taylor validates their own feelings while accepting the apology, and both move toward reconnection. This pattern builds trust and emotional safety."

---

## Appendix B: Scoring Algorithm Details

### Harmony Score Calculation
\`\`\`typescript
function calculateHarmonyScore(text: string): number {
  const positiveMarkers = ["love", "appreciate", "thank", "sorry", "understand"]
  const negativeMarkers = ["always", "never", "but", "whatever", "fine"]
  
  const positiveCount = countMarkers(text, positiveMarkers)
  const negativeCount = countMarkers(text, negativeMarkers)
  
  const ratio = positiveCount / Math.max(1, negativeCount)
  return Math.min(100, ratio * 20) // 5:1 ratio = 100 score
}
\`\`\`

### Emotional Safety Score Calculation
\`\`\`typescript
function calculateEmotionalSafetyScore(text: string): number {
  const validationCount = countValidation(text)
  const contemptCount = countContempt(text)
  const supportCount = countSupport(text)
  
  const safetyScore = (validationCount * 10) + (supportCount * 10) - (contemptCount * 20)
  return Math.max(0, Math.min(100, safetyScore))
}
\`\`\`

### Repair Effort Score Calculation
\`\`\`typescript
function calculateRepairEffortScore(text: string): number {
  const repairAttempts = countRepairAttempts(text)
  const repairRejections = countRepairRejections(text)
  
  const effectiveRepairs = Math.max(0, repairAttempts - repairRejections)
  return Math.min(100, effectiveRepairs * 20)
}
\`\`\`

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Maintained By:** Love Lens Development Team
