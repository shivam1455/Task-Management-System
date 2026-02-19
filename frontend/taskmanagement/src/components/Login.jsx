import React from 'react'

const Login = () => {
  return (
    <div className=' flex items-center justify-center'>
      <div className=' p-24 border-2 rounded-2xl border-emerald-600'>
        <h2 className='text-neutral-900 px-10 py-10  shadow-olive-950'>Login Page</h2>
        <form className='flex flex-col items-center justify-center '>
            <input required className='outline-none  border-2 rounded-xl border-r-emerald-600 py-3 px-5' type="email" placeholder='Enter mail id' />
            <input required className='outline-none  border-2 rounded-xl border-r-emerald-600 py-3 px-5 mt-5' type="password" placeholder='enter password ' />
            <button className='cursor-pointer outline-none border-2 border-r-emerald-600 py-3 px-5 mt-5'>Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login
