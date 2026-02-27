import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submithandler=(e)=>{
    e.preventDefault()
    console.log("dd", email)
    console.log("paa,", password)

    setEmail("")
    setEmail("")
  }
  return (
    <div className="h-screen w-full bg-gray-100 flex items-center justify-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-lg w-[500px] h-[450px]">

        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Login
        </h2>

        <br />


        <form onSubmit={(e)=>{
          submithandler(e)
        }} className="flex flex-col">

          <input
          value={email}
          onChange={(e)=>{
            setEmail(e.target.value)

            
          }}
            required
            className="text-gray-800 outline-none border border-gray-300 rounded-xl py-3 px-4 
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
            transition duration-200"
            type="email"
            placeholder="Enter Email"
          />
          <br />
        

          <input
          value={password}
          onChange={(e)=>{
            setPassword(e.target.value)
          }}
            required
            className="text-gray-800 outline-none border border-gray-300 rounded-xl py-3 px-4 mt-4 
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
            transition duration-200"
            type="password"
            placeholder="Enter Password"
          />

          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white 
            rounded-xl py-3 mt-6 transition duration-300 w-[300px] self-center"
          >
            Login
          </button>
 <p className="text-base text-center mt-6 text-gray-600">
  Don't have an account?
  <Link 
    to="/signup" 
    className="text-lg text-emerald-500 ml-1 hover:underline font-semibold"
  >
    Sign Up
  </Link>
</p>

        </form>

      </div>

    </div>
  )
}

export default Login