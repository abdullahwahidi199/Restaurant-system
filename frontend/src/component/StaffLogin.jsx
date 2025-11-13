import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../api/authforRBC';
import {motion} from 'framer-motion'
import toast,{Toaster} from "react-hot-toast";
export default function StaffLogin(){
    const {login}=useContext(AuthContext)
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error,setError]=useState(null)
    const [loading,setLoading]=useState(false)

    const nav=useNavigate()

    const handleSubmit=async (e)=>{
      setLoading(true)
        e.preventDefault();
        try{
            const data=await login(username,password)
            const role=data.role;
            if (role==="Admin") nav('/admin/dashboard');
            else if (role==="Cashier") nav('/cashier')
            else if (role === 'Waiter') nav('/waiter');
            else if (role === 'Kitchen_manager') nav('/kitchen');
            else nav('/');
        }
        catch(err){
          setError(err.message)
            console.error(err);
      alert('Login failed');
        }
        finally{
          setLoading(false)
        }
    }
return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[#111] to-[#0a0a0a] text-white px-6">
      <Toaster poistion="bottom-center"/>
      <motion.div 
        initial={{opacity:0, y:50}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.7, ease:"easeOut"}}
        className="bg-[#121212] border border-[#1f1f1f] shadow-xl rounded-3xl w-full max-w-md p-8"
      >
        <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-center mb-6"
                >
                  <span className="text-red-500">Login</span>
        </motion.h2>

        {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">

        <motion.input
          
          
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
          required
        />
        <motion.input
          whileFocus={{scale:1.02}}
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full p-3 bg-[#1a1a1a] border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400"
          required
        />
        
        <motion.button
          whileHover={{scale:1.05}}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className={`w-full py-3 rounded-full font-bold transition-all duration-300 ${loading
            ? "bg-gray-600 cursor-not-allowed"
            :"bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {loading ? "Logging in ...":"Login"}
        </motion.button>
        
      </form>

      </motion.div>
      
      
    </div>
  );
};

