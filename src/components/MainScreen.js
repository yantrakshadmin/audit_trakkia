import React, { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { List, Divider, Button, Row, Col, Empty, Card, Form, Select, Input, notification, message } from 'antd';
import VirtualList from 'rc-virtual-list';
import axios from 'axios';

const { Option } = Select;


const statusValues = {
    start: 'start',
    stop: 'stop'
}

const MainScreen = ({ userData }) => {
    const [serials, setSerials] = useState([]);
    const [$forceRerenderKey, setForceRerenderKey] = useState(Math.random())
    const [currentSerialText, setCurrentSerialText] = useState('')
    const [selectedSerialKey, setSelectedSerialKey] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [status, setStatus] = useState(null)
    const [clearText, setClearText] = useState(0);
    const [decodeValues, setDecodeValues] = useState({})

    const selectedSerialKeyRef = React.useRef(null);
    const currentSerialTextRef = React.useRef(null);
    selectedSerialKeyRef.current = selectedSerialKey;
    currentSerialTextRef.current = currentSerialText;


    const [form] = Form.useForm();

    console.log(decodeValues, "decodeeeeeeeee");
    // console.log(currentSerialText, "------------");





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
        form.setFieldsValue({ rfId: '', warehouse: null })
    }

     const removeDuplicateItems = (arr, key) => {
        const newArr = new Map(arr.map((item) => [item[key], item])).values();
        return [...newArr];
    };

    const handleWarehouseChange = (e) => {
        const index = (warehouses || []).findIndex((item) => item.id === e);
        setSelectedWarehouse(warehouses[index]);
        setSerials([]);
        setStatus(statusValues.start);
    };

    const handleRFIDChange = (e) => { setCurrentSerialText(e.target.value); };

    useEffect(() => {
        handelWarehouse();
        if (clearText > 0) {
            form.setFieldsValue({ rfId: '' })
            setCurrentSerialText('')
        }

        if (currentSerialTextRef.current ==  serials) {
            console.log("serial exist");
        }
        else {
            console.log("serial not exist");
        }

    }, [clearText])

    React.useEffect(() => {
        console.log(selectedWarehouse, '00000')
    }, [selectedWarehouse])

    const findSerial = serials.some(val => val.serial !== currentSerialText)
    // console.log(findSerial, "finddddddddddd");


    const onAddSerial = (e) => {
        if (selectedSerialKeyRef.current !== null && findSerial) {
            setClearText(prev => prev + 1);
            setSerials(serials.map(item => {
                if (item.$key === selectedSerialKeyRef.current && findSerial) {
                    return {
                        ...item,
                        serial: currentSerialTextRef.current,
                    }
                } else {
                    return item
                }
            }))
            setSelectedSerialKey(null);
        } else {
            setClearText(prev => prev + 1);
            setSerials((prev) => (removeDuplicateItems([...prev, { serial: currentSerialTextRef.current, $key: Math.random() }], 'serial')))
        }
        forceRerender()
        // setCurrentSerialText('');
    }
   

    const deleteItem = (key) => {
        setSerials((prev) => (prev.filter(item => item.$key !== key)));
        if (key === selectedSerialKey) {
            setSelectedSerialKey(null);
        }
    }

    const onSubmit = async () => {
        axios.post(`/create-rfidinv/`,
            {
                warehouse: selectedWarehouse?.id,
                serials,
            })
            .then((e) => {
                reset();
                message.success("Scan success")
            })
            .catch((e) => {
                // console.log(e);
                message.warn("something went wrong")
            })
        // setCurrentSerialText('')
        //    openNotification('top')


    }


    const handelWarehouse = async () => {
        axios.get(`/company-warehouse/?id=${userData.company_id}`,
        )
            .then((e) => setWarehouses(e.data))
            .catch((e) => { })

    }

    const handleKeyPress = (e) => {
        console.log(e.code, 'this/.....')
        if (e.code === 'Enter' && currentSerialTextRef.current) {
            onAddSerial()
            // setCurrentSerialText('')
        }
    };

    React.useEffect(() => {
        axios.get(`grnserial-conversion/?company=${52}`).then((e) => setDecodeValues(e.data))
        document.addEventListener('keyup', handleKeyPress);
        return () => document.removeEventListener('keyup', handleKeyPress);
    }, []);

    return (
        <div className='site-card-border-less-wrapper'>
            <br />
            <Row justify='center'>
                <Col  {...{ md: 12, sm: 24, lg: 12, xl: 12 }}>
                    <Card title="Audit" bordered={false}>
                        <Form layout='vertical' form={form}>
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
                                    disabled={!selectedWarehouse || status !== statusValues.start}
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
                                {selectedSerialKey ? 'Edit' : 'Add'}
                            </Button>
                        </Form>
                        <div>
                            {
                                (serials.length) ?
                                    <div key={String($forceRerenderKey)}>
                                        <Divider orientation="left">Serials
                                        (Count: {serials?.length})</Divider>
                                        {

                                            <div className='scroll-view'>
                                                <List
                                                    size="small"
                                                    itemLayout="horizontal"
                                                    dataSource={serials}

                                                    renderItem={(item) => (
                                                        <List.Item
                                                            actions={[
                                                                <EditOutlined
                                                                    disabled={status !== status.start}
                                                                    onClick={() => {
                                                                        setSelectedSerialKey(item.$key);
                                                                        setCurrentSerialText(item.serial)
                                                                    }}

                                                                />,
                                                                <DeleteOutlined
                                                                    disabled={status !== status.start}
                                                                    onClick={() => { deleteItem(item.$key) }}
                                                                />
                                                            ]}
                                                            className={selectedSerialKey === item.$key ? 'active' : ''}>
                                                            <List.Item.Meta
                                                                title={<p className='serials-title'> { decodeValues[item.serial]|| item.serial}</p>}
                                                            />

                                                        </List.Item>
                                                    )} />
                                            </div>

                                        }
                                    </div> :
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
                        <br />
                        <div className=''>
                            {status !== statusValues.start &&
                                <Button
                                    className='mr-2'
                                    type='primary'
                                    onClick={() => {
                                        setStatus(statusValues.start)
                                    }}
                                >Start</Button>}
                            {
                                status === statusValues.start && <Button
                                    className='mr-2'
                                    type='danger'
                                    onClick={() => {
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


