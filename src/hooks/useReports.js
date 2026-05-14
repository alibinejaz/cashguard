import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useReportsQuery(token) {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: () =>
      apiRequest("/api/reports", {
        token,
      }),
    enabled: Boolean(token),
  });
}
