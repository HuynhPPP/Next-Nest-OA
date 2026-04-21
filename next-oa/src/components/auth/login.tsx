'use client'
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { authenticate } from '@/utils/actions';
import { useRouter } from 'next/navigation';
import ModalReactive from './modal.reactive';
import { useState } from 'react';

const Login = () => {
    const router = useRouter();
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [userEmail, setUserEmail] = useState("")

    const onFinish = async (values: any) => {

        const { email, password } = values
        setUserEmail(email)

        // strigger sign in
        const res = await authenticate(email, password)

        if (res?.error) {

            if (res?.code === 2) {
                setIsOpenModal(true)
                setUserEmail(email)
                return;
            }

            notification.error({
                message: "Lỗi đăng nhập !",
                description: res.error,
            })

        } else {
            notification.success({
                message: "Đăng nhập thành công !",
            })
            router.push("/dashboard")
        }
    };

    return (
        <>
            <Row justify={"center"} style={{ marginTop: "30px" }}>
                <Col xs={24} md={16} lg={8}>
                    <fieldset style={{
                        padding: "15px",
                        margin: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}>
                        <legend>Đăng Nhập</legend>
                        <Form
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout='vertical'
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>



                            <Form.Item
                            >
                                <Button type="primary" htmlType="submit">
                                    Login
                                </Button>
                            </Form.Item>
                        </Form>
                        <Link href={"/"}><ArrowLeftOutlined /> Quay lại trang chủ</Link>
                        <Divider />
                        <div style={{ textAlign: "center" }}>
                            Chưa có tài khoản? <Link href={"/auth/register"}>Đăng ký tại đây</Link>
                        </div>
                    </fieldset>
                </Col>
            </Row>
            <ModalReactive isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} userEmail={userEmail} />
        </>
    )
}

export default Login;