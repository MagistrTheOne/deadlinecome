import v1 from './registry/vasily.v1.json';
import v2 from './registry/vasily.v2.json';
const registry = { vasily: { v1, v2, default: 'v2' as const } };
export async function loadSystem(name: keyof typeof registry, tag?: string){
  const pack = registry[name]; const ver = (tag ?? pack.default) as keyof typeof pack;
  const p = pack[ver]; if (!p) throw new Error(`prompt-missing:${name}:${String(ver)}`);
  return (p as any).system as string;
}
