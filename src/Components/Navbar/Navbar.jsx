import React from 'react'
import './Navbar.css'
import navlogo from '../Assets/ltogod.JPG'
import navprofileIcon from '../Assets/nav-profile.svg'
import { useTranslation } from 'react-i18next'

const Navbar = ({ onMobileMenuToggle }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Persist language preference
    try { localStorage.setItem('lang', lng); } catch {}
  };

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved) i18n.changeLanguage(saved);
    } catch {}
  }, [i18n]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <select
          aria-label='Change language'
          onChange={(e) => changeLanguage(e.target.value)}
          defaultValue={i18n.language}
          className='lang-switcher'
          style={{ borderRadius: 6, padding: '6px 8px', border: '1px solid #e5e7eb' }}
        >
          <option value='en'>EN</option>
          <option value='fr'>FR</option>
          <option value='ar'>AR</option>
        </select>
        <img src={navprofileIcon} className='nav-profile' alt="Profile" />
      </div>
    </div>
  )
}

export default Navbar
