import { useQuery } from "@tanstack/react-query";
import { loadAndroidRelease } from "../../config/appDownload";

export function useAndroidRelease() {
  return useQuery({
    queryKey: ["public-android-release"],
    queryFn: ({ signal }) => loadAndroidRelease({ signal }),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
