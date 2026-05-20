import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { connectDB } from '@/lib/db';
import AILogModel from '@/lib/models/AILog';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const SYSTEM_PROMPT = `You are an expert agricultural AI assistant for Indian farmers. 
Analyze the farmer's issue and classify it accurately.

Return ONLY a valid JSON object with these exact fields:
{
  "crop": "crop name mentioned or inferred",
  "category": "one of: Soil Health | Irrigation | Pest Attack | Fertilizer | Weather | Crop Disease | Seed Quality",
  "severity": "one of: Low | Medium | High | Critical",
  "department": "relevant government department",
  "suggestedAction": "specific actionable advice in 1-2 sentences",
  "confidence": 0.0 to 1.0
}

Severity guidelines:
- Low: Minor issue, no immediate crop loss risk
- Medium: Moderate issue, some crop loss possible
- High: Serious issue, significant crop loss likely
- Critical: Emergency, total crop loss imminent

Be concise and practical. Focus on Indian agricultural context.`;

export async function POST(request: NextRequest) {
  let issue = '';
  let crop = '';
  let language = '';

  try {
    const body = await request.json();
    issue = body.issue ?? '';
    crop = body.crop ?? '';
    language = body.language ?? '';

    if (!issue) {
      return NextResponse.json({ error: 'Issue description is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      const classification = getMockClassification(issue, crop);
      return NextResponse.json({ classification, mock: true });
    }

    const startTime = Date.now();

    const prompt = `Farmer's issue (Language: ${language || 'Hindi/English'}):
Crop: ${crop || 'Not specified'}
Problem: ${issue}

Classify this agricultural issue and provide guidance.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    });

    const processingTime = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content;

    if (!content) throw new Error('Empty response from AI');

    const classification = JSON.parse(content);

    // Persist AI log to MongoDB (fire-and-forget — don't block the response)
    connectDB()
      .then(() =>
        AILogModel.create({
          ticketId: 'pending', // back-filled when the ticket is saved
          operation: 'classify',
          prompt,
          response: content,
          classification,
          model: completion.model ?? 'llama-3.3-70b-versatile',
          processingTimeMs: processingTime,
          isMock: false,
        })
      )
      .catch((err) => console.error('AILog save error:', err));

    return NextResponse.json({
      classification,
      processingTime,
      model: completion.model,
    });
  } catch (error) {
    console.error('AI classify error:', error);
    const classification = getMockClassification(issue, crop);
    return NextResponse.json({
      classification,
      processingTimeMs: 0,
      mock: true,
      error: 'AI service unavailable, using fallback classification',
    });
  }
}

function getMockClassification(issue: string, crop: string) {
  const issueLower = issue.toLowerCase();

  let category = 'Crop Disease';
  let severity = 'Medium';
  let department = 'Plant Protection';
  let suggestedAction = 'Consult your local agriculture officer for detailed guidance.';

  if (issueLower.includes('pest') || issueLower.includes('insect') || issueLower.includes('worm') || issueLower.includes('bollworm')) {
    category = 'Pest Attack';
    severity = 'High';
    department = 'Pest Management';
    suggestedAction = 'Apply recommended pesticide. Set up pheromone traps. Monitor daily.';
  } else if (issueLower.includes('water') || issueLower.includes('irrigation') || issueLower.includes('drip')) {
    category = 'Irrigation';
    severity = 'Medium';
    department = 'Irrigation Engineering';
    suggestedAction = 'Check water supply and irrigation system. Ensure proper drainage.';
  } else if (issueLower.includes('soil') || issueLower.includes('hard') || issueLower.includes('germination')) {
    category = 'Soil Health';
    severity = 'Medium';
    department = 'Soil Science';
    suggestedAction = 'Conduct soil test. Add organic matter. Consider deep plowing.';
  } else if (issueLower.includes('fertilizer') || issueLower.includes('nutrient') || issueLower.includes('yellow')) {
    category = 'Fertilizer';
    severity = 'Low';
    department = 'Horticulture';
    suggestedAction = 'Apply balanced NPK fertilizer. Conduct leaf analysis for micronutrients.';
  } else if (issueLower.includes('weather') || issueLower.includes('rain') || issueLower.includes('hail') || issueLower.includes('flood')) {
    category = 'Weather';
    severity = 'High';
    department = 'Crop Insurance';
    suggestedAction = 'Document damage with photos. File crop insurance claim immediately.';
  } else if (issueLower.includes('seed') || issueLower.includes('germinate')) {
    category = 'Seed Quality';
    severity = 'High';
    department = 'Seed Certification';
    suggestedAction = 'Test seed germination rate. File complaint with seed supplier.';
  }

  if (issueLower.includes('critical') || issueLower.includes('emergency') || issueLower.includes('total loss')) {
    severity = 'Critical';
  } else if (issueLower.includes('minor') || issueLower.includes('small')) {
    severity = 'Low';
  }

  return {
    crop: crop || 'Not specified',
    category,
    severity,
    department,
    suggestedAction,
    confidence: 0.82,
  };
}
