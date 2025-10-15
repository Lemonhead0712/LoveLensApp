# Love Lens - Comprehensive Product Requirements Document

## 1. Executive Summary

**Product Name:** Love Lens  
**Tagline:** "See Your Relationship Through a New Lens"  
**Version:** 3.0  
**Last Updated:** January 2025

### Mission Statement
Love Lens empowers couples to understand their relationship dynamics through AI-powered analysis of their text conversations, providing evidence-based insights grounded in psychological research to foster healthier communication and deeper emotional connection.

### Core Value Proposition
- **Privacy-First:** No data storage, no accounts, one-time analysis
- **Evidence-Based:** Grounded in Gottman Method, attachment theory, and emotional intelligence research
- **Actionable Insights:** Specific, constructive guidance for both partners
- **Accessible:** Simple upload process, instant results, mobile-optimized
- **Empathetic:** Non-judgmental, balanced analysis that acknowledges both partners' contributions

---

## 2. Application Architecture

### 2.1 Core Pages & User Flows

#### A. Home Page (`/`)
**Purpose:** Convert visitors into users by clearly communicating value and building trust

**Sections:**
1. **Hero Section**
   - Headline: "Understand Your Relationship Better"
   - Subheadline: "AI-powered analysis of your text conversations"
   - Primary CTA: "Analyze Your Conversations" → Upload flow
   - Secondary CTA: "See How It Works" → Scroll to How It Works section
   - Visual: Couple silhouette with heart logo

2. **Features Section**
   - 3-4 key features with icons:
     - Privacy-First Analysis
     - Evidence-Based Insights
     - Actionable Guidance
     - Instant Results
   - Each feature has title, description, and icon

3. **How It Works Section**
   - 3-step process:
     1. Upload Screenshots (of text conversations)
     2. AI Analysis (using psychological frameworks)
     3. Get Insights (detailed report with visualizations)
   - Visual step indicators with numbers

4. **Testimonials Section** (Optional)
   - Social proof from users
   - Ratings and reviews
   - Trust indicators

5. **CTA Section**
   - Final conversion opportunity
   - "Ready to understand your relationship better?"
   - Button: "Get Started"

**Navigation:**
- Logo (top left) → Home
- Links: Home, How It Works, Zodiac Compatibility, FAQ, About, Contact
- Mobile: Hamburger menu

#### B. Upload & Analysis Flow (`/` → `/results`)
**Purpose:** Seamless conversion from interest to analysis

**Step 1: Upload Interface (Home Page)**
- Drag-and-drop or click to upload
- Accept 1-10 screenshots (PNG, JPG, JPEG, WEBP)
- File size limit: 10MB per file
- Preview thumbnails with delete option
- Drag to reorder functionality

**Step 2: Subject Names Input**
- Two text inputs for partner names
- Validation: Required, non-empty
- Default: "Person A" and "Person B"
- Mobile-optimized layout

**Step 3: Analysis Progress**
- Full-screen loading state
- Progress steps:
  1. Enhancing images
  2. Extracting text
  3. Analyzing patterns
  4. Generating insights
- Progress bar (0-100%)
- Estimated time remaining
- Engaging animation

**Step 4: Results Display** (`/results`)
- Tabbed interface:
  - Overview
  - Communication Patterns
  - Emotional Dynamics
  - Charts & Metrics
  - Professional Insights
  - Personalized Feedback
- Swipeable tabs on mobile
- Export to Word option
- "Analyze Another Conversation" CTA

#### C. Zodiac Compatibility (`/zodiac`)
**Purpose:** Additional engagement tool, SEO traffic driver

**Features:**
- Select two zodiac signs
- Generate compatibility analysis
- Relationship insights based on astrological compatibility
- Strengths and challenges
- Communication tips
- CTA: "Want deeper insights? Analyze your actual conversations"

**Design:**
- Zodiac wheel or sign selector
- Visual compatibility meter
- Detailed compatibility report
- Mobile-optimized

#### D. FAQ Page (`/faq`)
**Purpose:** Address common questions, reduce friction, build trust

**Categories:**
1. **How It Works**
   - What is Love Lens?
   - How does the analysis work?
   - What frameworks do you use?
   - How accurate is the analysis?

2. **Privacy & Security**
   - Is my data stored?
   - Who can see my conversations?
   - How do you protect privacy?
   - Do you use my data for training?

3. **Technical**
   - What file formats are supported?
   - How many screenshots can I upload?
   - What if the analysis fails?
   - Can I export the results?

4. **Pricing & Access**
   - Is Love Lens free?
   - Do I need an account?
   - Can I analyze multiple conversations?

