import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useDashboardQuery(token) {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () =>
      apiRequest("/api/dashboard", {
        token,
      }),
    enabled: Boolean(token),
  });
}
