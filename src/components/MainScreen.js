import React, { useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { List, Divider, Button, Row, Col, Empty, Card, Form, Select, Input, message, } from 'antd';
import axios from 'axios';
import moment from "moment"
// import useGeoLocation from "hooks/useGeoLocation";
import useGeoLocation from "./useGeoLocation";


const { Option } = Select;


const statusValues = {
    start: 'start',
    stop: 'stop'
}


const getItemsLength = (decodeValues, type) => {
    let len = 0;
    let addedItems = {}
    Object.values(decodeValues).map((e) => {
        if (e[1] === type && !addedItems[e[0]]) {
            len = len + 1;
            addedItems = { ...addedItems, [e[0]]: true }
        }
    })
    return len
}

const MainScreen = ({ userData }) => {
    const [serials, setSerials] = useState([]);
    const [$forceRerenderKey, setForceRerenderKey] = useState(Math.random())
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [status, setStatus] = useState(null);
    const [addedItems, setAddedItems] = React.useState({})
    const [decodeValues, setDecodeValues] = useState({})
    const [assetType, setAssetType] = useState({})
    const [addedSerials, setAddedSerials] = useState({});
    const location = useGeoLocation();

    // const [start, setStart] = useState('')

    const [form] = Form.useForm();
    // let checkObj = Object.values(decodeValues).map(e => e[0]);
    // let uniqueChars = [...new Set(checkObj)];


    // let Pallet = Object.values(decodeValues).filter((e) => e[1] == "Plastic Pallet").length;
    let palletUnique = getItemsLength(decodeValues, 'Plastic Pallet');
    let blueRackUnique = getItemsLength(decodeValues, 'Blue Racks');
    let hPTUnique = getItemsLength(decodeValues, 'HPT');
    let trolleyUnique = getItemsLength(decodeValues, 'Trolley');
  



    const forceRerender = () => {
        setForceRerenderKey(Math.random());
    }

    const reset = () => {
        setSerials([]);
        setAssetType({});
        setAddedItems({});
        setAddedSerials({});
        setSelectedWarehouse(null);
        setStatus(statusValues.stop);
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

    React.useEffect(() => {
        handelWarehouse();
    }, [selectedWarehouse])



    const onAddSerial = (value) => {
        const currentDecodeArr = decodeValues[value];
        form.setFieldsValue({ rfId: '' })
        if (currentDecodeArr && !addedSerials[value] && !addedItems[currentDecodeArr[0]]) {
            setAddedSerials(prev => ({ ...prev, [value]: true }));
            setSerials((prev) => (removeDuplicateItems([...prev, {
                serial: value,
                start: moment().toISOString(),
                coordinate: JSON.stringify(Object.values(location.coordinates)) 
            }],
                'serial')))
            setAddedItems(prev => ({ ...prev, [currentDecodeArr[0]]: true }));
            setAssetType((prev) => ({
                ...prev, [currentDecodeArr[1]]: prev[currentDecodeArr[1]] ?
                    (prev[currentDecodeArr[1]] + 1) : 1
            }))
        }
        forceRerender();
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
    }

    const onSubmit = async () => {
        axios.post(`/create-rfidinv/`,
            {
                warehouse: selectedWarehouse?.id,
                serials,
                start_time: serials[0].start,
                end_time: serials[serials.length - 1].start,

              
            })
            .then((e) => {
                reset();
                message.success("Scan success")
            })
            .catch((e) => {
                message.warn("something went wrong")
            })
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
                            <Form.Item name="rfId" label="">
                                <Input
                                    disabled={!selectedWarehouse || status !== statusValues.start}
                                    placeholder="Enter RFID"
                                    maxLength={24}
                                />
                            </Form.Item>
                            <Form.Item >
                                <Button
                                    disabled={status !== statusValues.start}
                                    block
                                    htmlType='submit'
                                    type='primary'>
                                    Add
                                </Button>
                            </Form.Item>

                        </Form>
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
                                    <Col span={8}>{(assetType[key] / palletUnique * 100).toFixed(1)}%</Col> : ''}
                                {key === "Trolley" ?
                                    <Col span={8}>{(assetType[key] / trolleyUnique * 100).toFixed(1)}%</Col> : ''}
                                {key === "Blue Racks" ?
                                    <Col span={8}>{(assetType[key] / blueRackUnique * 100).toFixed(1)}%</Col> : ''}
                                {key === "HPT" ?
                                    <Col span={8}>{(assetType[key] / hPTUnique * 100).toFixed(1)}%</Col> : ''}

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
                                                                <DeleteOutlined
                                                                    disabled={status !== status.start}
                                                                    onClick={() => { deleteItem(item.$key, item.serial) }}
                                                                />
                                                            ]}
                                                        >
                                                            <List.Item.Meta
                                                                title={<p className='serials-title'> {
                                                                    decodeValues[item.serial] && (decodeValues[item.serial][0]) || item.serial} 
                                                                </p>}
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


                        <div className="row d-flex justify-content-center mt-3 mb-5 pb-5">
                            <div className="col-6">
                                <div class="card">
                                    <div class="card-header text-left font-weight-bold d-flex">
                                        {/* <div className="inline-block mr-auto pt-1">
                                            {location.loaded
                                                ? JSON.stringify(location)
                                                : "Location data not available yet."}
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
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