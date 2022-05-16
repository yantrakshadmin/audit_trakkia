import React, { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { List, Divider, Button, Row, Col, Empty, Card, Form, Select, Input, notification, message, Table, Space, } from 'antd';
import axios from 'axios';
import { getUser } from '../helpers/login';


const { Option } = Select;
const { user_Id } = getUser;




const statusValues = {
    start: 'start',
    stop: 'stop'
}

const MainScreen = ({ userData }) => {
    const [serials, setSerials] = useState([]);
    const [$forceRerenderKey, setForceRerenderKey] = useState(Math.random())
    // const [currentSerialText, setCurrentSerialText] = useState('')
    // const [selectedSerialKey, setSelectedSerialKey] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [status, setStatus] = useState(null)
    // const [clearText, setClearText] = useState(0);
    const [decodeValues, setDecodeValues] = useState({})
    const [assetType, setAssetType] = useState({})
    const [addedSerials, setAddedSerials] = useState({})

    // const selectedSerialKeyRef = React.useRef(null);
    // const currentSerialTextRef = React.useRef(null);
    // selectedSerialKeyRef.current = selectedSerialKey;
    // currentSerialTextRef.current = currentSerialText;


    const [form] = Form.useForm();  

    let Pallet = Object.values(decodeValues).filter((e) => e[1] == "Plastic Pallet").length;
    let BlueRack = Object.values(decodeValues).filter((e) => e[1] == "Blue Racks").length;
    let HPT = Object.values(decodeValues).filter((e) => e[1] == "HPT").length;
    let Trolley = Object.values(decodeValues).filter((e) => e[1] == "Trolley").length;

    console.log(Pallet, BlueRack, HPT, Trolley, "pallllllttttt");

    console.log(decodeValues, "decodeeeeeeeee");
    console.log(assetType, "asettttttttttttttttt");

    const columns = [
        {
            title: 'Asset Type',
            dataIndex: assetType[1],
        },
        {
            title: 'Count',
            dataIndex: 'count',
        },
    ];



    console.log(user_Id, "uwrrrrrrrrrrrr");


    const forceRerender = () => {
        setForceRerenderKey(Math.random());
    }

    const reset = () => {
        setSerials([]);
        setAssetType({});
        // setCurrentSerialText('');
        setSelectedWarehouse(null);
        setStatus(statusValues.stop);
        // setSelectedSerialKey(null);
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

    // const handleRFIDChange = (e) => { setCurrentSerialText(e.target.value); };

    // useEffect(() => {
    //     handelWarehouse();
    //     if (clearText > 0) {
    //         form.setFieldsValue({ rfId: '' })
    //         setCurrentSerialText('')
    //     }


    // }, [clearText])

    React.useEffect(() => {
        handelWarehouse();
        console.log(selectedWarehouse, '00000')
    }, [selectedWarehouse])



    const onAddSerial = (value) => {
        const currentDecodeArr = decodeValues[value];
        // setClearText(prev => prev + 1);
        // setSerials(serials.map(item => {
    
        setAddedSerials(prev => ({ ...prev, [value]: true }));
         
        setSerials((prev) => (removeDuplicateItems([...prev, { serial: value, $key: Math.random() }], 'serial')))
        form.setFieldsValue({ rfId: '' })

        console.log(addedSerials)
        if (currentDecodeArr && !addedSerials[value]) {
            setAssetType((prev) => ({
                ...prev, [currentDecodeArr[1]]: prev[currentDecodeArr[1]] ?
                    (prev[currentDecodeArr[1]] + 1) : 1
            }))
            
            // }
            forceRerender();
            // setCurrentSerialText('');
        }
    }


    const deleteItem = (key, serial) => {
        const selectedDecodeValue = decodeValues[serial];
        console.log(selectedDecodeValue, '=====')
        if (selectedDecodeValue && assetType[selectedDecodeValue[1]]) {
            setAssetType((prev) => ({
                ...prev,
                ...(prev[selectedDecodeValue[1]] && { [selectedDecodeValue[1]]: prev[selectedDecodeValue[1]] - 1 })
            }
            ))
        }
        setSerials((prev) => (prev.filter(item => item.$key !== key)));
        // if (key === selectedSerialKey) {
        //     setSelectedSerialKey(null);
        // }
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
        if (e.code === 'Enter') {
            form.submit()
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
                        <Form layout='vertical' form={form} onFinish={(data) => {
                            console.log(data, "formmm dataaaaaaa ++++++++++++"); 

                            if (data.rfId) {
                                onAddSerial(data.rfId)
                            }
                        }}>
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
                            <Form.Item name="rfId"  label="">
                                <Input
                                    // key={`input-${selectedSerialKey}`}
                                    disabled={!selectedWarehouse || status !== statusValues.start}
                                    placeholder="Enter RFID"
                                    maxLength={24}
                                    // value={currentSerialText}
                                    // onChange={handleRFIDChange}
                                />
                            </Form.Item>
                            <Form.Item >
                                <Button
                                    disabled={status !== statusValues.start}
                                    block
                                    // onClick={onAddSerial}
                                    htmlType='submit'
                                    type='primary'>
                                    {/* {selectedSerialKey ? 'Edit' : 'Add'} */}
                                    Add
                                </Button>
                            </Form.Item>    
                           
                        </Form>
                        {/* <h3 style={{ marginTop: '25px' }} >Asset Type and Count</h3> */}
                        {/* <Table columns={columns} dataSource={currentDecodeArr} size="small"
                            key={String($forceRerenderKey) + 'counttable'}/> */}
                        <br />
                        {Object.keys(assetType).length > 0 && <Row className='bg-light px-2 py-1'>
                            <Col span={8}>
                                <b>Asset Type</b>
                            </Col>
                            <Col span={8}>
                                <b>Count</b>
                            </Col>
                            <Col span={8}>
                                <b>Scanned Percentage</b>
                            </Col>
                        </Row>}
                        <div className='border' key={String($forceRerenderKey) + 'countTable'}>
                            {Object.keys(assetType).map((key) => (<Row key={key} className='px-2'>
                                <Col span={8}>{key}</Col>
                                <Col span={8}>{assetType[key]}</Col>
                                
                                {key === "Plastic Pallet" ?
                                    <Col span={8}>{(assetType[key] / Pallet * 100).toFixed(1)}%</Col> : ''}
                                {key === "Trolley" ?
                                    <Col span={8}>{(assetType[key] / Trolley * 100).toFixed(1)}%</Col> : ''}
                                {key === "Blue Racks" ?
                                    <Col span={8}>{(assetType[key] / BlueRack * 100).toFixed(1)}%</Col> : ''}
                                {key === "HPT" ?
                                    <Col span={8}>{(assetType[key] / HPT * 100).toFixed(1)}%</Col> : ''}

                            </Row>))
                            }   
                        </div>
                        <div>
                            {
                                (serials.length) ?
                                    <div key={String($forceRerenderKey)}>
                                        <Divider orientation="left">Total Serial Count
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
                                                                // <EditOutlined
                                                                //     disabled={status !== status.start}
                                                                //     onClick={() => {
                                                                //         // setSelectedSerialKey(item.$key);
                                                                //         // setCurrentSerialText(item.serial)
                                                                //     }}

                                                                // />,
                                                                <DeleteOutlined
                                                                    disabled={status !== status.start}
                                                                    onClick={() => { deleteItem(item.$key, item.serial) }}
                                                                />
                                                            ]}
                                                            // className={selectedSerialKey === item.$key ? 'active' : ''}
                                                        >
                                                            <List.Item.Meta
                                                                title={<p className='serials-title'> {
                                                                    decodeValues[item.serial] && (decodeValues[item.serial][0]) || item.serial}</p>}
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