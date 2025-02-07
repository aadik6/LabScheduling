import React from 'react'
import { NavLink } from 'react-router-dom'

function ForgetPassword() {
    return (
        <>
            <div className="container mx-auto max-w-[500px] p-4">
                <div className="forget-container">
                    <div className="forget-form bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
                        <form id="forget-form">
                            <div className="mb-3">
                                <label htmlFor="forget-email" className="form-label block mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control w-full border rounded px-3 py-2"
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
                                    // onClick={() => handleFormSwitch("login")}
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