import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useExpensesQuery(token) {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: () =>
      apiRequest("/api/expenses", {
        token,
      }),
    enabled: Boolean(token),
  });
}

export function useAddExpenseMutation(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiRequest("/api/expenses", {
        method: "POST",
        token,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.warnings });
    },
  });
}

export function useDeleteExpenseMutation(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiRequest(`/api/expenses/${id}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
