import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DEFAULT_BASE_URL } from '../enviornment';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../storage';

function Login({ usernames, passwords, getUserDetails, setPassword, setUsername}) {
    // const [usernames, setUsername] = useState('');
    // const [passwords, setPassword] = useState('');


    useEffect(() => {
        getUserDetails();
    }, [])
    

    const onChangeName = (e) => {
        setUsername(e.target.value)
    }
    const onChangePassword = (e) => {
        setPassword(e.target.value)
        
    }
    

    // const handelLogin = async () => {
    //     const {data:res} = await axios.get('https://tmultibackend.trakkia.com/create-rfidinv/').then((e) => console.log(e, "dattt"))
    //     console.log(res, "ressssss");
        
    // }
    console.log(usernames, "username");
    console.log(passwords, "pass");

  return (
      <div className='login-form' >
          <div className='login-box'>
          <Form
              name="normal_login"
              className="login-form"
              initialValues={{ remember: true }}
            //   onFinish={onFinish}
              >
                  <h1>Login</h1>
              <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your Username!' }]}
              >
                  <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" onChange={onChangeName} />
              </Form.Item>
              <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                  <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                          placeholder="Password"
                          onChange={onChangePassword}
                  />
              </Form.Item>
          

              <Form.Item>
                      <Button type="primary"
                          htmlType="submit"
                          className="login-form-button"
                          onClick={getUserDetails}
                      >
                          
                          {/* <Link to="/main"> */}
                              Log in
                          {/* </Link> */}

                      </Button>

                
              </Form.Item>
              </Form>
          </div>
    </div>
  )
}

export default Login