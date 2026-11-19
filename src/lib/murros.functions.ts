import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

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

export const getThemePath = createServerFn({ method: "GET" })
  .inputValidator((d: { theme: string }) => ({ theme: String(d.theme).slice(0, 80) }))
  .handler(async ({ data }): Promise<PathItem[]> => {
    const { data: rows, error } = await publicClient()
      .from("items")
      .select("id,title,year_start,year_end,type,problem,mechanism,long_effect,current_relevance,importance")
      .contains("domains", [data.theme])
      .eq("unpublished", false)
      .order("importance", { ascending: false })
      .limit(18);
    if (error) throw new Error(error.message);
    return (rows ?? []).sort((a, b) => a.year_start - b.year_start);
  });

export const themePathQuery = (theme: string) =>
  queryOptions({ queryKey: ["theme-path", theme], queryFn: () => getThemePath({ data: { theme } }), staleTime: 600_000 });

export type AtlasTheme = { id: number; name: string; group: string; thesis: string; scores: number[]; labels: string[] };

export const getAtlasThemes = createServerFn({ method: "GET" }).handler(async (): Promise<AtlasTheme[]> => {
  const { data, error } = await publicClient().from("atlas_themes").select("id,payload").order("id");
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
});

export const atlasThemesQuery = () =>
  queryOptions({ queryKey: ["atlas-themes"], queryFn: () => getAtlasThemes(), staleTime: 600_000 });

export const getSystemMap = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [n, e] = await Promise.all([
    sb.from("painekartta_nodes").select("item_id,item_title,year_start,item_type,domains,importance,problem,long_effect,role"),
    sb.from("painekartta_edges").select("from_item_id,to_item_id,relation_type,rationale,pressure_signal,rel_class"),
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
});

export const systemMapQuery = () =>
  queryOptions({ queryKey: ["system-map"], queryFn: () => getSystemMap(), staleTime: 600_000 });
