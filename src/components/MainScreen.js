import React, { useState, useEffect } from 'react';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {List, Divider, Button, Row, Col, Empty,Card, Form, Select, Input } from 'antd';
import axios from 'axios';

const { Option } = Select;


const statusValues= {
    start:'start',
    stop: 'stop'
}

const MainScreen = ({  userData }) => {
    const [serials, setSerials] = useState([]);
    const [$forceRerenderKey, setForceRerenderKey]= useState(Math.random())
    const [currentSerialText, setCurrentSerialText] = useState('')
    const [selectedSerialKey, setSelectedSerialKey] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [status, setStatus] = useState(null)

    const selectedSerialKeyRef = React.useRef(null);
    const currentSerialTextRef = React.useRef(null);
    selectedSerialKeyRef.current = selectedSerialKey;
    currentSerialTextRef.current = currentSerialText;  
    

    const forceRerender = () => {
        setForceRerenderKey(Math.random());
    }

    const reset = () => {
        setSerials([]);
        setCurrentSerialText('');
        setSelectedWarehouse(null);
        setStatus(statusValues.stop);
        setSelectedSerialKey(null);
        setForceRerenderKey(Math.random());
    }

    const handleWarehouseChange = (e) => {
        const index = (warehouses||[]).findIndex((item) => item.id=== e);
        setSelectedWarehouse(warehouses[index]);
        setSerials([]);
        setStatus(statusValues.start);
    };

    const handleRFIDChange = (e) => {setCurrentSerialText(e.target.value);};

    useEffect(() => {
        handelWarehouse();
    }, [])

    React.useEffect(()=>{
        console.log(selectedWarehouse,'00000')
    },[selectedWarehouse])


    const onAddSerial = () => {
        if(selectedSerialKeyRef.current !== null){
            setSerials(serials.map(item => {
                if(item.$key === selectedSerialKeyRef.current){
                    return {
                        ...item, 
                        serial: currentSerialTextRef.current
                    }
                }else{
                    return item
                }
            }));
        setSelectedSerialKey(null);
        }else{
            setSerials(prev => ([...prev, {serial: currentSerialTextRef.current, $key: Math.random()}]))
        }
        forceRerender()
    }

    const deleteItem = (key) => {
        setSerials((prev)=>(prev.filter(item => item.$key !== key)));
        if(key === selectedSerialKey){
            setSelectedSerialKey(null);
        }
    }

    const onSubmit = async () => {
        axios.post(`/create-rfidinv/`,
        {
            warehouse: selectedWarehouse?.id,
            serials,
        })
        .then(() => {
            reset();
        })
        .catch((e)=>{
            console.log(e);
        })
    }

    const handelWarehouse = async () => {
        axios.get(`/company-warehouse/?id=${userData.user_id}`,
        )
        .then((e) => setWarehouses(e.data))
        .catch((e)=>{})
    }

    const handleKeyPress = (e) => {
        console.log(e.code,'this/.....')
        if (e.code === 'Enter' &&   currentSerialTextRef.current){ 
            onAddSerial()
        } 
      };
    
    React.useEffect(() => {
        document.addEventListener('keyup', handleKeyPress);
        return () => document.removeEventListener('keyup', handleKeyPress);
      }, []);

    return (
        <div className='site-card-border-less-wrapper'>
        <br/>
        <Row justify='center'>
            <Col  {...{md:12,sm:24,lg:12,xl:12}}>
            <Card title="Audit" bordered={false}>
                <Form layout='vertical'>
                    <Form.Item name="warehouse" label="Select Warehouse">
                        <Select
                            placeholder="Select Warehouse"
                            onChange={handleWarehouseChange}>
                            {
                                (warehouses || []).map((v) => (
                                <Option value={v.id}>
                                    {v.name}
                                </Option>))
                            }
                        </Select>
                    </Form.Item>
                        <Form.Item name="rfId" label="">
                        <Input
                            key={`input-${selectedSerialKey}`}
                            disabled={!selectedWarehouse || status!== statusValues.start}
                            placeholder="Enter RFID"
                            value={currentSerialText}
                            onChange={handleRFIDChange}
                        />        
                    </Form.Item>
                    <Button
                        disabled={status !== statusValues.start}
                        block
                        onClick={onAddSerial} 
                        type='primary'>
                        {selectedSerialKey ?'Edit':'Add'}
                    </Button>                    
                </Form>
                <div>
                    {
                        (serials.length) ? 
                        <div key={String($forceRerenderKey)}>
                                <Divider orientation="left">Serials</Divider>
                            {
                            <List
                                size="small"
                                itemLayout="horizontal"
                                dataSource={serials}
                                renderItem={(item) => (
                                  <List.Item 
                                  actions={[
                                    <EditOutlined
                                        disabled={status !== status.start}
                                        onClick={()=>{
                                         setSelectedSerialKey(item.$key);
                                         setCurrentSerialText(item.serial)
                                        }}
                                        
                                        />,
                                     <DeleteOutlined
                                        disabled={status !== status.start}
                                        onClick={()=>{deleteItem(item.$key)}}
                                    />
                                  ]}
                                  className={selectedSerialKey === item.$key?'active':''}>
                                    <List.Item.Meta
                                      title={item.serial}
                                    />
                                  </List.Item>
                                )}/>
                            }
                            </div>:
                            <Empty
                                imageStyle={{
                                    height: 300,
                                }}
                                description={
                                    <span>
                                        Please Select Warehouse and Start
                                    </span>
                                    }
                                >
                          </Empty>
                    }
                </div>
                <br/>
                <div className=''>
                   {status !== statusValues.start &&
                    <Button
                        className='mr-2'
                        type='primary'
                        onClick={()=>{
                            setStatus(statusValues.start)
                        }}
                     >Start</Button>}
                    {
                    status === statusValues.start && <Button
                    className='mr-2'
                     type='danger'
                     onClick={()=>{
                        setStatus(statusValues.stop)
                    }}>Stop</Button>
                    }
                    <Button 
                        className='mx-2'
                        disabled={status !== statusValues.start}
                        onClick={reset} 
                        type='warning'>
                            Reset
                    </Button>
                    <Button
                     className='ml-2'
                     disabled={status !== statusValues.start}
                     onClick={onSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </Card>
            </Col>
        </Row>
        </div>
    )
}

export default MainScreen;


