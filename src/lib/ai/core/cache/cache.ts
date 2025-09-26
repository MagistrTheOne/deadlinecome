export interface Cache { get<T>(k: string): Promise<T|null>; set<T>(k: string, v: T, ttlSec: number): Promise<void>; }
class InMem implements Cache { private m = new Map<string, {v:any,e:number}>(); async get<T>(k:string){ const i=this.m.get(k); if(!i||i.e<Date.now()) return null; return i.v as T } async set<T>(k:string,v:T,ttl:number){ this.m.set(k,{v,e:Date.now()+ttl*1000}); } }
export const cache: Cache = new InMem();
export function aiCacheKey(input: { route: string; prompt: string; user?: string }) {
  return `ai:${input.route}:${input.user ?? 'anon'}:${hash(input.prompt)}`;
}
function hash(s: string){ let h=0; for (let i=0;i<s.length;i++){ h=(h<<5)-h + s.charCodeAt(i); h|=0; } return h.toString(36); }
