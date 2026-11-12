import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Server-side Gemini API Route for Legal Summaries
app.post('/api/legal-summary', async (req, res) => {
  try {
    const { title, context, type = 'Consultation Minutes', focus = 'Executive Board Briefing', metadata = {} } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback flag: Client synthesizes complete institutional legal brief
      return res.status(200).json({
        summary: null,
        status: 'fallback_required',
        message: 'No GEMINI_API_KEY detected in environment; using institutional legal synthesis engine.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `You are a Senior Research Advocate and Partner at Petersons Angwenyi & Associates Advocates, Upper Hill, Nairobi, Kenya.
Generate an authoritative, rigorous, and exhaustive Legal Executive Briefing based on the following matter:

TITLE / SUBJECT: ${title}
TYPE: ${type}
TARGET FOCUS: ${focus}
METADATA: ${JSON.stringify(metadata, null, 2)}

SOURCE RECORD / TRANSCRIPT / DOCUMENT TEXT:
${context}

STRUCTURE YOUR LEGAL SUMMARY INTO THESE DISTINCT INSTITUTIONAL SECTIONS:
1. EXECUTIVE RATIO DECIDENDI & COMMERCIAL THESIS
   - Distill the core dispute, legal risk exposure, financial quantum, and primary recommendation for client leadership.
2. FORENSIC EVIDENTIARY MATRIX & EXPERT FINDINGS
   - Detail the primary exhibits, expert reports, technical telemetry, and chain of custody compliance (citing Section 106B of the Kenya Evidence Act Cap 80 where applicable).
3. STATUTORY & PROCEDURAL RISK ASSESSMENT
   - Detail counter-party claims, statutory limitation periods, procedural hurdles, and relevant Kenyan laws (Civil Procedure Act Cap 21, Advocates Act Cap 16, FIDIC sub-clauses, or Arbitration Act Cap 49).
4. CHAMBERS DIRECTIVES & PROCEDURAL ACTION TIMELINE
   - Concrete bullet points with recommended steps, court filings, and conservatory injunction actions.
5. ADVOCATE CERTIFICATION STATEMENT
   - Formal certification under the Advocates Act (Cap 16) by Petersons Angwenyi & Associates Advocates.

Maintain a prestigious, rigorous, formal legal tone suitable for Supreme Court / High Court advocates and corporate general counsel.`;

    let summaryText: string | undefined;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
        });
        summaryText = response.text;
        if (summaryText) break;
      } catch (err: any) {
        if (attempt === 2) throw err;
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    return res.json({
      summary: summaryText,
      status: 'success',
      model: 'gemini-4-hydrogen'
    });
  } catch (error: any) {
    console.error('Gemini Legal Summary API Error (routing to fallback):', error.message || error);
    return res.status(200).json({
      summary: null,
      status: 'error_fallback',
      error: error.message || 'Gemini processing failed, routing to institutional synthesis'
    });
  }
});

// Server-side Gemini API Route for Landmark Case Brief Key Takeaways
app.post('/api/case-takeaways', async (req, res) => {
  try {
    const { brief, language = 'en' } = req.body as {
      brief?: {
        id: string;
        matterName: string;
        clientCategory: string;
        forum: string;
        year: number;
        value: string;
        summary: string;
        impact: string;
      };
      language?: 'en' | 'sw';
    };

    if (!brief || !brief.matterName) {
      return res.status(400).json({
        error: 'A valid landmark case brief is required to generate Key Takeaways.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Check your key in Settings > Secrets.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetLanguageNote =
      language === 'sw'
        ? 'Write all JSON string values in formal legal Swahili (Kiswahili sanifu cha kisheria).'
        : 'Write all JSON string values in authoritative, concise Kenyan/Commonwealth legal English.';

    const prompt = `Analyze the following landmark case handled by Petersons Angwenyi & Associates Advocates (Nairobi, Kenya) and distill the key legal precedents established.

MATTER NAME: ${brief.matterName}
FORUM / COURT: ${brief.forum}
YEAR: ${brief.year}
CLIENT SECTOR: ${brief.clientCategory}
FINANCIAL EXPOSURE: ${brief.value}
FACTUAL SUMMARY: ${brief.summary}
HOLDING / JUDICIAL IMPACT: ${brief.impact}

Produce:
1. A concise one-sentence doctrinal headline summarizing the overarching precedent.
2. Between 4 and 5 concise, high-impact bullet points capturing the specific legal precedents, procedural principles, and commercial compliance rules established by this matter. Keep each bullet crisp (1-2 sentences) and anchor each bullet to a concrete Kenyan statutory provision, rule, or judicial doctrine.`;

    let rawJsonText: string | undefined;
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction: `You are a Senior Appellate Counsel and Legal Researcher summarizing Kenyan superior court and international arbitral precedents for corporate boards. ${targetLanguageNote}`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: {
                  type: Type.STRING,
                  description: 'One-sentence doctrinal summary of the landmark ruling.',
                },
                takeaways: {
                  type: Type.ARRAY,
                  description: 'Concise bulleted list of 4 to 5 legal precedents established.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      precedentTitle: {
                        type: Type.STRING,
                        description: 'Short 3-6 word doctrinal heading for the bullet point.',
                      },
                      summaryBullet: {
                        type: Type.STRING,
                        description: 'Concise 1-2 sentence explanation of the precedent established.',
                      },
                      statutoryAnchor: {
                        type: Type.STRING,
                        description: 'Relevant Kenyan statute, rule, constitutional article, or convention.',
                      },
                    },
                    required: ['precedentTitle', 'summaryBullet', 'statutoryAnchor'],
                  },
                },
              },
              required: ['headline', 'takeaways'],
            },
          },
        });

        rawJsonText = response.text?.trim();
        if (rawJsonText) break;
      } catch (err) {
        lastError = err;
        if (attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!rawJsonText) {
      const msg =
        lastError instanceof Error
          ? lastError.message
          : 'Gemini failed to return a valid Key Takeaways response.';
      return res.status(502).json({ error: msg });
    }

    const parsed = JSON.parse(rawJsonText) as {
      headline: string;
      takeaways: Array<{
        precedentTitle: string;
        summaryBullet: string;
        statutoryAnchor: string;
      }>;
    };

    return res.json({
      briefId: brief.id,
      headline: parsed.headline,
      takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
      generatedAt: new Date().toISOString(),
      model: 'gemini-4-hydrogen',
    });
  } catch (error: any) {
    console.error('Gemini Case Takeaways Error:', error?.message || error);
    const statusCode =
      typeof error?.status === 'number' && error.status >= 400 && error.status < 600
        ? error.status
        : 500;
    return res.status(statusCode).json({
      error:
        error?.message ||
        'Unable to generate Key Takeaways via Gemini API at this time.',
    });
  }
});

// Meeting Alert Dispatch Route (Simulated SMS / Email / Webhook Gateway)
app.post('/api/meeting-alerts/dispatch', (req, res) => {
  const { consultationId, clientPhone, clientEmail, alertType, scheduledTime, title } = req.body;
  const dispatchRef = `PAA-ALERT-${Date.now().toString(36).toUpperCase()}`;
  
  return res.json({
    success: true,
    dispatchRef,
    timestamp: new Date().toISOString(),
    channel: alertType || 'SMS & Email',
    recipient: clientPhone || clientEmail || 'In-House Counsel',
    message: `Chambers Alert dispatched for "${title}" scheduled at ${scheduledTime}.`
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const portArgIndex = process.argv.indexOf('--port');
  const portArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : undefined;
  const port = Number(process.env.PORT) || portArg || 3000;

  const hostArgIndex = process.argv.indexOf('--host');
  const hostArg = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : undefined;
  const host = process.env.HOST || hostArg || '0.0.0.0';

  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true'
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, host, () => {
    console.log(`Petersons Angwenyi & Associates server listening on http://${host}:${port}`);
  });
}

startServer();
