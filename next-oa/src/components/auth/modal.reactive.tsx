'use client'

import { Button, Form, Input, Modal, notification, Steps } from "antd"
import { useHasMounted } from "@/utils/customHook"
import React, { useState } from 'react';
import { SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { sendRequest } from "@/utils/api";

const ModalReactive = ({
    isOpenModal,
    setIsOpenModal,
    userEmail
}: {
    isOpenModal: boolean,
    setIsOpenModal: (isOpenModal: boolean) => void,
    userEmail: string
}) => {

    const [current, setCurrent] = useState(0);
    const [userId, setUserId] = useState("")

    const hasMounted = useHasMounted()
    if (!hasMounted) return <></>

    const handleOk = () => {
        setIsOpenModal(false)
    }
    const handleCancel = () => {
        setIsOpenModal(false)
    }

    const onFinishStep0 = async (values: any) => {
        const { email } = values
        const res = await sendRequest<IBackendRes<any>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/resend-code`,
            body: { email },
        });

        if (res?.data) {
            setUserId(res?.data?._id)
            setCurrent(1)
        } else {
            notification.error({
                message: "Gửi lại mã kích hoạt thất bại",
                description: res?.message,
            });
        }

    }

    const onFinishStep1 = async (values: any) => {
        const { code } = values
        const res = await sendRequest<IBackendRes<any>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/check-code`,
            body: { code, _id: userId },
        });

        if (res?.data) {
            setCurrent(2)
        } else {
            notification.error({
                message: "Gửi lại mã kích hoạt thất bại",
                description: res?.message,
            });
        }

    }

    return (
        <Modal
            title="Kích hoạt tài khoản"
            open={isOpenModal}
            onOk={handleOk}
            onCancel={handleCancel}
            maskClosable={false}
            footer={null}
        >
            <Steps
                current={current}
                items={[
                    {
                        title: 'Login',
                        icon: <UserOutlined />,
                    },
                    {
                        title: 'Verification',
                        icon: <SolutionOutlined />,
                    },
                    {
                        title: 'Done',
                        icon: <SmileOutlined />,
                    },
                ]}
            />

            {
                current === 0 && <>
                    <div style={{ margin: "20px 0" }}>
                        Tài khoản của bạn chưa được kích hoạt
                    </div>

                    <Form
                        name="basic"
                        autoComplete="off"
                        onFinish={onFinishStep0}
                        layout='vertical'
                    >
                        <Form.Item
                            name="email"
                            initialValue={userEmail}

                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                        >
                            <Button type="primary" htmlType="submit">
                                Gửi lại mã kích hoạt
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            }
            {
                current === 1 && (
                    <>
                        <div style={{ margin: "20px 0" }}>
                            Nhập mã kích hoạt đã gửi đến email của bạn
                        </div>

                        <Form
                            name="basic"
                            autoComplete="off"
                            onFinish={onFinishStep1}
                            layout='vertical'
                        >
                            <Form.Item
                                label="Code"
                                name="code"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mã kích hoạt!',
                                    },
                                ]}

                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                            >
                                <Button type="primary" htmlType="submit">
                                    Kích hoạt
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )
            }
            {
                current === 2 && (
                    <>
                        <div style={{ margin: "20px 0" }}>
                            Kích hoạt tài khoản thành công. Vui lòng đăng nhập lại
                        </div>
                    </>
                )
            }
        </Modal>
    )
}

export default ModalReactive