import React, {useState,useEffect} from 'react';
import './App.css';
import MainScreen from './components/MainScreen';
import 'antd/dist/antd.css';
import Header from './components/Header';
import Login from './components/Login';
import { Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import {initAxios} from './helpers/login'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({})

  const init = async () => {
    const auth = await initAxios();
    const {access, user} = auth;
    setUser(user);
    setIsAuthenticated(!!access)
  }

  useEffect(()=>{ 
    init();
  },[])

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <div>
        <Header userData={user}  />
        {isAuthenticated ?
         <MainScreen 
          userData={user} 
         />
          : <Login 
              onLogin={(u)=>{
                setUser(u)
                setIsAuthenticated(true);
              }}
           /> }
      <Routes>
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
