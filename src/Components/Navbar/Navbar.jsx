import React from 'react'
import './Navbar.css'
import navlogo from '../Assets/ltogod.JPG'
import navprofileIcon from '../Assets/nav-profile.svg'

const Navbar = ({ onMobileMenuToggle }) => {
  return (
    <div className='navbar'>
      <div className='nav-left'>
        {/* Mobile hamburger */}
        <button 
          className='nav-hamburger' 
          aria-label='Open menu' 
          onClick={onMobileMenuToggle}
        >
          <span className='bar' />
          <span className='bar' />
          <span className='bar' />
        </button>
        <img src={navlogo} className='nav-logo' alt="Damio Kids" />
      </div>
      <img src={navprofileIcon} className='nav-profile' alt="Profile" />
    </div>
  )
}

export default Navbar
