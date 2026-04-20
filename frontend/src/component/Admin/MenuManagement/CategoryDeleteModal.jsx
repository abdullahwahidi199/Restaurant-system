import { useContext,useState } from "react";
import instance from "../../../api/axiosInstance";
import { AuthContext } from "../../../api/authforRBC";
import RestrictedToast from "../../RistrictedAction";
import { useTranslation } from "react-i18next";

export default function ({
    categoryId,
    onClose,
    onDelete,
    title,  
    message 
}) {
    
    const [showRestriction,setShowRestriction]=useState(false)
    const {auth}=useContext(AuthContext)
    const isDemo=auth?.user?.isDemo;
    const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa" || i18n.language === "ps";

    const handleDelete = async () => {
        if (isDemo){
            setShowRestriction(true)
            return
        }
        try {
            const response = await instance.delete(`/menu/categories/${categoryId}/`)
            
            onDelete();
            
        }
        catch (error) {
            console.log("Failed to delete category",error.response?.data||error.message)
        }

    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onclose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm animate-slide-down">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {title || t("confirm_delete")}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{message || t("delete_category_warning")}</p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        {t("cancel")}   
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                    >
                        {t("delete")}
                    </button>
                </div>
            </div>
            {showRestriction&&(
                    <RestrictedToast action="add" onClose={()=>setShowRestriction(false)}/>
                  )}
        </div>
    );
}