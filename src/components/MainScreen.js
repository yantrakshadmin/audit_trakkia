import React, { useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import {
  List,
  Divider,
  Button,
  Row,
  Col,
  Empty,
  Card,
  Form,
  Select,
  Input,
  message,
} from 'antd';
import PillarRed from '../img/PillarRed.jpeg';
import PillarGreen from '../img/PillarGreen.jpeg';

import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const statusValues = {
  start: 'start',
  stop: 'stop',
};

const MainScreen = ({ userData }) => {
  const [serials, setSerials] = useState([]);
  const [$forceRerenderKey, setForceRerenderKey] = useState(Math.random());
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [status, setStatus] = useState(null);
  const [addedItems, setAddedItems] = React.useState({});
  const [decodeValues, setDecodeValues] = useState({});
  const [assetType, setAssetType] = useState({});
  const [addedSerials, setAddedSerials] = useState({});
  const [TypesToMap, setTypesToMap] = useState({});
  const [scannedPillar, setScannedPillar] = useState({});
  const [loading, setLoading] = useState(false);

  console.log(serials, 'serials+++++++');

  const rfidInputFocus = React.useRef(null);

  React.useEffect(() => {
    rfidInputFocus.current.focus();
  }, [warehouses, serials]);

  const epc = [
    'kpmz9',
    '4oq2z',
    'k15vj',
    'a2xug',
    'l0umn',
    'wuj02',
    'e1r2f',
    'p32l6',
    '361mz',
    'sr6kg',
  ];

  const [form] = Form.useForm();
  // let checkObj = Object.values(decodeValues).map(e => e[0]);
  // let uniqueChars = [...new Set(checkObj)];

  const getItemsLength = (decodeValues, type) => {
    let len = 0;
    let addedItems = {};
    Object.values(decodeValues).map((e) => {
      if (e[1] === type && !addedItems[e[0]]) {
        len = len + 1;
        addedItems = { ...addedItems, [e[0]]: true };
      }
    });
    return len;
  };

  const forceRerender = () => {
    setForceRerenderKey(Math.random());
  };
  const reset = () => {
    setSerials([]);
    setAssetType({});
    setAddedItems({});
    setAddedSerials({});
    setSelectedWarehouse(null);
    setStatus(statusValues.stop);
    setForceRerenderKey(Math.random());
    form.setFieldsValue({ rfId: '', warehouse: null });
  };

  const removeDuplicateItems = (arr, key) => {
    const newArr = new Map(arr.map((item) => [item[key], item])).values();
    return [...newArr];
  };

  const handleWarehouseChange = (e) => {
    const index = (warehouses || []).findIndex((item) => item.id === e);
    setSelectedWarehouse(warehouses[index]);
    setStatus(statusValues.start);
    setSerials([]);
    setAssetType({});
    setAddedItems({});
    setAddedSerials({});
    setForceRerenderKey(Math.random());
  };

  React.useEffect(() => {
    handelWarehouse();
  }, [selectedWarehouse]);

  const onAddSerial = (value) => {
    const currentDecodeArr = decodeValues[value];
    console.log(decodeValues, 'onadd working');

    form.setFieldsValue({ rfId: '' });
    if (
      currentDecodeArr &&
      !addedSerials[value] &&
      !addedItems[currentDecodeArr[0]]
    ) {
      setAddedSerials((prev) => ({ ...prev, [value]: true }));
      setSerials((prev) =>
        removeDuplicateItems(
          [
            ...prev,
            {
              serial: value,
              start: moment().toISOString(),
            },
          ],
          'serial'
        )
      );
      setAddedItems((prev) => ({ ...prev, [currentDecodeArr[0]]: true }));
      setAssetType((prev) => ({
        ...prev,
        [currentDecodeArr[1]]: prev[currentDecodeArr[1]]
          ? prev[currentDecodeArr[1]] + 1
          : 1,
      }));
    } else if (epc?.includes(value)) {
      setScannedPillar((prev) => ({ ...prev, [value]: true }));
    }

    forceRerender();
  };

  const deleteItem = (key, serial) => {
    const selectedDecodeValue = decodeValues[serial];
    console.log(selectedDecodeValue, '=====');
    if (selectedDecodeValue && assetType[selectedDecodeValue[1]]) {
      setAssetType((prev) => ({
        ...prev,
        ...(prev[selectedDecodeValue[1]] && {
          [selectedDecodeValue[1]]: prev[selectedDecodeValue[1]] - 1,
        }),
      }));
    }
    setSerials((prev) => prev.filter((item) => item.$key !== key));
  };

  const onSubmit = async () => {
    setLoading(true);
    axios
      .post(`/create-rfidinv/`, {
        warehouse: selectedWarehouse?.id,
        serials,
        start_time: serials[0].start,
        end_time: serials[serials.length - 1].start,
      })
      .then((e) => {
        reset();
        message.success('Scan success');
        setLoading(false);
      })
      .catch((e) => {
        message.warn('something went wrong');
        setLoading(false);
      });
  };

  const handelWarehouse = async () => {
    axios
      .get(`/company-warehouse/?id=${userData.company_id}`)
      .then((e) => setWarehouses(e.data))
      .catch((e) => {});
  };

  const handleKeyPress = (e) => {
    console.log(e.code, 'this/.....');
    if (e.code === 'Enter') {
      form.submit();
    }
  };

  const getNumberOfPillars = (p) => {
    let num = 0;
    Object.keys(p || {}).map((key) => {
      if (p[key]) {
        num = num + 1;
      }
    });
    return num;
  };

  React.useEffect(() => {
    axios.get(`grnserial-conversion/?company=${52}`).then((e) => {
      let uniqueType = {};
      Object.keys(e.data).map(
        (key) => (uniqueType = { ...TypesToMap, [e.data[key][1]]: true }),
        setTypesToMap(uniqueType)
        // { setTypesToMap({ ...TypesToMap, [e.data[key][1]]: true }) }
      );
      setDecodeValues(e.data);
    });

    document.addEventListener('keyup', handleKeyPress);
    return () => document.removeEventListener('keyup', handleKeyPress);
  }, []);

  return (
    <div className="site-card-border-less-wrapper">
      <br />
      <Row justify="center">
        <Col {...{ md: 12, sm: 24, lg: 12, xl: 12 }}>
          <Card title="Audit" bordered={false}>
            <Form
              layout="vertical"
              form={form}
              onFinish={(data) => {
                if (data.rfId) {
                  onAddSerial(data.rfId);
                }
              }}
            >
              <Form.Item name="warehouse" label="Select Warehouse :">
                <Select
                  placeholder="Select Warehouse"
                  onChange={handleWarehouseChange}
                  autoFocus={true}
                >
                  {(warehouses || []).map((v) => (
                    <Option value={v.id}>{v.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="rfId" label="">
                <Input
                  disabled={!selectedWarehouse || status !== statusValues.start}
                  placeholder="Enter RFID"
                  maxLength={24}
                  ref={rfidInputFocus}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  disabled={status !== statusValues.start}
                  block
                  htmlType="submit"
                  type="primary"
                >
                  Add
                </Button>
              </Form.Item>
            </Form>
            <br />

            <Row className="bg-light px-2 py-1">
              <Col span={20}>
                <b>Pillar</b>
              </Col>
              <Col span={4}>
                <b>Percantage</b>
              </Col>
            </Row>
            <div className="border" key={String($forceRerenderKey) + 'epc'}>
              <Row className="px-2 py-2">
                <Col span={20}>
                  {/* {epc.map((e) =>
                    e == 'a2xug' ? (
                      <img
                        className="px-2"
                        height={'40rem'}
                        color="white"
                        src={PillarGreen}
                      />
                    ) : (
                      <img
                        className="px-2"
                        height={'40rem'}
                        color="white"
                        src={PillarRed}
                      />
                    )
                  )} */}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {(epc || []).map((item) => (
                      <div>
                        {scannedPillar[item] ? (
                          <img
                            className="p-1"
                            height={'40rem'}
                            color="white"
                            src={PillarGreen}
                          />
                        ) : (
                          <img
                            className="p-1"
                            height={'40rem'}
                            color="white"
                            src={PillarRed}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
                <Col span={4}>
                  {(getNumberOfPillars(scannedPillar) / epc.length) * 100}%
                </Col>
              </Row>
            </div>

            <br />
            {Object.keys(assetType).length > 0 && (
              <Row className="bg-light px-2 py-1">
                <Col span={8}>
                  <b>Asset Type</b>
                </Col>
                <Col span={8}>
                  <b>Count</b>
                </Col>
                <Col span={8}>
                  <b>Scanned Percentage</b>
                </Col>
              </Row>
            )}
            <div
              className="border"
              key={String($forceRerenderKey) + 'countTable'}
            >
              {Object.keys(assetType).map((key) => (
                <Row key={key} className="px-2">
                  {/* {console.log(key, 'assetkey')} */}
                  <Col span={8}>{key}</Col>
                  <Col span={8}>{assetType[key]}</Col>
                  <Col>
                    {(
                      (assetType[key] / getItemsLength(decodeValues, key)) *
                      100
                    ).toFixed(1)}
                    {console.log(
                      getItemsLength(decodeValues, key),
                      'assetType[key]'
                    )}
                    %
                  </Col>

                  {/* <Col span={8}>
                      {key === 'Plastic Pallet' ? (
                        <Col span={8}>
                          {((assetType[key] / palletUnique) * 100).toFixed(1)}%
                        </Col>
                      ) : (
                        ''
                      )}
                      {key === 'Trolley' ? (
                        <Col span={8}>
                          {((assetType[key] / trolleyUnique) * 100).toFixed(1)}%
                        </Col>
                      ) : (
                        ''
                      )}
                      {key === 'Blue Racks' ? (
                        <Col span={8}>
                          {((assetType[key] / blueRackUnique) * 100).toFixed(1)}
                          %
                        </Col>
                      ) : (
                        ''
                      )}
                      {key === 'HPT' ? (
                        <Col span={8}>
                          {((assetType[key] / hPTUnique) * 100).toFixed(1)}%
                        </Col>
                      ) : (
                        ''
                      )}
                    </Col> */}
                </Row>
              ))}
            </div>
            <div>
              {serials.length ? (
                <div key={String($forceRerenderKey)}>
                  <Divider orientation="left">
                    Total Serial Count (Count: {serials?.length})
                  </Divider>
                  {
                    <div className="scroll-view">
                      <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={serials}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <DeleteOutlined
                                disabled={status !== status.start}
                                onClick={() => {
                                  deleteItem(item.$key, item.serial);
                                }}
                              />,
                            ]}
                          >
                            <List.Item.Meta
                              title={
                                <p className="serials-title">
                                  {' '}
                                  {(decodeValues[item.serial] &&
                                    decodeValues[item.serial][0]) ||
                                    item.serial}
                                  {/* {item.coordinate} */}
                                </p>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  }
                </div>
              ) : (
                <Empty
                  imageStyle={{
                    height: 300,
                  }}
                  description={<span>Please Select Warehouse and Start</span>}
                ></Empty>
              )}
            </div>
            <br />

            <div className="">
              {status !== statusValues.start && (
                <Button
                  className="mr-2"
                  type="primary"
                  onClick={() => {
                    setStatus(statusValues.start);
                  }}
                >
                  Start
                </Button>
              )}
              {status === statusValues.start && (
                <Button
                  className="mr-2"
                  type="danger"
                  onClick={() => {
                    setStatus(statusValues.stop);
                  }}
                >
                  Stop
                </Button>
              )}
              <Button
                className="mx-2"
                disabled={status !== statusValues.start}
                onClick={reset}
                type="warning"
              >
                Reset
              </Button>
              <Button
                loading={loading}
                className="ml-2"
                disabled={status !== statusValues.start || loading}
                onClick={onSubmit}
              >
                Submit
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MainScreen;