**Design:**
- Accordion-style Q&A
- Search functionality
- Categories for easy navigation
- "Still have questions?" CTA → Contact

#### E. About Page (`/about`)
**Purpose:** Build trust, explain mission, humanize the brand

**Sections:**
1. **Our Story**
   - Why we built Love Lens
   - Mission and values
   - Team background (if applicable)

2. **Our Approach**
   - Evidence-based methodology
   - Psychological frameworks used
   - Commitment to privacy and ethics

3. **Our Values**
   - Privacy-first
   - Empathy and non-judgment
   - Accessibility
   - Continuous improvement

4. **Disclaimers**
   - Not a substitute for therapy
   - Educational purposes only
   - Encourages professional help when needed

**Design:**
- Personal, warm tone
- Team photos (if applicable)
- Trust indicators
- CTA: "Try Love Lens"

#### F. Contact Page (`/contact`)
**Purpose:** Provide support, gather feedback, build relationships

**Features:**
- Contact form:
  - Name (required)
  - Email (required)
  - Subject (dropdown: General Inquiry, Technical Support, Feedback, Partnership)
  - Message (required)
  - Submit button
- Alternative contact methods:
  - Email address
  - Social media links (if applicable)
- Response time expectations
- FAQ link for common questions

**Design:**
- Simple, clean form
- Validation and error messages
- Success confirmation
- Mobile-optimized

#### G. Privacy Policy (`/privacy`)
**Purpose:** Legal compliance, transparency, trust-building

**Sections:**
1. Data Collection (minimal)
2. Data Usage (analysis only)
3. Data Storage (none)
4. Third-Party Services (OpenAI API)
5. User Rights
6. Contact Information

#### H. Terms of Service (`/terms`)
**Purpose:** Legal protection, set expectations

**Sections:**
1. Acceptance of Terms
2. Service Description
3. User Responsibilities
4. Disclaimers
5. Limitation of Liability
6. Changes to Terms

---

## 3. Core Functionality: Analysis Engine

### 3.1 Input Processing

**Accepted Input:**
- 1-10 conversation screenshots
- Formats: PNG, JPG, JPEG, WEBP
- Max size: 10MB per file
- Text-based conversations (iMessage, WhatsApp, SMS, etc.)

**Processing Pipeline:**
1. **Client-Side Image Enhancement**
   - Contrast enhancement
   - Sharpening
   - Noise reduction
   - Compression for API efficiency

2. **OCR Text Extraction**
   - OpenAI GPT-4o Vision API
   - Batch processing (all images in one call)
   - Speaker identification
   - Chronological ordering
   - Retry logic with exponential backoff

3. **Text Normalization**
   - Convert markdown format (`**Name:**`) to standard format (`[Name]:`)
   - Speaker label standardization
   - Message deduplication
   - Chronological sorting

4. **Pattern Detection**
   - Message parsing and counting
   - Emotional tone analysis
   - PDR (Pursue-Distance-Repair) pattern detection
   - Gottman's Four Horsemen detection
   - Validation and invalidation patterns
   - Emotional labor assessment

5. **Scoring & Analysis**
   - Overall relationship health score (0-10)
   - Harmony, safety, and repair scores (0-100)
   - Communication metrics
   - Confidence levels
   - Pattern evolution tracking

6. **Results Generation**
   - Comprehensive analysis report
   - Visual charts and metrics
   - Personalized feedback for both partners
   - Professional insights and recommendations

### 3.2 Analysis Frameworks

**Psychological Foundations:**
1. **Gottman Method**
   - Four Horsemen detection
   - Repair attempts and effectiveness
   - Positive-to-negative ratio
   - Emotional bids and responses

2. **Attachment Theory**
   - Secure, anxious, avoidant patterns
   - Protest behaviors and deactivating strategies
   - Attachment wounds and triggers

3. **Emotional Intelligence**
   - Self-awareness and self-regulation
   - Social awareness and empathy
   - Relationship management

4. **Polyvagal Theory**
   - Nervous system states
   - Co-regulation vs. dysregulation
   - Safety cues and threat detection

5. **Pursue-Distance-Repair (PDR) Dynamics**
   - Pursuit patterns (anxious seeking)
   - Distance patterns (withdrawal)
   - Repair patterns (reconnection attempts)
   - Bidirectional analysis for both partners

### 3.3 Output Structure

**Analysis Results Include:**
1. **Overview Tab**
   - Relationship health score
   - Message count and balance
   - Confidence levels
   - Key takeaways
   - Emotional flow summary

