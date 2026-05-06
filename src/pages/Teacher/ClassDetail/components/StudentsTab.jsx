import React, { useState } from 'react';
import { Table, Button, Input, Modal, Upload, message, Popconfirm, Space } from 'antd';
import { UserAddOutlined, UploadOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useCourseStudents } from '@/hooks/useCourseStudent';
import { courseApi } from '@/api/admin/course';
import * as XLSX from 'xlsx-js-style';
import styles from '../styles.module.scss';

const EXPORT_COLUMNS = [
    'Mã SV',
    'Họ và tên',
    'email',
    'thời gian tham gia',
    'Trạng thái thi',
    'Chuyên cần',
    'Bài tập, thảo luận',
    'Điểm giữa kỳ',
    'Điểm cuối kỳ',
];

const EXPORT_COLUMN_WIDTHS = [14, 26, 32, 22, 16, 14, 20, 14, 14];
const EXPORT_COLUMN_ALIGNMENTS = ['center', 'left', 'left', 'center', 'center', 'center', 'center', 'center', 'center'];

const BASE_BORDER = {
    top: { style: 'thin', color: { rgb: 'D9D9D9' } },
    right: { style: 'thin', color: { rgb: 'D9D9D9' } },
    bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
    left: { style: 'thin', color: { rgb: 'D9D9D9' } },
};

const getCellStyle = (isHeader, horizontalAlign) => ({
    font: {
        name: 'Calibri',
        sz: 11,
        bold: isHeader,
        color: { rgb: isHeader ? 'FFFFFF' : '1F2937' },
    },
    fill: {
        patternType: 'solid',
        fgColor: { rgb: isHeader ? 'B71C1C' : 'FFFFFF' },
    },
    alignment: {
        horizontal: horizontalAlign,
        vertical: 'center',
        wrapText: true,
    },
    border: BASE_BORDER,
});

const sanitizeFilePart = (value = '') => {
    return String(value)
        .replace(/[\\/:*?"<>|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const formatJoinedAtForExport = (joinedAt) => {
    if (!joinedAt) return '';
    return new Date(joinedAt).toLocaleString('vi-VN');
};

const StudentsTab = ({ courseId, courseCode, courseName }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [isExportingExcel, setIsExportingExcel] = useState(false);

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

    const students = (Array.isArray(data) ? data : (data?.items || [])).filter(item => !!item.student);
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
            message.warning('Vui lòng nhập mã sinh viên');
            return;
        }
        try {
            await addStudent({ userCode: newStudentId });
            message.success('Thêm sinh viên thành công');
            setIsAddModalVisible(false);
            setNewStudentId('');
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi thêm sinh viên');
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await removeStudent(studentId);
            message.success('Xóa sinh viên thành công');
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi xóa sinh viên');
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
            message.error(error.message || 'Import thất bại');
            onError(error);
        }
    };

    const handleExportExcel = async () => {
        if (!courseId) {
            message.error('Không xác định được lớp học để xuất dữ liệu');
            return;
        }

        setIsExportingExcel(true);

        try {
            const response = await courseApi.getCourseStudents(courseId, {
                page: 1,
                limit: 10000,
                search: '',
            });

            if (!response?.success) {
                throw response;
            }

            const allStudents = (Array.isArray(response.data) ? response.data : (response.data?.items || []))
                .filter((item) => item?.student);

            const excelRows = allStudents.map((item) => ([
                item.student?.userCode || '',
                item.student?.fullName || '',
                item.student?.email || '',
                formatJoinedAtForExport(item.joinedAt),
                '',
                '',
                '',
                '',
                '',
            ]));

            const sheetData = [EXPORT_COLUMNS, ...excelRows];
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

            worksheet['!cols'] = EXPORT_COLUMN_WIDTHS.map((width) => ({ wch: width }));
            worksheet['!rows'] = sheetData.map((_, rowIndex) => ({ hpt: rowIndex === 0 ? 24 : 20 }));

            for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex += 1) {
                for (let colIndex = 0; colIndex < EXPORT_COLUMNS.length; colIndex += 1) {
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                    const cell = worksheet[cellAddress];
                    if (!cell) continue;

                    const isHeader = rowIndex === 0;
                    const horizontalAlign = EXPORT_COLUMN_ALIGNMENTS[colIndex] || 'left';
                    cell.s = getCellStyle(isHeader, horizontalAlign);
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sach sinh vien');

            const safeCourseCode = sanitizeFilePart(courseCode || courseId || 'MON_HOC');
            const safeCourseName = sanitizeFilePart(courseName || 'Khong xac dinh');
            const fileName = `${safeCourseCode} - ${safeCourseName} - DANH SÁCH SINH VIÊN.xlsx`;

            XLSX.writeFile(workbook, fileName);
            message.success(`Xuất danh sách sinh viên thành công (${allStudents.length} sinh viên)`);
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi xuất file Excel');
        } finally {
            setIsExportingExcel(false);
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
                    <Button
                        icon={<DownloadOutlined />}
                        loading={isExportingExcel}
                        onClick={handleExportExcel}
                    >
                        Export Excel
                    </Button>
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
                    Nhập mã sinh viên của sinh viên để thêm vào lớp học phần này:
                </div>
                <Input
                    placeholder="Nhập mã sinh viên (Ví dụ: B23DCCC007)"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    onPressEnter={handleAddStudent}
                />
            </Modal>
        </div>
    );
};

export default StudentsTab;
