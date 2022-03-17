import React, { useState } from "react";
import { Button, Card, Col, Divider, Form, Input, Row } from "antd";

import { CopyButton } from "./CopyButton";
import { connectSnap, getAccount, DEFAULT_SNAP_ID } from "./snap";


const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

export const RecoverAccount = () => {
    const [recoveredAccount, setRecovered] = useState(null);
    const [seed, setSeed] = useState(null);
    const [userSeed, setUserSeed] = useState("");
    const [loadingRecovery, setLoadingRecovery] = useState(false);

    const recoverAccount = async () => {
        setRecovered(null);
        setLoadingRecovery(true);
        setTimeout(() => { }, 100);
        const recovered = await getAccount(userSeed);
        if (!recovered) {
            // TODO: use setError
            alert('Failed to recover an account');
            setLoadingRecovery(false);
            return;
        }
        setRecovered(recovered);
        setSeed(userSeed);
        setLoadingRecovery(false);
    }

    const privateKey = () => recoveredAccount !== null ? "Stays safe inside MetaMask!" : "";
    const matchingSeed = () => seed !== null ? seed : "";
    const viewKey = () => recoveredAccount !== null ? recoveredAccount.view_key : "";
    const address = () => recoveredAccount !== null ? recoveredAccount.address : "";

    return (
        <>
            <Divider />
            <Card title="Recover an Account" style={{ width: "100%", borderRadius: "20px" }} bordered={false}>
                <Form {...layout} >
                    <p>Info: You need to generate account first.</p>
                    <p>If you've set your vanity address prefix to "e" in the previous step, try using "e_3_3".</p>
                    <p>Alternatively, try using a random seed.</p>
                    <Form.Item colon={false}>
                        <Input name="Seed" size="large" placeholder="Enter seed" onChange={(event) => setUserSeed(event.target.value)}
                            style={{ borderRadius: '20px' }} />
                    </Form.Item>
                    <Row justify="center">
                        <Col>
                            <Button type="primary" disabled={!userSeed} onClick={recoverAccount} shape="round" size="large" loading={!!loadingRecovery}>Recover</Button>
                        </Col>
                    </Row>
                </Form>
                {
                    recoveredAccount &&
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