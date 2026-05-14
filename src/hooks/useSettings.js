import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useSettingsQuery(token) {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () =>
      apiRequest("/api/settings", {
        token,
      }),
    enabled: Boolean(token),
  });
}

export function useUpdateSalaryMutation(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (salary) =>
      apiRequest("/api/settings/salary", {
        method: "PUT",
        token,
        body: { salary: Number(salary) },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
    },
  });
}

export function useResetFinanceMutation(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest("/api/settings/reset", {
        method: "POST",
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      queryClient.invalidateQueries({ queryKey: queryKeys.warnings });
    },
  });
}
