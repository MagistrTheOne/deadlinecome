import { AIProvider, AIRequest, AIResponse, safeParseJson } from '../ai-client';

export class OpenAIProvider implements AIProvider {
  name: 'openai' = 'openai';
  constructor(private cfg: { apiKey: string; timeoutMs?: number }) {}
  async chat(req: AIRequest): Promise<AIResponse> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [ req.system ? { role: 'system', content: req.system } : null, { role: 'user', content: req.prompt } ].filter(Boolean),
        response_format: req.json ? { type: 'json_object' } : undefined,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    const safe = req.json ? safeParseJson(text) : undefined;
    return { text, json: safe && 'ok' in safe && safe.ok ? safe.value : undefined, raw: data, model: 'gpt-4o-mini' };
  }
}
