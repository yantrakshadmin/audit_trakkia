import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Row, Col, Space, Form, Select, layout, Typography,Tag } from 'antd';
import { List, Divider } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Title, Paragraph, Text, Link } = Typography;

function MainScreen({ userCredentials, userDetails, access, refresh, token, userData }) {
    const [value, setValue] = useState([]);
    const [warehouses, setWarehouses] = useState('');



    const userDataa = {
        "owner": userData?.username,
        "serials": [{ "serial": "RFD1" },
            { "serial": "RFD2" },
            { "serial": "RFD3" },
            { "serial": "RFD4" }],
        "warehouse": 2
    }

    const handleChange = (e) => {
        setValue(e);
    };

    useEffect(() => {
        onSubmit();
        handelWarehouse(userData?.user_id);
        // getUserNames()
        console.log(userData?.user_id, "iddd");

    }, [])

   

    const onSubmit = async () => {
        const data = await axios.post(`https://tmultibackend.trakkia.com/create-rfidinv/`, userDataa)
            .then((e) => console.log(e, "dddddddddd"))
        console.log(data, "datttaaa");
    }

    const handelWarehouse = async (id) => {
        const data = await axios.get(`https://tmultibackend.trakkia.com/company-warehouse/?id=${1}`,
            {
            headers: {
                'Authorization': `Bearer ${access}`
                }
            }
        ).then((e) => setWarehouses(e.data) )
        // console.log(access, "accesss");

    }
    console.log(warehouses, "warrreeeeeeeee");
    return (

        <div className="container">
            <div className='main-section'>
                <div className='main-box'>
                    <div className='dropdown'>
                        <Form>
                            <Form.Item name="gender" label="Warehouse"
                            >
                                <Select
                                    placeholder="Select Warehouse"
                                    value={value}
                                    onChange={handleChange}
                                // allowClear
                                >
                                    {
                                        (warehouses || []).map((v) => (
                                            <Option value={ v.name}>{ v.name}</Option>


                                        ) )
                                    }

                                  

                                </Select>
                            </Form.Item>
                        </Form>
                    </div>
                    <List bordered>                        
                        <List.Item>
                            {/* {(value || []).map((e, i) => {
                              
                               
                            })} */}
                            <Tag closable >
                                {value}

                            </Tag>
                           
                                
                        </List.Item>
                        
                        
                           
                        
                  
                    
                       
                    </List>

                </div>

                <div className='btn-section'>
                    <Button type='primary'>Start</Button>
                    <Button type='danger'>Stop</Button>
                    <Button onClick={() => setValue("")} type='warning'>Reset</Button>
                    <Button onClick={onSubmit}>Submit</Button>


                </div>
            </div>

        </div>
    )
}

export default MainScreen;


