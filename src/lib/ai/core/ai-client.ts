// AI unified client & types
export type AIModel = 'gigachat:latest' | 'gpt-4o-mini' | 'embedding-small';
export interface AIRequest { prompt: string; system?: string; json?: boolean; temperature?: number }
export interface AIResponse { text?: string; json?: unknown; raw: unknown; model: AIModel; usage?: { tokens?: number; cost_usd?: number } }

export interface AIProvider {
  name: 'gigachat' | 'openai';
  chat(req: AIRequest, signal?: AbortSignal): Promise<AIResponse>;
  embed?(input: string[]): Promise<number[][]>;
}

export class AIClient {
  constructor(private primary: AIProvider, private backup?: AIProvider) {}
  async chat(req: AIRequest, opts?: { prefer?: 'primary'|'backup'; json?: boolean }): Promise<AIResponse> {
    try {
      return await this.primary.chat({ ...req, json: opts?.json ?? req.json });
    } catch (e) {
      if (!this.backup || opts?.prefer === 'primary') throw e;
      return this.backup.chat({ ...req, json: opts?.json ?? req.json });
    }
  }
}

// ---- Safe JSON helpers ----
export function safeParseJson(s: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try { return { ok: true, value: JSON.parse(extractTopJson(s)) }; }
  catch (e: any) { return { ok: false, error: e?.message ?? 'json-parse-failed' }; }
}

export function extractTopJson(s: string): string {
  const start = s.indexOf('{'); const end = s.lastIndexOf('}');
  if (start >= 0 && end >= start) return s.slice(start, end + 1);
  throw new Error('no-json-object');
}