2. **Communication Patterns Tab**
   - Communication styles for each partner
   - Emotional vibe tags
   - Message rhythm and pacing
   - Recurring patterns (positive and negative)
   - Common triggers and responses

3. **Emotional Dynamics Tab**
   - Emotional motivations for each partner
   - Attachment patterns
   - Love language friction
   - Gottman conflict markers
   - Emotional intelligence indicators

4. **Charts & Metrics Tab**
   - Emotional communication characteristics (radar chart)
   - Conflict expression styles (radar chart)
   - Validation and reassurance patterns (pie charts)
   - Communication metrics (balance, depth, resolution)

5. **Professional Insights Tab**
   - Attachment theory analysis
   - Trauma-informed observations
   - Therapeutic recommendations
   - Clinical exercises
   - Prognosis and risk factors

6. **Personalized Feedback Tab**
   - Individual feedback for each partner:
     - Strengths
     - Areas for improvement
     - What went wrong
     - Connection boosters
   - Shared feedback for both partners:
     - Shared strengths
     - Shared growth areas
     - Shared connection boosters

---

## 4. Design System

### 4.1 Visual Identity

**Logo:**
- Couple silhouette with heart
- File: `/public/images/love-lens-logo.png`
- Usage: Header, favicon, social sharing

**Color Palette:**
- Primary: Brand color (defined in globals.css)
- Secondary: Accent color
- Neutrals: Background, foreground, muted
- Semantic: Success, warning, error, info

**Typography:**
- Sans-serif: Inter (headings and body)
- Monospace: JetBrains Mono (code, technical content)
- Font sizes: Responsive scale (text-sm to text-4xl)
- Line height: 1.5-1.6 for readability

**Spacing:**
- Consistent spacing scale (Tailwind: p-4, m-6, gap-8, etc.)
- Section padding: py-12 md:py-16 lg:py-20
- Container max-width: max-w-7xl
- Grid gaps: gap-6 md:gap-8 lg:gap-12

### 4.2 Component Library

**UI Components (shadcn/ui):**
- Button, Card, Badge, Alert
- Tabs, Accordion, Dialog, Sheet
- Input, Textarea, Select, Checkbox
- Progress, Spinner, Skeleton
- Chart (Recharts integration)
- Tooltip, Popover, Dropdown Menu

**Custom Components:**
- `enhanced-compact-upload.tsx` - Upload interface
- `enhanced-analysis-results.tsx` - Results display
- `modern-analysis-loading.tsx` - Loading state
- `compact-header.tsx` - Navigation header
- `compact-footer.tsx` - Footer
- `streamlined-hero.tsx` - Hero section
- `streamlined-features.tsx` - Features section
- `streamlined-how-it-works.tsx` - How It Works section

### 4.3 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile-First Approach:**
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-optimized (44px minimum touch targets)
- Swipe gestures for tabs
- Horizontal scroll for tab bar only (no page swiping)

**Accessibility:**
- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast ratios
- Alt text for images

---

## 5. Technical Stack

### 5.1 Frontend

**Framework:**
- Next.js 14 (App Router)
- React 18
- TypeScript

**Styling:**
- Tailwind CSS
- CSS Modules (globals.css)
- shadcn/ui components

**State Management:**
- React hooks (useState, useEffect, useCallback)
- URL state for results (searchParams)
- Session storage for results persistence

**Animations:**
- Framer Motion (optional, for enhanced UX)
- CSS transitions
- Loading animations

**Data Visualization:**
- Recharts (radar charts, pie charts, bar charts)
- Custom chart components

### 5.2 Backend

**Server:**
- Next.js Server Actions
- API Routes (for specific endpoints)

**External APIs:**
- OpenAI GPT-4o Vision API (OCR extraction)
- Environment variables for API keys

**File Processing:**
- Client-side image compression
- Base64 encoding for API transmission
- Batch processing for efficiency

### 5.3 Deployment

**Platform:**
- Vercel (recommended)
- Environment variables:
  - `OPENAI_API_KEY` (required)
  - `NEXT_PUBLIC_APP_URL` (for absolute URLs)

**Performance:**
- Image optimization (Next.js Image component)
- Code splitting (automatic with App Router)
- Lazy loading for heavy components
- Caching strategies

---

## 6. User Experience Principles

### 6.1 Conversion Optimization

**Home Page:**
- Clear value proposition above the fold
- Strong CTAs (primary and secondary)
- Social proof (testimonials, trust indicators)
- Minimal friction (no account required)

**Upload Flow:**
- Simple, intuitive interface
- Clear instructions
- Progress indicators
- Error handling with helpful messages

