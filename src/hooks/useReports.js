import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useReportsQuery(token, reportParams) {
  const query = new URLSearchParams(reportParams).toString();

  return useQuery({
    queryKey: [...queryKeys.reports, query],
    queryFn: () =>
      apiRequest(`/api/reports?${query}`, {
        token,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: Boolean(token) && Boolean(query),
  });
}
