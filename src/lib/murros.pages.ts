import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { readThemePath, readAtlasThemes, readSystemMap } from "./murros.data";

export type { PathItem, AtlasTheme } from "./murros.data";
export const themePathQuery = (theme: string) =>
  queryOptions({ queryKey: ["theme-path", theme], queryFn: () => readThemePath(supabase, theme), staleTime: 600_000 });
export const atlasThemesQuery = () =>
  queryOptions({ queryKey: ["atlas-themes"], queryFn: () => readAtlasThemes(supabase), staleTime: 600_000 });
export const systemMapQuery = () =>
  queryOptions({ queryKey: ["system-map"], queryFn: () => readSystemMap(supabase), staleTime: 600_000 });
