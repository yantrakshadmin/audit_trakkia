import { Button } from 'antd';
import React from 'react'
import {reactLocalStorage} from 'reactjs-localstorage';

import Logo from "./Logo.png"


function Header({ userData }) {
  const logout = () => {
    reactLocalStorage.clear();
    window.location.reload(false)
  }
  return (
    <div className='header bg-white'>
      <img src={Logo} alt='logo' />
      <div className='header-right'>
        <h4 className='username'>{userData?.username}</h4>
        <Button onClick={logout}>Log out</Button>
      </div>

    </div>
  )
}

export default Header;