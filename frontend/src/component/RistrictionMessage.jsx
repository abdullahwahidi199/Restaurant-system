import React from 'react'
import { AlertTriangle } from "lucide-react";

export default function RistrictionMessage() {
  return (
    <div className="bg-yellow-400 flex gap-2 font-semibold items-center py-5 mb-4  px-4 rounded-2xl">
        <AlertTriangle size={18} color='black'/>
        <p>You are in demo mode, some actions are ristricted!</p>
    </div>
  )
}
