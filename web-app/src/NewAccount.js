import React, { useState } from "react";
import { Button, Card, Col, Divider, Form, Input, Row } from "antd";

import { CopyButton } from "./CopyButton";
import { findAddressContainingSubstring } from "./vanity";

export const NewAccount = () => {
    const [account, setAccount] = useState(null);
    const [seed, setSeed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [substr, setSubstr] = useState("");

    const clear = () => setAccount(null);

    const generateAccount = async () => {
        clear();
        setLoading(true);
        setTimeout(() => { }, 100);
        const result = await findAddressContainingSubstring(substr, 1000);
        if (!result) {
            // TODO: Add max epoch to use input?
            // TODO: use setError
            alert('Failed to generate a vanity address');
            setLoading(false);
            return;
        }
        setAccount(result.account);
        setSeed(result.seed);
        setLoading(false);
    }

    const privateKey = () => account !== null ? "Stays safe inside MetaMask!" : "";
    const matchingSeed = () => seed !== null ? seed : "";
    const viewKey = () => account !== null ? account.view_key : "";
    const address = () => account !== null ? account.address : "";

    const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

    return (
        <>
            <Divider />
            <Card title="Generate a Vanity Address" style={{ width: "100%", borderRadius: "20px" }} bordered={false}>
                <Form {...layout} onChange={(event) => setSubstr(event.target.value)}>
                <p>Info: Generating a vanity address could take a while. For starters, try: "e".</p>
                    <Form.Item label="Prefix" colon={false}>
                        <Input name="Prefix" size="large" placeholder="ethdenv" allowClear
                            style={{ borderRadius: '20px' }} />
                    </Form.Item>
                    <Row justify="center">
                        <Col>
                            <Button type="primary" disabled={!substr} onClick={generateAccount} shape="round" size="large" loading={!!loading}>Generate</Button>
                        </Col>
                    </Row>
                </Form>
                {
                    account &&
                    <Form {...layout}>
                        <Divider />
                        <Form.Item label="Private Key" colon={false}>
                            <Input size="large" placeholder="Private Key" value={privateKey()}
                                addonAfter={<CopyButton data={privateKey()} />} disabled />
                        </Form.Item>
                        <Form.Item label="Seed" colon={false}>
                            <Input size="large" placeholder="Seed" value={matchingSeed()}
                                addonAfter={<CopyButton data={matchingSeed()} />} disabled />
                        </Form.Item>
                        <Form.Item label="View Key" colon={false}>
                            <Input size="large" placeholder="View Key" value={viewKey()}
                                addonAfter={<CopyButton data={viewKey()} />} disabled />
                        </Form.Item>
                        <Form.Item label="Address" colon={false}>
                            <Input size="large" placeholder="Address" value={address()}
                                addonAfter={<CopyButton data={address()} />} disabled />
                        </Form.Item>
                    </Form>
                }
            </Card>
        </>)
}