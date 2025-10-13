import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generate HTML content that Word can open
    const htmlContent = generateWordHTML(data)

    // Convert to blob
    const blob = new Blob([htmlContent], {
      type: "application/msword",
    })

    // Return as downloadable file
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="love-lens-analysis-${Date.now()}.doc"`,
      },
    })
  } catch (error) {
    console.error("Error in export-word route:", error)
    return NextResponse.json({ error: "Failed to generate Word document" }, { status: 500 })
  }
}

function generateWordHTML(data: any): string {
  const subjectALabel = data.subjectALabel || "Person A"
  const subjectBLabel = data.subjectBLabel || "Person B"

  return `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Love Lens Analysis</title>
  <style>
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; }
    h1 { color: #7c3aed; font-size: 24pt; margin-top: 12pt; margin-bottom: 6pt; }
    h2 { color: #7c3aed; font-size: 18pt; margin-top: 10pt; margin-bottom: 6pt; }
    h3 { color: #7c3aed; font-size: 14pt; margin-top: 8pt; margin-bottom: 4pt; }
    p { margin-top: 0; margin-bottom: 10pt; }
    ul { margin-top: 0; margin-bottom: 10pt; }
    .header { text-align: center; margin-bottom: 20pt; }
    .section { margin-bottom: 15pt; page-break-inside: avoid; }
    .score { font-size: 36pt; font-weight: bold; color: #7c3aed; text-align: center; }
    .badge { background-color: #f3e8ff; color: #7c3aed; padding: 2pt 8pt; border-radius: 4pt; display: inline-block; margin: 2pt; }
    .feedback-box { background-color: #f9fafb; border-left: 4pt solid #7c3aed; padding: 10pt; margin: 10pt 0; }
    .strength { color: #059669; }
    .growth { color: #d97706; }
    .connection { color: #7c3aed; }
  </style>
</head>
<body>
  <div class='header'>
    <h1>💖 Love Lens: Relationship Analysis</h1>
    <p><em>A reflection of emotional patterns and communication dynamics</em></p>
    ${data.messageCount ? `<p>Based on ${data.messageCount} messages from ${data.screenshotCount || 0} screenshots</p>` : ""}
  </div>

  <div class='section'>
    <h2>⚠️ Important Note</h2>
    <p><strong>This analysis is for informational purposes only and is not a substitute for professional therapy or counseling.</strong> If you're experiencing relationship difficulties, consider consulting a licensed therapist.</p>
  </div>

  ${
    data.introductionNote
      ? `
  <div class='section'>
    <h2>📋 Introduction</h2>
    <p>${data.introductionNote}</p>
  </div>
  `
      : ""
  }

  <div class='section'>
    <h2>❤️ Overall Relationship Health</h2>
    <p class='score'>${data.overallRelationshipHealth?.score || 7}/10</p>
    <p>${data.overallRelationshipHealth?.description || ""}</p>
  </div>

  <div class='section'>
    <h2>💬 Communication Styles & Emotional Tone</h2>
    <p>${data.communicationStylesAndEmotionalTone?.description || ""}</p>
    ${
      data.communicationStylesAndEmotionalTone?.emotionalVibeTags
        ? `
    <p><strong>Emotional Vibe:</strong> ${data.communicationStylesAndEmotionalTone.emotionalVibeTags.map((tag: string) => `<span class='badge'>${tag}</span>`).join(" ")}</p>
    `
        : ""
    }
    <h3>${subjectALabel}'s Style</h3>
    <p>${data.communicationStylesAndEmotionalTone?.subjectAStyle || ""}</p>
    <h3>${subjectBLabel}'s Style</h3>
    <p>${data.communicationStylesAndEmotionalTone?.subjectBStyle || ""}</p>
    ${
      data.communicationStylesAndEmotionalTone?.regulationPatternsObserved
        ? `
    <p><strong>Regulation Patterns:</strong> ${data.communicationStylesAndEmotionalTone.regulationPatternsObserved}</p>
    `
        : ""
    }
  </div>

  <div class='section'>
    <h2>🔁 Recurring Patterns</h2>
    <p>${data.recurringPatternsIdentified?.description || ""}</p>
    ${
      data.recurringPatternsIdentified?.positivePatterns?.length
        ? `
    <h3>✅ Positive Patterns</h3>
    <ul>
      ${data.recurringPatternsIdentified.positivePatterns.map((p: string) => `<li>${p}</li>`).join("")}
    </ul>
    `
        : ""
    }
    ${
      data.recurringPatternsIdentified?.loopingMiscommunicationsExamples?.length
        ? `
    <h3>🔄 Looping Miscommunications</h3>
    <ul>
      ${data.recurringPatternsIdentified.loopingMiscommunicationsExamples.map((p: string) => `<li>${p}</li>`).join("")}
    </ul>
    `
        : ""
    }
  </div>

  <div class='section'>
    <h2>🧠 Reflective Frameworks</h2>
    ${
      data.reflectiveFrameworks?.attachmentEnergies
        ? `
    <p><strong>Attachment Energies:</strong> ${data.reflectiveFrameworks.attachmentEnergies}</p>
    `
        : ""
    }
    ${
      data.reflectiveFrameworks?.gottmanConflictMarkers
        ? `
    <p><strong>Gottman Conflict Markers:</strong> ${data.reflectiveFrameworks.gottmanConflictMarkers}</p>
    `
        : ""
    }
    ${
      data.reflectiveFrameworks?.emotionalIntelligenceIndicators
        ? `
    <p><strong>Emotional Intelligence:</strong> ${data.reflectiveFrameworks.emotionalIntelligenceIndicators}</p>
    `
        : ""
    }
  </div>

  <div class='section'>
    <h2>🚧 What's Getting in the Way</h2>
    <p>${data.whatsGettingInTheWay?.description || ""}</p>
    ${
      data.whatsGettingInTheWay?.emotionalMismatches
        ? `
    <p><strong>Emotional Mismatches:</strong> ${data.whatsGettingInTheWay.emotionalMismatches}</p>
    `
        : ""
    }
    ${
      data.whatsGettingInTheWay?.communicationGaps
        ? `
    <p><strong>Communication Gaps:</strong> ${data.whatsGettingInTheWay.communicationGaps}</p>
    `
        : ""
    }
  </div>

  <div class='section'>
    <h2>💡 Constructive Feedback</h2>
    
    <h3>For ${subjectALabel}</h3>
    <div class='feedback-box'>
      ${
        data.constructiveFeedback?.subjectA?.strengths?.length
          ? `
      <p class='strength'><strong>✅ Strengths:</strong></p>
      <ul>
        ${data.constructiveFeedback.subjectA.strengths.map((s: string) => `<li>${s}</li>`).join("")}
      </ul>
      `
          : ""
      }
      ${
        data.constructiveFeedback?.subjectA?.gentleGrowthNudges?.length
          ? `
      <p class='growth'><strong>📈 Growth Nudges:</strong></p>
      <ul>
        ${data.constructiveFeedback.subjectA.gentleGrowthNudges.map((n: string) => `<li>${n}</li>`).join("")}
      </ul>
      `
          : ""
      }
      ${
        data.constructiveFeedback?.subjectA?.connectionBoosters?.length
          ? `
      <p class='connection'><strong>💫 Connection Boosters:</strong></p>
      <ul>
        ${data.constructiveFeedback.subjectA.connectionBoosters.map((b: string) => `<li>${b}</li>`).join("")}
      </ul>
      `
          : ""
      }
    </div>

    <h3>For ${subjectBLabel}</h3>
    <div class='feedback-box'>
      ${
        data.constructiveFeedback?.subjectB?.strengths?.length
          ? `
      <p class='strength'><strong>✅ Strengths:</strong></p>
      <ul>
        ${data.constructiveFeedback.subjectB.strengths.map((s: string) => `<li>${s}</li>`).join("")}
      </ul>
      `
          : ""
      }
      ${
        data.constructiveFeedback?.subjectB?.gentleGrowthNudges?.length
          ? `
      <p class='growth'><strong>📈 Growth Nudges:</strong></p>
      <ul>
        ${data.constructiveFeedback.subjectB.gentleGrowthNudges.map((n: string) => `<li>${n}</li>`).join("")}
      </ul>
      `
          : ""
      }
      ${
        data.constructiveFeedback?.subjectB?.connectionBoosters?.length
          ? `
      <p class='connection'><strong>💫 Connection Boosters:</strong></p>
      <ul>
        ${data.constructiveFeedback.subjectB.connectionBoosters.map((b: string) => `<li>${b}</li>`).join("")}
      </ul>
      `
          : ""
      }
    </div>

    <h3>For Both Partners</h3>
    <div class='feedback-box'>
      ${
        data.constructiveFeedback?.forBoth?.sharedStrengths?.length
          ? `
      <p class='strength'><strong>✅ Shared Strengths:</strong></p>
      <ul>
        ${data.constructiveFeedback.forBoth.sharedStrengths.map((s: string) => `<li>${s}</li>`).join("")}
      </ul>
      `
          : ""
      }
      ${
        data.constructiveFeedback?.forBoth?.sharedGrowthNudges?.length
          ? `
      <p class='growth'><strong>📈 Shared Growth Nudges:</strong></p>
      <ul>
        ${data.constructiveFeedback.forBoth.sharedGrowthNudges.map((n: string) => `<li>${n}</li>`).join("")}
      </ul>
      `
          : ""
      }
    </div>
  </div>

  <div class='section'>
    <h2>🔮 Outlook</h2>
    <p>${data.outlook || ""}</p>
  </div>

  ${
    data.keyTakeaways?.length
      ? `
  <div class='section'>
    <h2>🎯 Key Takeaways</h2>
    <ul>
      ${data.keyTakeaways.map((t: string) => `<li>${t}</li>`).join("")}
    </ul>
  </div>
  `
      : ""
  }

  <div class='section'>
    <p><em>Generated by Love Lens on ${new Date().toLocaleDateString()}</em></p>
  </div>
</body>
</html>
  `.trim()
}