**Results:**
- Immediate value delivery
- Easy-to-understand visualizations
- Actionable insights
- Export option for future reference

### 6.2 Trust Building

**Privacy Messaging:**
- Prominent privacy assurances
- "No data storage" messaging
- Clear privacy policy link
- Transparent about AI usage

**Credibility:**
- Evidence-based approach
- Psychological frameworks cited
- Professional disclaimers
- Encourages therapy when appropriate

**Quality:**
- Polished design
- Error-free experience
- Fast performance
- Mobile optimization

### 6.3 Engagement

**Primary Conversion:**
- Upload and analyze conversations

**Secondary Engagement:**
- Zodiac compatibility tool
- FAQ exploration
- Social sharing (optional)

**Retention:**
- Memorable experience
- Word-of-mouth referrals
- Return for new analyses

---

## 7. Content Strategy

### 7.1 Tone & Voice

**Brand Voice:**
- Empathetic and warm
- Professional but approachable
- Non-judgmental and balanced
- Encouraging and supportive

**Writing Guidelines:**
- Use "you" and "your" (second person)
- Avoid jargon where possible
- Use "may" and "might" (avoid absolutes)
- Acknowledge complexity
- Provide specific examples
- Balance strengths and growth areas

### 7.2 Key Messages

**Value Propositions:**
1. "Understand your relationship dynamics through AI-powered analysis"
2. "Evidence-based insights grounded in psychological research"
3. "Privacy-first: No data storage, no accounts required"
4. "Actionable guidance for healthier communication"

**Differentiators:**
1. Evidence-based (Gottman, attachment theory, etc.)
2. Privacy-first (no data storage)
3. Balanced and non-judgmental
4. Instant results
5. Mobile-optimized

**Trust Builders:**
1. "Your conversations are never stored"
2. "Based on 40+ years of relationship research"
3. "Not a substitute for professional therapy"
4. "Thousands of couples have gained insights"

---

## 8. Success Metrics

### 8.1 User Metrics

**Acquisition:**
- Unique visitors
- Traffic sources
- Bounce rate
- Time on site

**Activation:**
- Upload completion rate
- Analysis completion rate
- Results view rate

**Engagement:**
- Average time on results page
- Tab interaction rate
- Export usage rate
- Return visit rate

### 8.2 Technical Metrics

**Performance:**
- Page load time (< 3 seconds)
- Analysis completion time (< 30 seconds)
- API success rate (> 95%)
- Error rate (< 5%)

**Quality:**
- OCR accuracy
- User-reported accuracy
- Feedback sentiment

### 8.3 Business Metrics

**Growth:**
- Monthly active users
- Conversion rate (visitor → analyzer)
- Referral rate
- Social shares

**Retention:**
- Return user rate
- Multiple analysis rate
- Word-of-mouth referrals

---

## 9. Privacy & Ethics

### 9.1 Data Handling

**What We Collect:**
- Uploaded images (temporary, for analysis only)
- Subject names (user-provided, not stored)
- Analysis results (stored in browser session only)

**What We Don't Collect:**
- User accounts or profiles
- Email addresses (unless voluntarily provided via contact form)
- Conversation content (deleted after analysis)
- Tracking or analytics data

**Third-Party Services:**
- OpenAI API (for OCR extraction)
- Vercel (hosting platform)

### 9.2 Ethical Guidelines

**Responsible AI:**
- Transparent about AI limitations
- Clear disclaimers about professional help
- Balanced, non-judgmental language
- Avoids pathologizing normal dynamics

**Harm Prevention:**
- Identifies potential abuse patterns
- Recommends professional help when appropriate
- Provides crisis resources
- Acknowledges relationship complexity

**User Empowerment:**
- Actionable insights
- Encourages communication
- Supports mutual respect
- Promotes emotional safety

---

## 10. Future Roadmap

### 10.1 Phase 1 (Current)
- Core analysis functionality
- Home, Results, Zodiac, FAQ, About, Contact pages
- Mobile optimization
- Export to Word

### 10.2 Phase 2 (Next 3-6 months)
- Multi-language support
- Enhanced visualizations
- Longitudinal tracking (optional, with consent)
- Personalized exercise recommendations

### 10.3 Phase 3 (6-12 months)
- Voice message analysis
- Video call transcript analysis
- Integration with therapy platforms
- Machine learning improvements

### 10.4 Research & Development
- Cultural context awareness
- Relationship stage detection
- Predictive modeling
- Sentiment analysis improvements

---

## 11. Maintenance & Support

### 11.1 Regular Updates

