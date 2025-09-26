type Labels = Record<string,string|number|undefined>;
const counters = new Map<string, number>();
const hist = new Map<string, number[]>();
export function inc(name: string, _labels?: Labels, v = 1){ counters.set(name, (counters.get(name)||0)+v); }
export function observe(name: string, _labels: Labels, v: number){ const a = hist.get(name)||[]; a.push(v); hist.set(name,a); }
export function snapshot(){ return { counters: Object.fromEntries(counters), hist: Object.fromEntries([...hist.entries()].map(([k,v])=>[k,{count:v.length,min:Math.min(...v),max:Math.max(...v)}])) }; }
