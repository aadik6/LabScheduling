import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useForm } from "react-hook-form";

function Login() {
  const [pwVisible, setPwVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = (data) => {
    console.log(data)
  }
  return (
    <>
      <div className="container mx-auto max-w-[500px] p-4">
        <div className="login-container">
          <div className="login-form bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form id="login-form" onSubmit={handleSubmit(submit)}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label block mb-1">
                  email
                </label>
                <input
                  type="text"
                  className="form-control w-full border rounded px-3 py-2"
                  {...register("email")}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label block mb-1">
                  Password
                </label>
                <input
                  type={pwVisible ? "text" : "password"}
                  className="form-control w-full border rounded px-3 py-2"
                  {...register("password")}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="mb-3 flex items-center">
                <input
                  type="checkbox"
                  className="form-check-input mr-2"
                  id="remember-me"
                  onClick={() => { setPwVisible(!pwVisible) }}
                />
                <label className="form-check-label" htmlFor="remember-me">
                  Show password
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full bg-blue-500 text-white py-2 rounded"
              >
                Login
              </button>
              <div className="mt-3 text-center">
                <NavLink
                  to='/forgetpassword'
                  className="text-blue-500 hover:underline"
                >
                  Forgot password?
                </NavLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login











//         <div className="signup-container">
//           <div className="alert alert-danger mb-4 hidden" id="signup-error-message">
//             All fields are required!
//           </div>
//           <div className="signup-form bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-xl font-bold mb-4">Register</h2>
//             <form id="signup-form">
//               <div className="mb-3">
//                 <label htmlFor="signup-username" className="form-label block mb-1">
//                   Username
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control w-full border rounded px-3 py-2"
//                   id="signup-username"
//                   placeholder="Enter your username"
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="signup-email" className="form-label block mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   className="form-control w-full border rounded px-3 py-2"
//                   id="signup-email"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="signup-password" className="form-label block mb-1">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control w-full border rounded px-3 py-2"
//                   id="signup-password"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="btn btn-primary w-full bg-blue-500 text-white py-2 rounded"
//               >
//                 Register
//               </button>
//               <div className="mt-3 text-center">
//                 <a
//                   href="#"
//                   className="text-blue-500 hover:underline"
//                   onClick={() => handleFormSwitch("login")}
//                 >
//                   Back to Login
//                 </a>
//               </div>
//             </form>
//           </div>   