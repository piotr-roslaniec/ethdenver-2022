import React, { useState } from "react";
import { Button, Card, Col, Divider, Form, Input, Row } from "antd";

import { CopyButton } from "./CopyButton";
import { useAleoWASM } from "./aleo-wasm-hook";
import { findAddressContainingSubstring } from "./vanity";

export const NewAccount = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [substr, setSubstr] = useState("");
    const aleo = useAleoWASM();

    const clear = () => setAccount(null);

    const generateAccount = async () => {
        clear();
        setLoading(true);
        const account = await findAddressContainingSubstring(aleo, substr);
        setAccount(account);
        setLoading(false);

        // setTimeout(() => {
        // }, 30 * 1000);
    }

    const privateKey = () => account !== null ? account.to_private_key() : "";
    const viewKey = () => account !== null ? account.to_view_key() : "";
    const address = () => account !== null ? account.to_address() : "";

    const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

    if (aleo !== null) {
        return <Card title="Generate a Vanity Address" style={{ width: "100%", borderRadius: "20px" }} bordered={false}>
            <Form {...layout} onChange={(event) => setSubstr(event.target.value)}>
                <Form.Item label="Substring" colon={false}>
                    <Input name="Substring" size="large" placeholder="ethdenv" allowClear
                        style={{ borderRadius: '20px' }} />
                </Form.Item>
            </Form>
            <Row justify="center">
                <Col>
                    <Button type="primary" disabled={!substr} onClick={generateAccount} shape="round" size="large" loading={!!loading}>Generate</Button>
                </Col>
            </Row>
            {
                account &&
                <Form {...layout}>
                    <Divider />
                    <Form.Item label="Private Key" colon={false}>
                        <Input size="large" placeholder="Private Key" value={privateKey()}
                            addonAfter={<CopyButton data={privateKey()} />} disabled />
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
    } else {
        return <h3>
            <center>Loading...</center>
        </h3>
    }
}