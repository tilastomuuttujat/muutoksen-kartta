import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { readThemePath, readAtlasThemes, readSystemMap } from "./murros.data";
export type { PathItem, AtlasTheme } from "./murros.data";
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

export const getThemePath = createServerFn({ method: "GET" })
  .inputValidator((d: { theme: string }) => ({ theme: String(d.theme).slice(0, 80) }))
  .handler(({ data }) => readThemePath(publicClient(), data.theme));

export const getAtlasThemes = createServerFn({ method: "GET" }).handler(() => readAtlasThemes(publicClient()));
export const getSystemMap = createServerFn({ method: "GET" }).handler(() => readSystemMap(publicClient()));

export const themePathQuery = (theme: string) =>
  queryOptions({ queryKey: ["theme-path", theme], queryFn: () => getThemePath({ data: { theme } }), staleTime: 600_000 });
export const atlasThemesQuery = () =>
  queryOptions({ queryKey: ["atlas-themes"], queryFn: () => getAtlasThemes(), staleTime: 600_000 });
export const systemMapQuery = () =>
  queryOptions({ queryKey: ["system-map"], queryFn: () => getSystemMap(), staleTime: 600_000 });