**Content:**
- FAQ updates based on user questions
- Blog posts (if applicable)
- Feature announcements

**Technical:**
- Dependency updates
- Security patches
- Performance optimizations
- Bug fixes

### 11.2 User Support

**Channels:**
- Contact form
- Email support
- FAQ page
- Social media (if applicable)

**Response Times:**
- General inquiries: 24-48 hours
- Technical issues: 12-24 hours
- Critical bugs: Immediate

### 11.3 Monitoring

**Technical Monitoring:**
- Error tracking (Sentry or similar)
- Performance monitoring (Vercel Analytics)
- API usage and costs
- Uptime monitoring

**User Feedback:**
- Contact form submissions
- User surveys (optional)
- Social media mentions
- Review sites

---

## 12. Legal & Compliance

### 12.1 Required Pages

**Privacy Policy:**
- Data collection and usage
- Third-party services
- User rights
- Contact information

**Terms of Service:**
- Service description
- User responsibilities
- Disclaimers
- Limitation of liability

**Disclaimers:**
- Not a substitute for therapy
- Educational purposes only
- No guarantees of accuracy
- Encourages professional help

### 12.2 Compliance

**GDPR (if applicable):**
- Right to access
- Right to deletion
- Data portability
- Consent management

**CCPA (if applicable):**
- Privacy notice
- Opt-out rights
- Data disclosure

**Accessibility:**
- WCAG 2.1 AA compliance
- Regular accessibility audits
- User feedback incorporation

---

## Appendix A: File Structure

### Essential Files

**Pages:**
- `app/page.tsx` - Home page
- `app/results/page.tsx` - Results display
- `app/zodiac/page.tsx` - Zodiac compatibility
- `app/faq/page.tsx` - FAQ
- `app/about/page.tsx` - About
- `app/contact/page.tsx` - Contact
- `app/privacy/page.tsx` - Privacy policy
- `app/terms/page.tsx` - Terms of service

**Core Components:**
- `components/enhanced-compact-upload.tsx` - Upload interface
- `components/enhanced-analysis-results.tsx` - Results display
- `components/modern-analysis-loading.tsx` - Loading state
- `components/compact-header.tsx` - Header
- `components/compact-footer.tsx` - Footer
- `components/streamlined-hero.tsx` - Hero section
- `components/streamlined-features.tsx` - Features
- `components/streamlined-how-it-works.tsx` - How It Works

**Server Actions:**
- `app/actions.tsx` - Main analysis logic
- `app/zodiac/actions.ts` - Zodiac compatibility logic

**Styling:**
- `app/globals.css` - Global styles
- `app/layout.tsx` - Root layout
- `tailwind.config.ts` - Tailwind configuration

**Configuration:**
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

### Files to Remove

**Test/Debug Files:**
- `app/test/page.tsx`
- `app/api/test-analysis/route.ts`
- `app/api/diagnostics/route.ts`
- `components/test-analysis.tsx`

**Duplicate/Old Components:**
- `components/analysis-results.tsx` (use enhanced version)
- `components/upload-form.tsx` (use enhanced-compact-upload)
- `components/upload-section.tsx` (use enhanced-compact-upload)
- `components/loading-analysis.tsx` (use modern version)
- `components/header.tsx` (use compact version)
- `components/footer.tsx` (use compact version)
- `components/hero.tsx` (use streamlined version)
- `components/features.tsx` (use streamlined version)
- `components/how-it-works.tsx` (use streamlined version)

**Unused Utilities:**
- `lib/aspect-ratio-detection.ts` (if not used)
- `lib/image-processing.ts` (if superseded)
- `lib/optimized-image-processing.ts` (if not used)
- `lib/performance-utils.ts` (if not used)
- `lib/worker-utils.ts` (if not used)

---

## Appendix B: Environment Variables

### Required

\`\`\`env
OPENAI_API_KEY=sk-...
\`\`\`

### Optional

\`\`\`env
NEXT_PUBLIC_APP_URL=https://lovelens.app
NEXT_PUBLIC_NODE_ENV=production
\`\`\`

---

## Appendix C: Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set
- [ ] Privacy policy and terms updated
- [ ] Contact form tested
- [ ] All pages load correctly
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit completed
- [ ] Performance optimization done
- [ ] Error handling tested
- [ ] Analytics configured (if applicable)

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Error monitoring active
- [ ] Performance monitoring active
- [ ] User feedback channels open
- [ ] Social media updated (if applicable)
- [ ] Documentation updated

---

**Document Version:** 3.0  
**Last Updated:** January 2025  
**Maintained By:** Love Lens Development Team
