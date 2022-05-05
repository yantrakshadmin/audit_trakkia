import { Button } from 'antd';
import React from 'react'
import Logo from "./Logo.png"

function Header({ userData }) {
  return (
    <div className='header'>
      <img src={Logo} alt='logo' />
      <div className='header-right'>
        <h4 className='username'>{userData?.username}</h4>
        <Button onClick={() => window.location.reload(false)}>Log out</Button>
      </div>

    </div>
  )
}

export default Header;