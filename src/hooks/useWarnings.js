import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useWarningsQuery(token, enabled = false) {
  return useQuery({
    queryKey: queryKeys.warnings,
    queryFn: () =>
      apiRequest("/api/warnings", {
        token,
      }),
    enabled: Boolean(token) && enabled,
  });
}
