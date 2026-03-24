import React from "react";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import styles from './styles.module.scss';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';

export default function Home() {
  const {
    users,
    isLoadingUsers,
    updateUser,
    updateUserRole,
    updateUserStatus,
    isUpdatingUser,
    isUpdatingUserRole,
    isUpdatingUserStatus,
  } = useUserManagement();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const openUpdateModal = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      userCode: record.userCode || '',
      fullName: record.fullName || '',
      email: record.email || '',
      className: record.className || '',
      userCodeYear: record.userCodeYear || '',
      birthDate: record.birthDate ? dayjs(record.birthDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleUpdateInfo = (values) => {
    if (!editingUser?._id) return;

    const payload = {
      userCode: values.userCode,
      fullName: values.fullName,
      email: values.email,
      className: values.className,
      userCodeYear: values.userCodeYear,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
    };

    updateUser(editingUser._id, payload, {
      onSuccess: () => {
        message.success('Cập nhật thông tin người dùng thành công');
        handleCloseModal();
      },
      onError: (error) => {
        message.error(error?.message || 'Cập nhật thông tin người dùng thất bại');
      },
    });
  };

  const dataSource = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.map((item, index) => ({
      ...item,
      key: item._id || `${item.email}-${index}`,
      stt: index + 1,
    }));
  }, [users]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 70,
    },
    {
      title: 'Mã người dùng',
      dataIndex: 'userCode',
      key: 'userCode',
      width: 140,
      render: (value) => value || '---',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      render: (value) => value || '---',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (value) => value || '---',
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      width: 120,
      render: (value) => value || '---',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: '100%' }}
          disabled={record.role === 'LECTURER' || isUpdatingUserStatus}
          options={[
            { value: 'ACTIVE', label: 'ACTIVE' },
            { value: 'INACTIVE', label: 'INACTIVE' },
          ]}
          onChange={(nextStatus) => {
            updateUserStatus(record._id, nextStatus, {
              onSuccess: () => message.success('Cập nhật trạng thái thành công'),
              onError: (error) => message.error(error?.message || 'Cập nhật trạng thái thất bại'),
            });
          }}
        />
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 180,
      render: (role, record) => (
        <Select
          value={role}
          style={{ width: '100%' }}
          disabled={record.role === 'LECTURER' || isUpdatingUserRole}
          options={[
            { value: 'STUDENT', label: 'STUDENT' },
            { value: 'LECTURER', label: 'LECTURER' },
          ]}
          onChange={(nextRole) => {
            updateUserRole(record._id, nextRole, {
              onSuccess: () => message.success('Cập nhật vai trò thành công'),
              onError: (error) => message.error(error?.message || 'Cập nhật vai trò thất bại'),
            });
          }}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Button type="link" onClick={() => openUpdateModal(record)}>
          Cập nhật info
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className={styles.homeContainer}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div className={styles.headerRow}>
            <div>
              <Typography.Title level={3} style={{ marginBottom: 4 }}>
                User Management
              </Typography.Title>
              <Typography.Text type="secondary">
                Danh sách user + đổi status + đổi role + cập nhật thông tin
              </Typography.Text>
            </div>
            <Tag color="blue">Tổng: {dataSource.length}</Tag>
          </div>

          <Table
            bordered
            loading={isLoadingUsers}
            columns={columns}
            dataSource={dataSource}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1100 }}
          />
        </Space>

        <Modal
          title="Cập nhật thông tin người dùng"
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateInfo}
          >
            <Form.Item
              name="userCode"
              label="Mã người dùng"
              rules={[{ required: true, message: 'Vui lòng nhập mã người dùng' }]}
            >
              <Input placeholder="Nhập mã người dùng" />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item name="className" label="Lớp">
              <Input placeholder="Nhập tên lớp" />
            </Form.Item>

            <Form.Item name="userCodeYear" label="Niên khóa">
              <Input placeholder="Ví dụ: K23" />
            </Form.Item>

            <Form.Item name="birthDate" label="Ngày sinh">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button onClick={handleCloseModal}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={isUpdatingUser}>
                  Lưu cập nhật
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
