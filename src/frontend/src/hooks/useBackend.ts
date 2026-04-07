import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

/**
 * Initializes the backend on first load by calling initSampleData().
 * After initialization, invalidates all queries so data immediately loads.
 * Safe to call multiple times — uses a ref to prevent double-calls.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || initialized.current) return;
    initialized.current = true;
    actor
      .initSampleData()
      .then(() => {
        // Immediately refetch all region queries after sample data is ready
        queryClient.invalidateQueries();
      })
      .catch((err: unknown) => {
        console.warn(
          "initSampleData failed (may already be initialized):",
          err,
        );
        // Still invalidate — data may already exist from a prior run
        queryClient.invalidateQueries();
      });
  }, [actor, isFetching, queryClient]);

  return { actor, isFetching };
}
