import { AIProvider, AIRequest, AIResponse, safeParseJson } from '../ai-client';

export class GigaChatProvider implements AIProvider {
  name: 'gigachat' = 'gigachat';
  constructor(private cfg: { baseUrl: string; apiKey: string; timeoutMs?: number }) {}
  async chat(req: AIRequest): Promise<AIResponse> {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), this.cfg.timeoutMs ?? 15000);
    const res = await fetch(`${this.cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: [ req.system ? { role: 'system', content: req.system } : null, { role: 'user', content: req.prompt } ].filter(Boolean),
        response_format: req.json ? { type: 'json_object' } : undefined,
      }),
      signal: c.signal,
    }).finally(() => clearTimeout(t));
    if (!res.ok) throw new Error(`GigaChat ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    const safe = req.json ? safeParseJson(text) : undefined;
    return { text, json: safe && 'ok' in safe && safe.ok ? safe.value : undefined, raw: data, model: 'gigachat:latest' };
  }
}
