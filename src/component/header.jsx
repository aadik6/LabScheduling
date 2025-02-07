import React from 'react'
import { NavLink } from 'react-router-dom'
import './component.css'

function Header() {
    return (
        <>
            <div className="parent-header flex justify-between h-10 items-center bg-white shadow-md rounded hover:shadow-lg transition-shadow duration-300">
                <div className="logo mx-4">logo</div>
                <div className="nav mx-4">
                    <ul className='flex gap-2'>
                        <li><NavLink to="/Schedules">Schedules</NavLink></li>
                        <li><NavLink to="/login">login</NavLink></li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Header