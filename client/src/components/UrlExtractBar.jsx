import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// ── Helpers ────────────────────────────────────────────────────

/**
 * Strip script/style/nav tags from a parsed document and
 * return trimmed plain text, capped at maxChars.
 */
const extractText = (html, maxChars = 12000) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, nav, footer, header, aside').forEach(el => el.remove());
  return (doc.body?.innerText || doc.body?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);
};

// ── Component ─────────────────────────────────────────────────

const UrlExtractBar = ({ onToast }) => {
  const [url, setUrl]       = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetch = async () => {
    if (!url.trim()) {
      onToast({ type: 'error', message: 'Please enter a hackathon URL first.' });
      return;
    }

    let domain = '';
    try {
      domain = new URL(url.trim()).hostname;
    } catch {
      onToast({ type: 'error', message: 'Invalid URL — make sure it starts with https://' });
      return;
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      onToast({ type: 'error', message: 'VITE_GROQ_API_KEY is not set in .env.local' });
      return;
    }

    setLoading(true);
    try {
      // ── Step 1: Fetch page via corsproxy ──────────
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url.trim())}`;
      const proxyRes  = await fetch(proxyUrl);
      if (!proxyRes.ok) throw new Error(`Proxy error: ${proxyRes.status}`);
      const htmlText = await proxyRes.text();

      // ── Step 2: Strip HTML → plain text ───────────────────────
      const pageText = extractText(htmlText || '');
      if (!pageText) throw new Error('Could not extract any text from that page.');

      // ── Step 3: Groq LLM extraction ───────────────────────────
      const groqRes = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are a hackathon data extractor. Extract details ONLY from the 
provided text. Return ONLY a raw JSON object — no markdown, no 
backticks, no explanation. 

Rules:
- name: exact hackathon name as written on the page
- location: "Online" if virtual, otherwise city name
- prize_pool: exact prize amount as written (e.g. "$10,000" or "₹1,00,000")
- description: 2-3 sentence summary of what the hackathon is about
- category: detect from content using explicit keyword matches:
    * If text contains any of: "AI", "artificial intelligence", "machine learning", "ML", "LLM", "agents", "GPT", "neural", "deep learning", "NLP" → "AI/ML"
    * If text contains: "blockchain", "web3", "crypto", "NFT", "ethereum", "solana" → "Blockchain"
    * If text contains: "mobile", "android", "iOS", "flutter", "react native" → "Mobile"
    * If text contains: "cyber", "security", "hacking", "CTF", "penetration" → "Cybersecurity"
    * If text contains: "data science", "analytics", "visualization", "dataset" → "Data Science"
    * Only fall back to "Web Development" if NONE of the above keywords match
- priority: "High" if prize > $5000 or deadline within 7 days, 
            "Medium" if prize $1000-$5000, 
            "Low" otherwise
- registration_deadline: Search the text carefully for any dates mentioned near words like 'registration', 'deadline', 'closes', 'apply by', 'last date', 'applications close'. Convert any found date to ISO 8601 format YYYY-MM-DDTHH:mm:ss. If only a date is found with no time, use T23:59:00 as the default time. If not found, use null.
- submission_deadline: Same rules as registration_deadline, but look for words like 'submission', 'project due', 'ends'. If not found, use null.

Return exactly this structure:
{
  "name": "",
  "location": "",
  "prize_pool": "",
  "description": "",
  "category": "",
  "priority": "",
  "registration_deadline": null,
  "submission_deadline": null
}`,
            },
            {
              role: 'user',
              content: `Extract hackathon details from this webpage:\n\n${pageText}`,
            },
          ],
        }),
      });

      if (!groqRes.ok) {
        const errJson = await groqRes.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Groq API error ${groqRes.status}`);
      }

      const groqJson  = await groqRes.json();
      const rawText   = groqJson.choices?.[0]?.message?.content || '{}';

      // Strip accidental markdown fences
      const jsonStr   = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const extracted = JSON.parse(jsonStr);

      console.log('Groq raw extraction:', extracted);

      // ── Step 4: Navigate to /add with pre-fill state ──────────
      onToast({ type: 'success', message: `✓ Details auto-filled from ${domain}` });
      navigate('/add', { state: { prefill: extracted } });
    } catch (err) {
      console.error('[UrlExtractBar]', err);
      onToast({ type: 'error', message: err.message || 'Extraction failed — please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mb-8">
      {/* Gradient border wrapper */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 rounded-2xl opacity-80" />
      <div className="relative m-[1.5px] bg-white rounded-[14px] px-5 py-4 shadow-lg shadow-indigo-100">

        {/* Label row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 text-[11px] font-black uppercase tracking-widest text-indigo-600">
            ✦ AI Extract
          </span>
          <span className="text-xs text-gray-400 font-medium">
            Paste a hackathon link — Groq will auto-fill the form for you
          </span>
        </div>

        {/* Input row */}
        <div className="flex gap-3 items-center">
          {/* URL Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 select-none" aria-hidden="true">
              🔗
            </span>
            <input
              id="url-extract-input"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://devpost.com/hackathons/..."
              disabled={loading}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 transition"
            />
          </div>

          {/* Fetch button */}
          <button
            id="url-extract-btn"
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="relative overflow-hidden flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all whitespace-nowrap"
          >
            {/* Shimmer overlay */}
            {!loading && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            )}

            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Extracting…
              </>
            ) : (
              <>
                Fetch Details
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlExtractBar;
