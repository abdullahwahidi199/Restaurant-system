// this is a custom hook for fetching and caching category items

import { useQuery } from "@tanstack/react-query";
import instance from "../../../api/axiosInstance";

export default function useCategoryItems(categoryId) {
  return useQuery({
    queryKey: ["categoryItems", categoryId],
    queryFn: async () => {
      const res = await instance.get(`/menu/categories/${categoryId}/`);
      return res.data; // ✅ return full object
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 8,
  });
}
