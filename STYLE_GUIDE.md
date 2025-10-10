# Love Lens Application Style Guide

## Table of Contents
1. [Code Formatting & Structure](#code-formatting--structure)
2. [Design System](#design-system)
3. [Layout Patterns](#layout-patterns)
4. [Logic & Architecture](#logic--architecture)
5. [Component Patterns](#component-patterns)
6. [Error Handling](#error-handling)
7. [Performance & Optimization](#performance--optimization)

---

## Code Formatting & Structure

### File Naming Conventions
- **Components**: `kebab-case.tsx` (e.g., `enhanced-analysis-results.tsx`, `modern-analysis-loading.tsx`)
- **Server Actions**: `actions.ts` (singular, not plural)
- **API Routes**: `route.ts` inside feature folders (e.g., `app/api/analyze/route.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `results-storage.ts`)

### Import Organization
\`\`\`typescript
// 1. React & Next.js imports
import { useState } from "react"
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { motion } from "framer-motion"
import { Heart, Upload } from 'lucide-react'

// 3. UI components (shadcn/ui)
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 4. Custom components
import ModernAnalysisLoading from "@/components/modern-analysis-loading"

// 5. Actions & utilities
import { analyzeConversation } from "@/app/actions"
import { storeResults } from "@/lib/results-storage"
\`\`\`

### TypeScript Conventions
- **Always use TypeScript** for all `.ts` and `.tsx` files
- **Type annotations**: Use explicit types for function parameters and return values
- **Interfaces over types**: Prefer `interface` for object shapes
- **Avoid `any`**: Use specific types or `unknown` when type is truly unknown

\`\`\`typescript
// ✅ Good
interface AnalysisResults {
  subjectALabel: string
  subjectBLabel: string
  messageCount: number
  error?: string
}

async function analyzeConversation(formData: FormData): Promise<AnalysisResults> {
  // implementation
}

// ❌ Bad
function analyzeConversation(formData: any): any {
  // implementation
}
\`\`\`

### Function Structure
- **Server actions**: Always start with `"use server"` directive
- **Client components**: Always start with `"use client"` directive
- **Async functions**: Use `async/await` consistently, never mix with `.then()`
- **Error handling**: Always wrap async operations in try-catch blocks

\`\`\`typescript
// Server action pattern
"use server"

export async function analyzeConversation(formData: FormData) {
  try {
    console.log("[v0] Starting analysis...")
    // implementation
    return results
  } catch (error) {
    console.error("[v0] Error:", error)
    return { error: "Error message" }
  }
}
\`\`\`

### Logging Conventions
- **Prefix all logs** with `[v0]` for easy filtering
- **Use descriptive messages** that explain what's happening
- **Log at key decision points**: file reading, API calls, validation, errors
- **Include context**: file names, sizes, counts, timing information

\`\`\`typescript
console.log("[v0] Starting analysis with", files.length, "files")
console.log("[v0] File details:", files.map(f => `${f.name} (${f.size} bytes)`).join(", "))
console.error("[v0] Error during analysis:", error)
\`\`\`

---

## Design System

### Color Palette
**Primary Colors:**
- Purple: `#a855f7` (purple-600), `#9333ea` (purple-700)
- Pink: `#ec4899` (pink-600), `#db2777` (pink-700)
- Gradient: `from-purple-600 to-pink-600`

**Semantic Colors:**
- Success/Positive: `green-50`, `green-600`, `green-800`, `green-900`
- Warning/Caution: `yellow-50`, `yellow-600`, `yellow-800`, `yellow-900`
- Error/Destructive: `red-50`, `red-600`, `red-800`, `red-900`
- Info: `blue-50`, `blue-600`, `blue-800`, `blue-900`
- Neutral: `gray-50` through `gray-900`

**Background Gradients:**
\`\`\`css
/* Page backgrounds */
bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50

/* Card accents */
bg-gradient-to-br from-white to-purple-50

/* Buttons */
bg-gradient-to-r from-purple-600 to-pink-600
\`\`\`

### Typography
**Font Families:**
- Sans-serif: Default system font stack (via Tailwind)
- Use `font-sans` class for body text
- Use `font-semibold` or `font-bold` for headings

**Font Sizes (Mobile-First):**
\`\`\`css
/* Headings */
text-2xl sm:text-3xl md:text-4xl lg:text-5xl  /* H1 */
text-xl sm:text-2xl md:text-3xl              /* H2 */
text-lg sm:text-xl md:text-2xl               /* H3 */
text-base sm:text-lg md:text-xl              /* H4 */

/* Body text */
text-sm sm:text-base                         /* Regular */
text-xs sm:text-sm                           /* Small */
text-[10px] sm:text-xs                       /* Extra small */
\`\`\`

**Line Height:**
- Body text: `leading-relaxed` (1.625) or `leading-6`
- Headings: Default or `leading-tight`
- Never use `leading-none` for body text

### Spacing Scale
**Use Tailwind's spacing scale consistently:**
- Gaps: `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`
- Padding: `p-3`, `p-4`, `p-6`, `p-8`
- Margins: `mb-2`, `mb-3`, `mb-4`, `mb-6`, `mb-8`
- Responsive: `gap-3 sm:gap-4 md:gap-6`

**Never use arbitrary values** unless absolutely necessary:
\`\`\`css
/* ✅ Good */
p-4 gap-3 mb-6

/* ❌ Bad */
p-[16px] gap-[12px] mb-[24px]
\`\`\`

### Border Radius
- Small: `rounded-lg` (0.5rem)
- Medium: `rounded-xl` (0.75rem)
- Large: `rounded-2xl` (1rem)
- Full: `rounded-full` (circles)

### Shadows
- Cards: `shadow-lg`
- Buttons: `shadow-lg hover:shadow-xl`
- Modals: `shadow-2xl`

---

## Layout Patterns

### Layout Method Priority
1. **Flexbox** (primary): Use for most layouts
   \`\`\`css
   flex items-center justify-between
   flex flex-col gap-4
   flex flex-wrap gap-2
   \`\`\`

2. **CSS Grid** (secondary): Use for complex 2D layouts
   \`\`\`css
   grid grid-cols-1 md:grid-cols-2 gap-4
   grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3
   \`\`\`

3. **Avoid**: Floats, absolute positioning (unless necessary)

### Responsive Design (Mobile-First)
**Breakpoints:**
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

**Pattern:**
\`\`\`tsx
<div className="text-sm sm:text-base md:text-lg">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
    {/* content */}
  </div>
</div>
\`\`\`

### Container Patterns
\`\`\`tsx
/* Page container */
<div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-3 sm:p-4 md:p-8">
  <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
    {/* content */}
  </div>
</div>

/* Card container */
<Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
  <CardHeader className="pb-3 sm:pb-4 md:pb-6">
    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3 sm:space-y-4">
    {/* content */}
  </CardContent>
</Card>
\`\`\`

### Icon Usage
- **Always include `flex-shrink-0`** on icons to prevent squishing
- **Size consistently**: `w-4 h-4 sm:w-5 sm:h-5` for inline icons
- **Color**: Match semantic meaning (purple for primary, green for success, etc.)

\`\`\`tsx
<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
\`\`\`

---

## Logic & Architecture

### Server-Side Architecture

**File Structure:**
\`\`\`
app/
├── actions.ts              # Server actions (main analysis logic)
├── api/
│   ├── analyze/
│   │   └── route.ts       # API route (if needed)
│   └── export-word/
│       └── route.ts       # Export functionality
└── page.tsx               # Page components
\`\`\`

**Server Action Pattern:**
\`\`\`typescript
"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Helper functions (private)
async function helperFunction() {
  // implementation
}

// Main exported function (public)
export async function mainAction(formData: FormData) {
  try {
    // 1. Validate inputs
    // 2. Process data
    // 3. Call AI/external services
    // 4. Transform results
    // 5. Return structured data
    return { success: true, data: results }
  } catch (error) {
    console.error("[v0] Error:", error)
    return { error: "User-friendly error message" }
  }
}
\`\`\`

### Data Flow Pattern
\`\`\`
User Upload → Client Validation → Server Action → OCR → AI Analysis → Data Transformation → Client Display
\`\`\`

### Error Handling Strategy

**Client-Side:**
\`\`\`typescript
try {
  const results = await analyzeConversation(formData)
  
  if (results.error) {
    setError(results.error)  // Display to user
    return
  }
  
  // Process successful results
} catch (err: any) {
  // Handle unexpected errors
  let errorMessage = "An unexpected error occurred."
  
  if (err?.message) {
    if (err.message.includes("network")) {
      errorMessage = "Network error. Please check your connection."
    } else if (err.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again."
    } else {
      errorMessage = err.message
    }
  }
  
  setError(errorMessage)
}
\`\`\`

**Server-Side:**
\`\`\`typescript
try {
  // Operation
} catch (error) {
  console.error("[v0] Detailed error for debugging:", error)
  
  if (error instanceof Error) {
    if (error.message.includes("API key")) {
      throw new Error("API key not configured. Please add OPENAI_API_KEY to environment variables.")
    }
    throw new Error(`User-friendly message: ${error.message}`)
  }
  
  throw new Error("Generic fallback message")
}
\`\`\`

### Validation Pattern

**Input Validation:**
\`\`\`typescript
// Validate before processing
if (!file || !file.size) {
  return { error: "File is empty or invalid" }
}

if (file.size > 10 * 1024 * 1024) {
  return { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)` }
}

if (!file.type.startsWith("image/")) {
  return { error: "File must be an image" }
}
\`\`\`

**Output Validation:**
\`\`\`typescript
function validateChartData(data: any): ValidationResult {
  const errors: string[] = []
  
  // Check required fields
  if (!data.category) {
    errors.push("Missing category")
  }
  
  // Check value ranges
  if (data.score < 1 || data.score > 10) {
    errors.push(`Score out of range: ${data.score} (must be 1-10)`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
\`\`\`

### Timeout Management
\`\`\`typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
  )
  return Promise.race([promise, timeoutPromise])
}

// Usage
const result = await withTimeout(
  generateText({ ... }),
  60000,  // 60 seconds
  "OCR extraction"
)
\`\`\`

---

## Component Patterns

### Component Structure
\`\`\`tsx
"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Icon } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ComponentProps {
  data: DataType
  onAction?: () => void
}

export default function ComponentName({ data, onAction }: ComponentProps) {
  // 1. State declarations
  const [state, setState] = useState<Type>(initialValue)
  
  // 2. Hooks
  const router = useRouter()
  
  // 3. Callbacks
  const handleAction = useCallback(() => {
    // implementation
  }, [dependencies])
  
  // 4. Effects (if needed)
  useEffect(() => {
    // implementation
  }, [dependencies])
  
  // 5. Early returns
  if (data.error) {
    return <ErrorDisplay error={data.error} />
  }
  
  // 6. Render
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container-classes"
    >
      {/* content */}
    </motion.div>
  )
}
\`\`\`

### Animation Patterns (Framer Motion)
\`\`\`tsx
// Page entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// Staggered children
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.1 }}
>

// Exit animations
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
  )}
</AnimatePresence>
\`\`\`

### State Management
- **Local state**: Use `useState` for component-specific state
- **Callbacks**: Use `useCallback` for functions passed to children
- **No global state**: Application doesn't use Redux/Zustand/Context
- **URL state**: Use query parameters for shareable state (e.g., result IDs)

### Form Handling
\`\`\`tsx
const [value, setValue] = useState("")
const [error, setError] = useState<string | null>(null)

const handleSubmit = async () => {
  setError(null)
  
  // Validate
  if (!value) {
    setError("Field is required")
    return
  }
  
  try {
    // Process
    const result = await action(value)
    
    if (result.error) {
      setError(result.error)
      return
    }
    
    // Success
  } catch (err) {
    setError("An error occurred")
  }
}
\`\`\`

---

## Error Handling

### User-Facing Error Messages
**Principles:**
- Be specific and actionable
- Avoid technical jargon
- Suggest next steps
- Include context (file names, sizes, etc.)

\`\`\`typescript
// ✅ Good
"File 'screenshot.png' is too large (15.2MB). Maximum size is 10MB. Please compress the image and try again."

// ❌ Bad
"File too large"
"Error: ETOOBIG"
\`\`\`

### Error Display Pattern
\`\`\`tsx
{error && (
  <Alert className="border-red-200 bg-red-50">
    <AlertCircle className="h-5 w-5 text-red-600" />
    <AlertDescription className="text-red-800 ml-2">
      {error}
    </AlertDescription>
  </Alert>
)}
\`\`\`

### Error Categories
1. **Validation Errors**: User input issues (file size, type, missing fields)
2. **Network Errors**: Connection issues, timeouts
3. **API Errors**: External service failures (OpenAI, etc.)
4. **Processing Errors**: Analysis failures, parsing errors
5. **System Errors**: Unexpected failures

---

## Performance & Optimization

### File Handling
\`\`\`typescript
// Multiple fallback methods for file reading
try {
  buffer = Buffer.from(await file.arrayBuffer())
} catch {
  try {
    buffer = Buffer.from(await file.bytes())
  } catch {
    // Stream fallback
  }
}
\`\`\`

### Parallel Processing
\`\`\`typescript
// Process multiple files in parallel
const results = await Promise.all(
  files.map(async (file, index) => {
    return await processFile(file, index)
  })
)
\`\`\`

### Image Optimization
- Use Next.js Image component when possible
- Validate file sizes before upload (max 10MB)
- Use `object-cover` for consistent aspect ratios
- Clean up object URLs: `URL.revokeObjectURL(url)`

### Chart Rendering
- Use responsive containers: `<ResponsiveContainer width="100%" height={300}>`
- Optimize label rendering with custom components
- Limit data points displayed
- Use memoization for expensive calculations

---

## Additional Guidelines

### Accessibility
- Use semantic HTML: `<main>`, `<header>`, `<nav>`, `<section>`
- Include ARIA labels where needed
- Ensure sufficient color contrast (WCAG AA minimum)
- Support keyboard navigation
- Add `alt` text for all images
- Use `sr-only` class for screen reader only text

### Mobile Optimization
- Touch targets minimum 44x44px
- Avoid hover-only interactions
- Test on actual devices
- Use `overflow-x-auto` for horizontal scrolling
- Implement pull-to-refresh where appropriate

### Security
- Never expose API keys to client (no `NEXT_PUBLIC_` prefix for sensitive keys)
- Validate all user inputs
- Sanitize data before display
- Use server actions for sensitive operations
- Implement rate limiting for API calls

### Testing Approach
- Manual testing on multiple devices
- Test error states explicitly
- Verify responsive behavior at all breakpoints
- Test with real data (actual screenshots)
- Validate accessibility with screen readers

---

## Quick Reference Checklist

Before committing code, verify:

- [ ] File names use kebab-case
- [ ] Imports are organized correctly
- [ ] TypeScript types are explicit
- [ ] Logging uses `[v0]` prefix
- [ ] Colors use Tailwind classes (no arbitrary values)
- [ ] Spacing uses Tailwind scale
- [ ] Layout uses flexbox or grid appropriately
- [ ] Responsive classes follow mobile-first pattern
- [ ] Icons include `flex-shrink-0`
- [ ] Error messages are user-friendly
- [ ] Async operations have timeout wrappers
- [ ] Validation happens before processing
- [ ] Components follow standard structure
- [ ] Animations use Framer Motion patterns
- [ ] Accessibility requirements met
- [ ] No sensitive data exposed to client

---

## Version History

- **v1.0** (Current): Initial comprehensive style guide based on existing codebase analysis
