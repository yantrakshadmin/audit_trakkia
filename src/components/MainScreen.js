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
  Popover,
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
  const [visiblePop, setVisiblePop] = useState(false);

  const [pillarsData, setPillarsData] = useState({});
  const [scannedPillarPercentage, setScannedPillarPercentage] = useState(0);

  const rfidInputFocus = React.useRef(null);
  console.log(scannedPillar, 'scannedPillar');

  React.useEffect(() => {
    rfidInputFocus.current.focus();
  }, [warehouses, serials, scannedPillar]);

  const [form] = Form.useForm();

  const getItemsLength = (decodeValues, type) => {
    let len = 0;
    let addedItems = {};
    Object.values(decodeValues).map((e) => {
      if (e[1] === type && !addedItems[e[0]]) {
        len = len + 1;
        addedItems = { ...addedItems, [e[0]]: true };
      }
      return null;
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
    setScannedPillar({});
    form.setFieldsValue({ rfId: '', warehouse: null, pillarZone: null, });
  };

  const removeDuplicateItems = (arr, key) => {
    const newArr = new Map(arr.map((item) => [item[key], item])).values();
    return [...newArr];
  };

  const handleWarehouseChange = (e) => {
    form.setFieldsValue({ rfId: '', pillarZone: null });
    const index = (warehouses || []).findIndex((item) => item.id === e);
    setSelectedWarehouse(warehouses[index]);
    setStatus(statusValues.start);
    setSerials([]);

    setScannedPillar({});
    setAssetType({});
    setAddedItems({});
    setAddedSerials({});
    setForceRerenderKey(Math.random());
    setScannedPillarPercentage(0);
  };

  const handleAssetsPillar = (value) => {
    setScannedPillarPercentage(0);
    setScannedPillar({});
    // setPillarsData(value)
  };


  React.useEffect(() => {
    handelWarehouse();
    getAssetsPillar();
  }, [selectedWarehouse]);

  const onAddSerial = (value, pillarZone) => {
    const currentDecodeArr = decodeValues[value];
    console.log(value, pillarZone, currentDecodeArr, 'text value');
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
    } else if (pillarsData && pillarsData[pillarZone]?.includes(value)) {
      const newScannedPillars = { ...scannedPillar, [value]: true };
      setScannedPillarPercentage(
        isNaN(
          (getNumberOfPillars(newScannedPillars) /
            (pillarsData[pillarZone] || []).length) *
            100
        )
          ? 0
          : (
              (getNumberOfPillars(newScannedPillars) /
                (pillarsData[pillarZone] || []).length) *
              100
            ).toFixed(1)
      );

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
  const getAssetsPillar = async () => {
    axios
      .get(`/warehouse-pillarTags/?warehouse=${selectedWarehouse?.id}`)
      .then((e) => setPillarsData(e.data));
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
    axios
      .get(`grnserial-conversion/?company=${userData?.company_id}`)
      .then((e) => {
        let uniqueType = {};
        Object.keys(e.data).map(
          (key) => (uniqueType = { ...TypesToMap, [e.data[key][1]]: true }),
          setTypesToMap(uniqueType)
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
                console.log(typeof data.rfId, 'data rfidd');
                if (data.rfId) {
                  onAddSerial(data.rfId, data.pillarZone);
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
                    <Option key={v.id} value={v.id}>
                      {v.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="pillarZone" label="Zone Pillar :">
                <Select
                  autoFocus={true}
                  disabled={!selectedWarehouse || status !== statusValues.start}
                  placeholder="Set Pillar Zone"
                  onChange={handleAssetsPillar}
                >
                  {(Object.entries(pillarsData) || []).map((v, i) => (
                    <Option key={v[0]} value={v[0]}>
                      {v[0]}
                    </Option>
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

            {(pillarsData[form.getFieldValue('pillarZone')] || []).length >
              0 && (
              <>
                <Row className="bg-light px-2 py-1">
                  <Col span={20}>
                    <b>Pillar</b>
                  </Col>
                  <Col span={4}>
                    <b>Percantage</b>
                  </Col>
                </Row>

                <div className="border" key={String($forceRerenderKey) + 'epc'}>
                  <Row className="pillar-scroll-view px-2 py-2">
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
                        {(
                          pillarsData[form.getFieldValue('pillarZone')] || []
                        ).map((item, i) => (
                          <div>
                            {scannedPillar[item] ?  (
                              <Popover
                                key={ ('popover'+ i)}
                                // content={<a onClick={hide}>Close</a>}
                                content={item}
                                trigger="click"
                                // visible={visiblePop}
                                // onVisibleChange={handleVisibleChange}
                              >
                                <img
                                  onClick={() => setVisiblePop(true)}
                                  className="p-1"
                                  height={'40rem'}
                                  color="white"
                                  src={PillarGreen}
                                />
                              </Popover>
                            ) : (
                                <Popover
                                  key={ 'popover' + i}
                                // content={<a onClick={hide}>Close</a>}
                                content={item}
                                trigger="click"
                                // visible={visiblePop}
                                // onVisibleChange={handleVisibleChange}
                              >
                                <img
                                  className="p-1"
                                  height={'40rem'}
                                  color="white"
                                  src={PillarRed}
                                />
                              </Popover>
                            )}
                          </div>
                        ))}
                      </div>
                    </Col>
                    <Col style={{ paddingLeft: '1rem' }} span={4}>
                      {scannedPillarPercentage}%
                    </Col>
                  </Row>
                </div>
                <br />
              </>
            )}

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
              {console.log(scannedPillarPercentage, 'scannedPillarPercentage')}
              <Button
                key={'submit' + String(scannedPillarPercentage)}
                loading={loading}
                className="ml-2"
                disabled={
                  status !== statusValues.start ||
                  loading ||
                  parseInt(scannedPillarPercentage) !== 100
                }
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
