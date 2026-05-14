import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function usePlansQuery(token) {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: () =>
      apiRequest("/api/plans", {
        token,
      }),
    enabled: Boolean(token),
  });
}

const invalidateRelated = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.plans });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
  queryClient.invalidateQueries({ queryKey: queryKeys.reports });
};

export function useCreatePlanMutation(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiRequest("/api/plans", {
        method: "POST",
        token,
        body: payload,
      }),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useUpdatePlanMutation(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiRequest(`/api/plans/${id}`, {
        method: "PUT",
        token,
        body: payload,
      }),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useDeletePlanMutation(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiRequest(`/api/plans/${id}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useAddSavingMutation(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }) =>
      apiRequest(`/api/plans/${id}/add-saving`, {
        method: "POST",
        token,
        body: { amount },
      }),
    onSuccess: () => invalidateRelated(queryClient),
  });
}
