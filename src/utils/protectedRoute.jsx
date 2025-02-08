import React from 'react'
import { getSession } from '../store/authStore'
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
    const { accessToken } = getSession();

    return accessToken ? (
        <Outlet />
    ) : (
        <Navigate to='/login' />
    )

}

export default ProtectedRoute