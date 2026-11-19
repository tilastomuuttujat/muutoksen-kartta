import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PathItem = {
  id: string;
  title: string;
  year_start: number;
  year_end: number;
  type: string;
  problem: string;
  mechanism: string;
  long_effect: string;
  current_relevance: string;
  importance: number;
};

export async function readThemePath(client: SupabaseClient<Database>, theme: string): Promise<PathItem[]> {
  const { data: rows, error } = await client
    .from("items")
    .select("id,title,year_start,year_end,type,problem,mechanism,long_effect,current_relevance,importance")
    .contains("domains", [String(theme).slice(0, 80)])
    .eq("unpublished", false)
    .order("importance", { ascending: false })
    .limit(18);
  if (error) throw new Error(error.message);
  return (rows ?? []).sort((a, b) => a.year_start - b.year_start);
}

export type AtlasTheme = { id: number; name: string; group: string; thesis: string; scores: number[]; labels: string[] };

export async function readAtlasThemes(client: SupabaseClient<Database>): Promise<AtlasTheme[]> {
  const { data, error } = await client.from("atlas_themes").select("id,payload").order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => {
    const p = (r.payload ?? {}) as { name?: unknown; group?: unknown; thesis?: unknown; scores?: unknown; steps?: unknown };
    return {
      id: r.id as number,
      name: String(p.name ?? ""),
      group: String(p.group ?? "Muut"),
      thesis: String(p.thesis ?? ""),
      scores: Array.isArray(p.scores) ? (p.scores as unknown[]).map(Number) : [],
      labels: Array.isArray(p.steps) ? (p.steps as { label?: unknown }[]).map((s) => String(s.label ?? "")) : [],
    };
  });
}

export async function readSystemMap(client: SupabaseClient<Database>) {
  const [n, e] = await Promise.all([
    client.from("painekartta_nodes").select("item_id,item_title,year_start,item_type,domains,importance,problem,long_effect,role"),
    client.from("painekartta_edges").select("from_item_id,to_item_id,relation_type,rationale,pressure_signal,rel_class"),
  ]);
  if (n.error) throw new Error(n.error.message);
  if (e.error) throw new Error(e.error.message);
  const nodes = (n.data ?? []).filter((r) => r.year_start != null).map((r) => ({
    id: r.item_id, title: r.item_title, year: r.year_start as number, type: r.item_type ?? "", domains: r.domains ?? [],
    importance: r.importance ?? 2, problem: r.problem ?? "", effect: r.long_effect ?? "", role: r.role ?? "",
  }));
  const ids = new Set(nodes.map((x) => x.id));
  const edges = (e.data ?? []).filter((r) => ids.has(r.from_item_id) && ids.has(r.to_item_id) && r.from_item_id !== r.to_item_id).map((r) => ({
    from: r.from_item_id, to: r.to_item_id, type: r.relation_type, rationale: r.rationale ?? "", pressure: r.pressure_signal, cls: r.rel_class ?? "",
  }));
  return { nodes, edges };
}
