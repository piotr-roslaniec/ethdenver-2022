import React, { useState } from "react";
import { Button, Card, Col, Form, Input, Row } from "antd";

import { fakeTxHex } from "./tx";
import { sendTransaction } from "./snap";

export const SendTransaction = () => {
    const layout = { labelCol: { span: 2 }, wrapperCol: { span: 20 } };
    const [loading, setLoading] = useState(false);
    const [seed, setSeed] = useState(false);

    const sendTx = async () => {
        setLoading(true);
        setTimeout(() => { }, 100);
        await sendTransaction(seed, fakeTxHex);
        setLoading(false);
    }

    return <>
        <Card title="Send a Transaction" style={{ width: "100%", borderRadius: "20px" }} bordered={false}>
            <Form {...layout} >
                <p>We'll send a transaction using an account seed.</p>
                <p>Info: You need to generate account first. Alternatively, try using a random seed.</p>
                <Form.Item colon={false}>
                    <Input name="Seed" size="large" placeholder="Enter seed" onChange={(event) => setSeed(event.target.value)}
                        style={{ borderRadius: '20px' }} />
                </Form.Item>
                <Row justify="center">
                    <Col>
                        <Button type="primary" onClick={sendTx} shape="round" size="large" loading={!!loading}>Send Tx</Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    </>;
}
