import React from 'react'
import { NavLink } from 'react-router-dom'

function ForgetPassword() {
    return (
        <>
            <div className="container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 ">
                <div className="forget-container bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-8">
                    <div className="forget-form">
                        <h2 className="text-3xl text-center font-bold text-gray-900">Forgot Password</h2>
                        <form id="forget-form">
                            <div className="mb-3">
                                <label htmlFor="forget-email" className="form-label block mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    id="forget-email"
                                    placeholder="Enter your registered email"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-full bg-blue-500 text-white py-2 rounded"
                            >
                                Reset Password
                            </button>
                            <div className="mt-3 text-center">
                                <NavLink
                                    to = "/login"
                                    className="text-blue-500 hover:underline"
                                >
                                    Back to Login
                                </NavLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ForgetPassword