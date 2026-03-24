import React, { useState } from 'react';
import { Table, Button, Input, Modal, Upload, message, Popconfirm, Space } from 'antd';
import { UserAddOutlined, UploadOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useCourseStudents } from '@/hooks/useCourseStudent';
import styles from '../styles.module.scss';



const StudentsTab = ({ courseId }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [searchValue, setSearchValue] = useState('');

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newStudentId, setNewStudentId] = useState('');

    const {
        data,
        isLoading,
        addStudent,
        isAdding,
        removeStudent,
        isRemoving,
        importExcel,
        isImportingExcel,
    } = useCourseStudents(courseId, { page, limit, search });

    const students = Array.isArray(data) ? data : (data?.items || []);
    const totalItems = data?.pagination?.totalItems || students.length;

    const handleSearch = () => {
        setSearch(searchValue);
        setPage(1);
    };

    const handleTableChange = (pagination) => {
        setPage(pagination.current);
        setLimit(pagination.pageSize);
    };

    const handleAddStudent = async () => {
        if (!newStudentId.trim()) {
            message.warning('Vui lòng nhập ID sinh viên');
            return;
        }
        try {
            await addStudent({ studentId: newStudentId });
            message.success('Thêm sinh viên thành công');
            setIsAddModalVisible(false);
            setNewStudentId('');
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm sinh viên');
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await removeStudent(studentId);
            message.success('Xóa sinh viên thành công');
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sinh viên');
        }
    };



    const handleUploadExcel = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file);

        try {
            await importExcel(formData);
            message.success('Import sinh viên từ Excel thành công');
            onSuccess("Ok");
        } catch (error) {
            message.error(error.response?.data?.message || 'Import thất bại');
            onError(error);
        }
    };

    const columns = [
        {
            title: 'Mã SV',
            dataIndex: ['student', 'userCode'],
            key: 'userCode',
        },
        {
            title: 'Họ và tên',
            dataIndex: ['student', 'fullName'],
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: ['student', 'email'],
            key: 'email',
        },
        {
            title: 'Thời gian tham gia',
            dataIndex: 'joinedAt',
            key: 'joinedAt',
            render: (text) => new Date(text).toLocaleString('vi-VN'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Popconfirm
                    title={<span style={{ fontWeight: 600, color: '#e53e3e' }}>Xóa sinh viên này?</span>}
                    description={
                        <div style={{ maxWidth: 220, color: '#4a5568', marginTop: 4 }}>
                            Xóa <strong>{record.student?.fullName}</strong> ({record.student?.userCode}) khỏi lớp? Dữ liệu không thể khôi phục.
                        </div>
                    }
                    overlayClassName="customPopconfirm"
                    onConfirm={() => handleRemoveStudent(record.student?._id || record.id)}
                    okText="Xóa ngay"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, size: 'middle', style: { borderRadius: 6, fontWeight: 500 } }}
                    cancelButtonProps={{ size: 'middle', style: { borderRadius: 6 } }}
                    placement="topRight"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className={styles.studentsTabWrap}>
            <div className={styles.studentsToolbar}>
                <Input
                    placeholder="Tìm mã SV, tên hoặc email (Nhấn Enter)"
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    className={`${styles.searchInput} ${styles.studentsSearchInput}`}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        if (!e.target.value) {
                            setSearch('');
                            setPage(1);
                        }
                    }}
                    onPressEnter={handleSearch}
                    allowClear
                />
                <Space className={styles.studentsToolbarActions} size={10}>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        Thêm sinh viên
                    </Button>
                    <Upload
                        accept=".xlsx, .xls"
                        customRequest={handleUploadExcel}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />} loading={isImportingExcel}>
                            Import Excel
                        </Button>
                    </Upload>
                </Space>
            </div>

            <div className={styles.studentsTableWrap}>
                <Table
                    columns={columns}
                    dataSource={students}
                    rowKey={(record) => record.id || record.student?._id || Math.random().toString()}
                    loading={isLoading}
                    scroll={{ x: 880 }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total: totalItems,
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                />
            </div>

            <Modal
                title="Thêm sinh viên vào lớp"
                open={isAddModalVisible}
                onOk={handleAddStudent}
                onCancel={() => setIsAddModalVisible(false)}
                okText="Thêm"
                cancelText="Hủy"
                confirmLoading={isAdding}
            >
                <div style={{ marginBottom: 16 }}>
                    Nhập ID của sinh viên để thêm vào lớp học phần này:
                </div>
                <Input
                    placeholder="Nhập ID sinh viên"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    onPressEnter={handleAddStudent}
                />
            </Modal>
        </div>
    );
};

export default StudentsTab;
