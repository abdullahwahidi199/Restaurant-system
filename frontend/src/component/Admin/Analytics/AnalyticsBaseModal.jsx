import { useEffect, useState } from "react"

export default function AnalyticsBaseModal(){
    const [deliveryBoys,SetDeliveryBoys]=useState([])
    const fetchDeliveryBoys=async()=>{
        const response=await fetch(`http://127.0.0.1:8000/users/deliveryBoys/`)
        const data=await response.json()
        console.log(data)
        SetDeliveryBoys(data)
    }

    useEffect(()=>{
        fetchDeliveryBoys()
    },[])


}