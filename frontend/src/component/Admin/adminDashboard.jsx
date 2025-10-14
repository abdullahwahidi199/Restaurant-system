import { Outlet } from "react-router-dom";
import Navbar from "./navbar";


export default function AdminDashboard(){
    return(
        <div className="flex h-screen overflow-hidden">
          
            
            <Navbar/>
        
        <main className="flex-1  p-6 overflow-auto">
            <Outlet/>
        </main>
        </div> 
    )
}