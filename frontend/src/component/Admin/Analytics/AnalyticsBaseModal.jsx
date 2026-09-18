import { useEffect, useState } from "react"
import instance from "../../../api/axiosInstance"

export default function AnalyticsBaseModal(){
    const [,SetDeliveryBoys]=useState([])
    const fetchDeliveryBoys=async()=>{
        const response=await instance.get("/users/deliveryBoys/")
        const data=response.data
        console.log(data)
        SetDeliveryBoys(data)
    }

    useEffect(()=>{
        fetchDeliveryBoys()
    },[])


}
