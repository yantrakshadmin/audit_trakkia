import React, {useState,useEffect} from 'react';
import './App.css';
import MainScreen from './components/MainScreen';
import 'antd/dist/antd.css';
import Header from './components/Header';
import Login from './components/Login';
import { Routes, Route, Link } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';


// import SignIn from './components/sign-in.component';

function App() {
  const [usernames, setUsername] = useState('');
  const [passwords, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [access, setAccess] = useState('');
  const [refresh, setRefresh] = useState('')
  const [userData, setUserData] = useState('')

  console.log(token, "acessssssssss");


  const userDetails = {
    password: passwords,
    username: usernames,

  }
  const userCredentials = {
    access: token.access,
    // refresh: token.refresh
  }
  
  useEffect(() => {
    getUserNames();
  }, [access])

  const getUserNames = async () => {
    const data = await axios.get(`https://tmultibackend.trakkia.com/user/meta/`, {
      headers: {
        'Authorization': `Bearer ${access}`
      }
    }).then((e) => setUserData(e.data))
    

  }
  console.log(userData?.username, "user data");

 
  

  const getUserDetails = async () => {
    const { data: tokens } = await axios.post(`https://tmultibackend.trakkia.com/api/token/`, userDetails)
    const { access, refresh } = tokens;
    setAccess(access);
    setRefresh(refresh);
    setToken(tokens)
   
  }


  return (
    <BrowserRouter>
      <div>
        <Header userData={userData}  />
        {token ? <MainScreen userData={userData} token={token} access={access} refresh={refresh} userCredentials={userCredentials} userDetails={userDetails} />
          : <Login usernames={usernames}
          passwords={passwords}
          setPassword={setPassword}
          setUsername={setUsername}
          getUserDetails={getUserDetails} /> }
        
       
        
      {/* <MainScreen/> */}
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        {/* <Route path="/main" element={<MainScreen />} /> */}
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
