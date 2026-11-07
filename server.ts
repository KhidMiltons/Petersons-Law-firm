import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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
          model: 'gemini-3.8-flash',
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
      model: 'gemini-3.8-flash'
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
  const port = Number(process.env.PORT) || 3000;

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

  app.listen(port, '0.0.0.0', () => {
    console.log(`Petersons Angwenyi & Associates server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
