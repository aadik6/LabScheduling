import React from 'react'
import './component.css'

function Footer() {
  return (
    <div className="parent-footer">
      <div className="footer flex flex-col">

        <hr />
        <span className='text-center mb-1'>© {new Date().getFullYear()}  All rights reserved | Developed by BCA Students under the guidance of Anish Sir</span>
      </div>
    </div>
  )
}

export default Footer