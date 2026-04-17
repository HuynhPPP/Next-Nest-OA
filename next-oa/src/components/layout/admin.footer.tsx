'use client'
import { Layout } from 'antd';

const AdminFooter = () => {
    const { Footer } = Layout;

    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                Huỳnh Phan IT ©{new Date().getFullYear()} Created by @huynhphanit
            </Footer>
        </>
    )
}

export default AdminFooter;