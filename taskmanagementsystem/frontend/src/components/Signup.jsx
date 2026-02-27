

import React from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
  return (
    <div>
      <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[680px]">
        
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Create Account
        </h2>

        <form className="flex flex-col">

          <input
            type="text"
            required
            placeholder="Full Name"
            className="text-gray-800 outline-none border border-gray-300 rounded-xl py-3 px-4 
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
            transition duration-200"
          />

          <input
            type="email"
            required
            placeholder="Email Address"
            className=" text-gray-800 outline-none border border-gray-300 rounded-xl py-3 px-4 mt-4 
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
            transition duration-200"
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="text-gray-800 outline-none border border-gray-300 rounded-xl py-3 px-4 mt-4 
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
            transition duration-200"
          />

          <input
            type="password"
            required
            placeholder="Confirm Password"
            className="text-gray-800 outline-none border border-gray-300 rounded-xl py-3 px-4 mt-4 
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
            transition duration-200"
          />

          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white 
            rounded-xl py-3 mt-6 transition duration-300 w-[300px] self-center "
          >
            Sign Up
          </button>

        </form>

   <p className="text-base text-center mt-6 text-gray-600">
  Already have an account?
  <Link 
    to="/" 
    className="text-lg text-emerald-500 ml-1 hover:underline font-semibold"
  >
    Login
  </Link>
</p>

      </div>
    </div>
    
    </div>
  )
}

export default Signup



//    <p className="text-sm text-center mt-6 text-gray-600">
//   Already have an account?
//   <Link to="/" className="text-emerald-500 ml-1 hover:underline">
//     Login
//   </Link>
// </p>