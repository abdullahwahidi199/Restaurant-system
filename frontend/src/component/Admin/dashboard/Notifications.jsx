import { useContext, useEffect, useState } from "react";
import { Bell, Rewind } from "lucide-react";
import { AuthContext } from "../../../api/authforRBC";
import instance from "../../../api/axiosInstance";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const {auth}=useContext(AuthContext)
  const token=auth?.tokens?.access
  const fetchNotifications=async ()=>{
    const response=await instance.get("/reports/notifications/")
    const data=response.data
    setNotifications(data)
  }
  useEffect(() => {
    fetchNotifications();
  }, []);

  const markReadNotification= async (id)=>{
    const response=await instance.post(`/reports/notifications/${id}/read/`)
    fetchNotifications()
  
  }
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
        <Bell className="w-5 h-5 text-blue-500" /> Notifications
      </h3>
      <ul className="space-y-2">
        {notifications.length>0?(
          notifications.map((note) => (
          <li key={note.id} className="text-gray-600 border-b flex justify-between pb-2">
            <div>
              <span className="font-medium text-gray-800">{note.type}</span>: {note.message}
              <div className="text-sm text-gray-400">
                {new Date(note.created_at).toLocaleString()}
              </div>
            </div>
            <button className="text-blue-400 cursor-pointer font-semibold" onClick={()=>markReadNotification(note.id)}>Mark read</button>
          </li>
        ))
        ):(
          <p>No notifications yet!</p>
        )}
        
      </ul>
    </>

  );
}
