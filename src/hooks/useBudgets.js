import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useBudgetsQuery(token) {
  return useQuery({
    queryKey: queryKeys.budgets,
    queryFn: () =>
      apiRequest("/api/budgets", {
        token,
      }),
    enabled: Boolean(token),
  });
}

export function useSetBudgetLimitMutation(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category, limit }) =>
      apiRequest(`/api/budgets/${category}`, {
        method: "PUT",
        token,
        body: { limit },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
