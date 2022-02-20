import './App.css';
import React, { useState } from 'react';

import { Layout, Menu } from 'antd';
import { NewAccount } from "./NewAccount";

const { Header, Content, Footer } = Layout;

function App() {
    const [menuIndex, setMenuIndex] = useState(0);

    return (
        <Layout className="layout" style={{ minHeight: '100' }}>
            <Header className="header">
                <div className="logo" />
                <Menu mode="horizontal" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" onClick={() => setMenuIndex(0)}>Account</Menu.Item>
                    <Menu.Item key="2" onClick={() => setMenuIndex(1)}>Record</Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '50px 50px' }}>
                {
                    menuIndex === 0 &&
                    <>
                        <NewAccount />
                    </>
                }
                {
                    menuIndex === 1 && <SendTransaction />
                }
            </Content>
            <Footer style={{ textAlign: 'center' }}>Visit <a href="https://github.com/piotr-roslaniec/ethdenver-2022">our Github
                repo</a>.</Footer>
        </Layout>
    );
}

export default App;
