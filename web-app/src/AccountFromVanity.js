import React, {useState} from "react";
import {Card, Divider, Form, Input} from "antd";
import {CopyButton} from "./CopyButton";
import {useAleoWASM} from "./aleo-wasm-hook";
import {findAddressContainingSubstring} from "./vanity";

export const AccountFromVanity = () => {
    let [account, setAccount] = useState(null);
    const aleo = useAleoWASM();

    const onChange = (event) => {
        setAccount(null);
        try {
            setAccount(findAddressContainingSubstring(event.target.value, aleo));
        } catch (error) {
            console.error(error);
        }
    }

    const layout = {labelCol: {span: 3}, wrapperCol: {span: 21}};

    if (aleo !== null) {
        const viewKey = () => account !== null ? account.to_view_key() : "";
        const address = () => account !== null ? account.to_address() : "";
        const privateKey = () => account !== null ? account.to_private_key() : "";

        return <Card title="Generate Vanity Address" style={{width: "100%", borderRadius: "20px"}}
                     bordered={false}>
            <Form {...layout}>
                <Form.Item label="Desired Address" colon={false}>
                    <Input name="Desired Address" size="large" placeholder="Substring" allowClear onInput={onChange}
                           style={{borderRadius: '20px'}}/>
                </Form.Item>
            </Form>
            {
                (account !== null) ?
                    <Form {...layout}>
                        <Divider/>
                        <Form.Item label="Private Key" colon={false}>
                            <Input size="large" placeholder="View Key" value={privateKey()}
                                   addonAfter={<CopyButton data={address()} style={{borderRadius: '20px'}}/>} disabled/>
                        </Form.Item>
                        <Form.Item label="View Key" colon={false}>
                            <Input size="large" placeholder="View Key" value={viewKey()}
                                   addonAfter={<CopyButton data={address()} style={{borderRadius: '20px'}}/>} disabled/>
                        </Form.Item>
                        <Form.Item label="Address" colon={false}>
                            <Input size="large" placeholder="Address" value={address()}
                                   addonAfter={<CopyButton data={address()} style={{borderRadius: '20px'}}/>} disabled/>
                        </Form.Item>
                    </Form>
                    : null
            }
        </Card>
    } else {
        return <h3>
            <center>Loading...</center>
        </h3>
    }
}