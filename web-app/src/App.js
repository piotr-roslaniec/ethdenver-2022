import './App.css';
import React, { useState } from 'react';

import { Layout, Menu } from 'antd';
import { Button, Card, Col, Form, Input, Row } from "antd";

import { NewAccount } from "./NewAccount";
import { RecoverAccount } from "./RecoverAccount";
import { SendTransaction } from "./SendTransaction";
import { connectSnap, DEFAULT_SNAP_ID } from "./snap";


const { Header, Content, Footer } = Layout;

function App() {
    const [menuIndex, setMenuIndex] = useState(0);
    const [snapConnected, setSnapConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    const doConnectSnap = async () => {
        setLoading(true);
        setSnapConnected(false);
        try {
            await connectSnap(DEFAULT_SNAP_ID);
            setSnapConnected(true);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <Layout className="layout" style={{ minHeight: '100' }}>
            <Header className="header">
                <div className="logo" />
                <Menu mode="horizontal" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" onClick={() => setMenuIndex(0)}>Create Account</Menu.Item>
                    <Menu.Item key="2" onClick={() => setMenuIndex(1)}>Recover Account</Menu.Item>
                    <Menu.Item key="3" onClick={() => setMenuIndex(2)}>Send Transaction</Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '50px 50px' }}>
                {!snapConnected &&
                    <Card title="Connect and install Aleo snap" style={{ width: "100%", borderRadius: "20px" }} bordered={false}>
                        <Row justify="center">
                            <Col>
                                <Button type="primary" disabled={snapConnected} onClick={doConnectSnap} shape="round" size="large" loading={!!loading}>Connect</Button>
                            </Col>
                        </Row>
                    </Card>}
                {
                    snapConnected && menuIndex === 0 && <NewAccount />
                }
                {
                    snapConnected && menuIndex === 1 && <RecoverAccount />
                }
                {
                    snapConnected && menuIndex === 2 && <SendTransaction />
                }
            </Content>
            <Footer style={{ textAlign: 'center' }}>Visit <a href="https://github.com/piotr-roslaniec/ethdenver-2022">our Github
                repo</a>.</Footer>
        </Layout>
    );
}

export default App;
