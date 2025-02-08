import React from 'react'
import { NavLink } from 'react-router-dom'
import './component.css'

function Header() {
    return (
        <>
            <div className="parent-header flex justify-between h-14 items-center bg-white shadow-md rounded hover:shadow-lg transition-shadow duration-300">
             <NavLink to ='/'><div className="logo mx-6 "></div></NavLink> 
                <div className="nav mx-6">
                    <ul className='flex gap-4'>
                        <li><NavLink to="/Schedules">Schedules</NavLink></li>
                        <li><NavLink to="/login">Login</NavLink></li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Header