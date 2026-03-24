import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Popconfirm, Space, Table, Upload, message } from 'antd';
import { DeleteOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { useCourseStudents } from '@/hooks/useCourseStudents';
import styles from '../styles.module.scss';

const { TextArea } = Input;

const parseStudentIdsFromInput = (rawInput) => {
    if (!rawInput?.trim()) return [];

    const trimmed = rawInput.trim();

    if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) {
            throw new Error('JSON phải là mảng ID sinh viên');
        }
        return parsed.map((id) => String(id).trim()).filter(Boolean);
    }

    return trimmed
        .split(/[\n,;\s]+/)
        .map((id) => id.trim())
        .filter(Boolean);
};

const StudentManagementTab = ({ courseId }) => {
    const {
        students,
        isLoadingStudents,
        addStudent,
        removeStudent,
        importStudents,
        importStudentsExcel,
        isAddingStudent,
        isRemovingStudent,
        isImportingStudents,
        isImportingStudentsExcel,
    } = useCourseStudents(courseId);

    const [addForm] = Form.useForm();
    const [jsonForm] = Form.useForm();
    const [excelFile, setExcelFile] = useState(null);

    const tableData = useMemo(() => {
        return (students || []).map((item) => {
            const student = item.student || item;
            return {
                key: `${item._id || student._id}`,
                studentId: student._id,
                fullName: student.fullName || '---',
                userCode: student.userCode || '---',
                email: student.email || '---',
                className: student.className || '---',
            };
        });
    }, [students]);

    const handleAddStudent = (values) => {
        addStudent(values.studentId, {
            onSuccess: () => {
                message.success('Thêm sinh viên vào lớp thành công');
                addForm.resetFields();
            },
            onError: (err) => {
                message.error(err?.message || 'Không thể thêm sinh viên');
            },
        });
    };

    const handleRemoveStudent = (studentId) => {
        removeStudent(studentId, {
            onSuccess: () => {
                message.success('Xóa sinh viên khỏi lớp thành công');
            },
            onError: (err) => {
                message.error(err?.message || 'Không thể xóa sinh viên');
            },
        });
    };

    const handleImportJson = (values) => {
        try {
            const studentIds = parseStudentIdsFromInput(values.studentIds);

            if (!studentIds.length) {
                message.warning('Vui lòng nhập ít nhất 1 ID sinh viên');
                return;
            }

            importStudents(studentIds, {
                onSuccess: (res) => {
                    message.success(res?.message || 'Import JSON thành công');
                    jsonForm.resetFields();
                },
                onError: (err) => {
                    message.error(err?.message || 'Import JSON thất bại');
                },
            });
        } catch (error) {
            message.error(error?.message || 'Dữ liệu JSON không hợp lệ');
        }
    };

    const handleImportExcel = () => {
        if (!excelFile) {
            message.warning('Vui lòng chọn file Excel');
            return;
        }

        importStudentsExcel(excelFile, {
            onSuccess: (res) => {
                message.success(res?.message || 'Import Excel thành công');
                setExcelFile(null);
            },
            onError: (err) => {
                message.error(err?.message || 'Import Excel thất bại');
            },
        });
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Mã sinh viên',
            dataIndex: 'userCode',
            key: 'userCode',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Lớp hành chính',
            dataIndex: 'className',
            key: 'className',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Popconfirm
                    title="Xóa sinh viên khỏi lớp?"
                    onConfirm={() => handleRemoveStudent(record.studentId)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, loading: isRemovingStudent }}
                >
                    <Button danger icon={<DeleteOutlined />} type="text" />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className={styles.attendanceWrap}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>Quản lý sinh viên lớp</div>
                </div>

                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Form
                        form={addForm}
                        layout="inline"
                        onFinish={handleAddStudent}
                        className={styles.studentManageAddForm}
                    >
                        <Form.Item
                            name="studentId"
                            rules={[{ required: true, message: 'Nhập ID sinh viên' }]}
                            className={styles.studentManageAddInput}
                        >
                            <Input placeholder="Nhập studentId để thêm vào lớp" />
                        </Form.Item>
                        <Form.Item className={styles.studentManageAddAction}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isAddingStudent}
                                className={styles.studentManagePrimaryBtn}
                            >
                                Thêm sinh viên
                            </Button>
                        </Form.Item>
                    </Form>

                    <Form form={jsonForm} layout="vertical" onFinish={handleImportJson}>
                        <Form.Item
                            name="studentIds"
                            label="Import JSON (mảng studentId hoặc danh sách cách nhau bởi dấu phẩy/dòng mới)"
                            rules={[{ required: true, message: 'Vui lòng nhập danh sách studentId' }]}
                            style={{ marginBottom: 12 }}
                        >
                            <TextArea rows={4} placeholder='Ví dụ: ["id1", "id2"] hoặc id1, id2' />
                        </Form.Item>
                        <Button
                            htmlType="submit"
                            icon={<UploadOutlined />}
                            loading={isImportingStudents}
                            className={styles.studentManagePrimaryBtn}
                        >
                            Import JSON
                        </Button>
                    </Form>

                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Upload.Dragger
                            beforeUpload={(file) => {
                                setExcelFile(file);
                                return false;
                            }}
                            onRemove={() => {
                                setExcelFile(null);
                            }}
                            fileList={excelFile ? [excelFile] : []}
                            maxCount={1}
                            accept=".xlsx,.xls"
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Chọn file Excel để import sinh viên</p>
                            <p className="ant-upload-hint">Hỗ trợ .xlsx, .xls</p>
                        </Upload.Dragger>
                        <Button
                            onClick={handleImportExcel}
                            loading={isImportingStudentsExcel}
                            className={styles.studentManagePrimaryBtn}
                        >
                            Import Excel
                        </Button>
                    </Space>
                </Space>
            </div>

            <div className={`${styles.card} ${styles.attendanceTable}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>Danh sách sinh viên ({tableData.length})</div>
                </div>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    loading={isLoadingStudents}
                    rowKey="key"
                    scroll={{ x: 900 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                    }}
                />
            </div>
        </div>
    );
};

export default StudentManagementTab;
