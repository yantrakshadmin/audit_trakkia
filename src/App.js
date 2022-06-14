import React, {useState,useEffect} from 'react';
import './App.css';
import MainScreen from './components/MainScreen';
import 'antd/dist/antd.css';
import Header from './components/Header';
import Login from './components/Login';
import { BrowserRouter } from "react-router-dom";
import {initAxios} from './helpers/login'
import { Footer } from 'antd/lib/layout/layout';


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
  
        <Footer style={{ textAlign: 'center', marginTop: '2rem', backgroundColor: 'white' }}>Yantraksh Logistics Pvt. Ltd. © All rights reserved  (CO-T)</Footer>
      
      </div>
    </BrowserRouter>
  );
}

export default App;
