import React from 'react'
import { AlertTriangle } from "lucide-react";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function RistrictionMessage() {
                 const { t: autoT } = useAutoTranslation();
  return (
    <div className="bg-yellow-400 flex gap-2 font-semibold items-center py-5 mb-4  px-4 rounded-2xl">
        <AlertTriangle size={18} color='black'/>
        <p>{autoT("legacy.you_are_in_demo_mode_some_actions_are_ristricted_71db3d79")}</p>
    </div>
  )
}
