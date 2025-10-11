// this is a custom hook for fetching and caching category items

import { useQuery } from "@tanstack/react-query";

export default function useCategoryItems(categoryId){
    return useQuery({
        queryKey:['categoryItems',categoryId],
        queryFn:async ()=>{
            const res=await fetch(`http://127.0.0.1:8000/menu/categories/${categoryId}/`)
            if (!res.ok) throw new Error("Failed to fetch category items!")
            const data=await res.json()
            return data.menu_items
        },
        enabled:!!categoryId, // fetch only when ID is selected
        staleTime:1000*60*5, // cache stays fresh for 5 minutes
        cacheTime:1000*60*8     // data remains in memory for 8 minutes
    })  

    
}