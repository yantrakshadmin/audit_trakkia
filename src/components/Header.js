import { Button } from 'antd';
import React, {useEffect, useState} from 'react'
import { reactLocalStorage } from 'reactjs-localstorage';
import {initAxios} from "../helpers/login"

import Logo from "./Logo.png"


function Header({ userData }) {
  const [isAccess, setisAccess] = useState('')
  const logout = () => {
    reactLocalStorage.clear();
    window.location.reload(false)
  }
  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    const auth = await initAxios();
    const { access, user } = auth;
    setisAccess(access);
  }

 
  return (
    <div className='header bg-white'>
      <img src={Logo} alt='logo' />
      <div className='header-right'>
        <h3 className='username'>{userData?.username}</h3>

        {isAccess ?  <Button onClick={logout}>Log out</Button> :  <p></p> }

      </div>

    </div>
  )
}

export default Header;