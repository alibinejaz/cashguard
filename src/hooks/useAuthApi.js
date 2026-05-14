import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { queryKeys } from "./queryKeys";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (form) =>
      apiRequest("/api/auth/login", {
        method: "POST",
        body: form,
      }),
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (form) =>
      apiRequest("/api/auth/signup", {
        method: "POST",
        body: form,
      }),
  });
}

export function useMeQuery(token) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () =>
      apiRequest("/api/auth/me", {
        token,
      }),
    enabled: Boolean(token),
  });
}
