import axios from 'axios';
import * as React from 'react'
import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {reactLocalStorage} from 'reactjs-localstorage';

import {getUser} from '../helpers/login'

const Login = ({ onLogin: onLoginProp }) => {
   
    const onLogin = async (data) => {
        console.log(data);
        // try{
            const {username, password} = data;
            const { data: token } = await axios.post(`/api/token/`,{password,username})
            const { access, refresh } = token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
            const {data:user} = await getUser(access);        
            reactLocalStorage.set('access', access);
            reactLocalStorage.set('refresh', refresh);
            reactLocalStorage.set('user', JSON.stringify(user || {}));
            onLoginProp(user)
        // }catch(e){

        // }
        
      }

  return (
      <div className='login-form' >
          <div className='login-box'>
          <Form
              name="normal_login"
              className="login-form"
              onFinish={(data)=>{onLogin(data)}}
              onFinishFailed={()=>{
                  notification.error({
                    message: 'Error in Login',
                    description:
                  'Something went wrong.',
                })}}
              initialValues={{ remember: true }}
              >
                  <h1>Login</h1>
              <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your Username!' }]}
              >
                  <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username"/>
              </Form.Item>
              <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                  <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                          placeholder="Password"
                  />
              </Form.Item>
          

              <Form.Item>
                <Button 
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                >                      
                        Log in
                </Button>
              </Form.Item>
              </Form>
          </div>
    </div>
  )
}

export default Login