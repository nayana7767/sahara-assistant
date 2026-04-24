import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const COMPLAINT_PROMPTS: Record<string, string> = {
  fir: `Generate a formal First Information Report (FIR) based on the following incident details. Use proper legal format as per BNSS (Bharatiya Nagarik Suraksha Sanhita). Include:
- Header with police station details placeholder
- Date and time of incident
- Place of occurrence
- Description of offense
- Names of accused (if known)
- List of witnesses
- Details of property involved (if any)
- Signature section

Use placeholders like [YOUR NAME], [DATE], [POLICE STATION NAME] etc. where personal details are needed.`,

  rti: `Generate a formal RTI (Right to Information) application under the RTI Act, 2005. Include:
- Proper header with PIO details placeholder
- Applicant details section
- Clear statement that this is an RTI application
- Numbered list of specific information sought
- Declaration by applicant
- Fee details (₹10 for Central, varies for State)
- Signature section

Use placeholders where needed.`,

  consumer: `Generate a formal consumer complaint for filing with the Consumer Forum under the Consumer Protection Act, 2019. Include:
- Proper header with Consumer Forum details
- Complainant details
- Opposite party (company/service provider) details
- Facts of the case in chronological order
- Deficiency in service/defect in goods
- Relief sought
- List of documents to be attached
- Verification and signature

Use placeholders where needed.`,

  legal_notice: `Generate a formal legal notice. Include:
- Notice header with advocate details placeholder
- Through/Under which act/section
- To: Party details
- Subject line
- Facts of the matter
- Legal position and rights violated
- Demand/Relief sought
- Time limit for response
- Consequences of non-compliance
- Signature

Use placeholders where needed.`,

  affidavit: `Generate a formal affidavit (sworn statement). Include:
- Header with court/authority name placeholder
- Deponent details (Name, Age, Father's Name, Address)
- Title: "AFFIDAVIT"
- Opening: "I, [NAME], son/daughter of [FATHER'S NAME], aged [AGE], resident of [ADDRESS], do hereby solemnly affirm and declare as follows:"
- Numbered paragraphs for each statement of fact
- Declaration: "I hereby declare that the contents of this affidavit are true and correct to the best of my knowledge and belief."
- Place, Date, and Deponent's signature section
- Verification clause
- Notary stamp and seal placeholder

Use placeholders where needed.`,
}

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: 'Generate the document in English.',
  hi: 'Generate the document in Hindi (Devanagari script).',
  kn: 'Generate the document in Kannada (ಕನ್ನಡ script).',
  te: 'Generate the document in Telugu (తెలుగు script).',
  ta: 'Generate the document in Tamil (தமிழ் script).',
}

export async function POST(req: Request) {
  const { type, details, language = 'en', sessionId } = await req.json()

  const templatePrompt = COMPLAINT_PROMPTS[type]
  if (!templatePrompt) {
    return NextResponse.json({ error: 'Invalid complaint type' }, { status: 400 })
  }

  const languageInstruction = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.en

  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are a legal document drafting assistant specializing in Indian law. ${languageInstruction}`,
      prompt: `${templatePrompt}

Incident/Case Details:
${details}

Generate a complete, properly formatted document.`,
      maxOutputTokens: 2000,
    })

    // Save to database
    const supabase = await createClient()
    await supabase.from('generated_complaints').insert({
      session_id: sessionId || null,
      complaint_type: type,
      content: result.text,
      metadata: { details, language },
    })

    return NextResponse.json({ content: result.text })
  } catch (error) {
    console.error('Error generating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}
