import React, { useState } from 'react';
import clsx from 'clsx';
import { Button, Input, Pagination } from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    TeamOutlined,
    DownloadOutlined,
    EditOutlined,
    DownCircleOutlined,
    MessageOutlined,
    SearchOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DeleteOutlined, FileTextOutlined, EyeOutlined, RobotOutlined } from '@ant-design/icons';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useAssignmentSubmissions, useSubmissionDetail } from '@/hooks/useSubmission';
import { Modal, Form, DatePicker, message, Popconfirm, Spin } from 'antd';
import dayjs from 'dayjs';
import styles from '../styles.module.scss';

const PAGE_SIZE = 4;

const STUDENT_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'submitted', label: 'Đã nộp' },
    { key: 'missing', label: 'Chưa nộp' },
    { key: 'graded', label: 'Đã chấm' },
    { key: 'feedback', label: 'Phản hồi', hasDot: true },
];

const COLORS = ['#e53e3e', '#d69e2e', '#805ad5', '#3182ce', '#38b2ac', '#ed64a6', '#48bb78', '#f6ad55', '#c53030', '#5a67d8'];

const getInitials = (name) => {
    if (!name) return 'SV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AssignmentDetail = ({ assignment, classInfo = {}, onBack }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const assignmentId = assignment.original._id || assignment.original.id;

    const {
        assignment: detailData,
        isLoading,
        updateAssignment,
        isUpdating,
        deleteAssignment,
        isDeleting
    } = useAssignmentDetail(assignmentId);

    const {
        submissions,
        notSubmittedStudents,
        isSubmissionsLoading,
        isNotSubmittedLoading
    } = useAssignmentSubmissions(assignmentId);

    const displayData = detailData || assignment.original;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [form] = Form.useForm();
    const [editFile, setEditFile] = useState(null);

    const [studentFilter, setStudentFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const groupCode = classInfo.groupCode || classInfo.code || 'D21CQCN01-B';
    const classTitle = classInfo.title || 'Lập trình hướng đối tượng';
    const semester = classInfo.semester || 'Học kỳ 1 - 2023-2024';

    const mappedSubmissions = submissions.map((sub, i) => {
        const hasFeedback = sub.feedbackStatus && sub.feedbackStatus !== 'NONE';
        const isPending = sub.feedbackStatus === 'PENDING';

        return {
            id: sub.id || sub._id,
            studentId: sub.student?.id || sub.student?._id,
            name: sub.student?.fullName || 'Không rõ',
            initials: getInitials(sub.student?.fullName),
            color: COLORS[i % COLORS.length],
            msv: sub.student?.userCode || 'N/A',
            status: hasFeedback ? 'feedback' : (sub.status === 'GRADED' ? 'graded' : 'submitted'),
            hasFeedback,
            isPending,
            feedbackContent: sub.studentFeedback?.content,
            score: sub.score,
            fileUrl: sub.fileUrl,
            createdAt: sub.createdAt
        };
    });

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    const mappedNotSubmitted = notSubmittedStudents.map((stu, i) => ({
        id: `not-sub-${stu._id || stu.id}`,
        studentId: stu._id || stu.id,
        name: stu.fullName || 'Không rõ',
        initials: getInitials(stu.fullName),
        color: COLORS[(submissions.length + i) % COLORS.length],
        msv: stu.userCode || 'N/A',
        status: 'missing',
        hasFeedback: false,
        score: null,
        fileUrl: null
    }));

    const allStudents = [...mappedSubmissions, ...mappedNotSubmitted];

    const feedbackCount = allStudents.filter(s => s.hasFeedback).length;

    const filtered = allStudents.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.msv.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (studentFilter === 'all') return true;
        if (studentFilter === 'feedback') return s.hasFeedback;
        return s.status === studentFilter;
    });

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const statusBadge = (s) => {
        if (s.isPending) return <span className={`${styles.stBadge} ${styles.stFeedback}`}>ĐANG KHIẾU NẠI</span>;
        if (s.status === 'RESOLVED' || s.status === 'feedback') {
            return <span className={`${styles.stBadge} ${styles.stGraded}`}>ĐÃ GIẢI QUYẾT</span>;
        }
        if (s.status === 'graded') return <span className={`${styles.stBadge} ${styles.stGraded}`}>ĐÃ CHẤM</span>;
        if (s.status === 'submitted') return <span className={`${styles.stBadge} ${styles.stSubmitted}`}>ĐÃ NỘP</span>;
        return <span className={`${styles.stBadge} ${styles.stMissing}`}>CHƯA NỘP</span>;
    };

    const executeDelete = async () => {
        try {
            await deleteAssignment();
            message.success('Xóa bài tập thành công');
            onBack();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
    };

    const { gradeSubmissionByAI } = useSubmissionDetail();

    const handleAIGrade = async (submissionId) => {
        try {
            message.loading({ content: 'AI đang phân tích và chấm điểm...', key: 'ai-grade' });
            await gradeSubmissionByAI(submissionId);
            message.success({ content: 'Chấm điểm bằng AI thành công!', key: 'ai-grade' });
        } catch (error) {
            message.error({ content: error.response?.data?.message || 'Lỗi khi chấm điểm bằng AI', key: 'ai-grade' });
        }
    };

    const handleUpdate = async (values) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            if (values.description) formData.append('description', values.description);
            formData.append('maxScore', values.maxScore || 10);

            if (values.deadline) {
                formData.append('dueDate', values.deadline.toISOString());
            }

            if (editFile) {
                formData.append('file', editFile);
            }

            await updateAssignment(formData);
            message.success('Cập nhật bài tập thành công!');
            setIsEditModalOpen(false);
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const openEditModal = () => {
        form.setFieldsValue({
            title: displayData.title,
            description: displayData.description,
            maxScore: displayData.maxScore,
            deadline: displayData.dueDate ? dayjs(displayData.dueDate) : null,
        });
        setEditFile(null);
        setIsEditModalOpen(true);
    };

    return (
        <div className={styles.adWrap}>
            <button className={styles.adBackBtn} onClick={onBack}>
                <ArrowLeftOutlined /> Quay lại danh sách
            </button>

            <div className={styles.adHeaderCard}>
                <div className={styles.adHeaderTop}>
                    <div className={styles.adMeta}>
                        <span className={styles.adGroupCode}>{groupCode}</span>
                        <span className={styles.adDot}>•</span>
                        <span className={styles.adMetaText}>{classTitle}</span>
                        <span className={styles.adDot}>•</span>
                        <span className={styles.adMetaText}>{semester}</span>
                    </div>
                    <div className={styles.adActions}>
                        <Button icon={<EditOutlined />} onClick={openEditModal} className={styles.adEditBtn}>
                            Sửa
                        </Button>
                        <Popconfirm
                            title={<span style={{ fontWeight: 600, color: '#e53e3e' }}>Xóa bài tập này?</span>}
                            description={
                                <div style={{ maxWidth: 220, color: '#4a5568', marginTop: 4 }}>
                                    Toàn bộ dữ liệu đề bài và bài nộp của sinh viên sẽ bị <strong>mất vĩnh viễn</strong>.
                                </div>
                            }
                            overlayClassName="customPopconfirm"
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true, size: 'middle', style: { borderRadius: 6, fontWeight: 500 } }}
                            cancelButtonProps={{ size: 'middle', style: { borderRadius: 6 } }}
                            onConfirm={executeDelete}
                            placement="bottomRight"
                        >
                            <Button icon={<DeleteOutlined />} danger>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </div>
                </div>

                <div className={styles.adTitleRow}>
                    <h2 className={styles.adTitle}>{displayData.title}</h2>
                    <span className={styles.adStatusBadge}>• {displayData.status || (assignment.status === 'opening' ? 'Đang mở' : 'Quá hạn')}</span>
                </div>
                <div className={styles.adInfoRow}>
                    <span className={styles.adInfoItem}>
                        <CalendarOutlined /> Hạn nộp: {displayData.dueDateFormatted || (displayData.dueDate ? new Date(displayData.dueDate).toLocaleString('vi-VN') : 'Không có')}
                    </span>
                    <span className={styles.adInfoItem}>
                        <StarOutlined /> Điểm tối đa: {displayData.maxScore || 10}
                    </span>
                    <span className={styles.adInfoItem}>
                        <TeamOutlined /> Sĩ số: {classInfo.totalStudents || 45} Sinh viên
                    </span>
                </div>

                <div className={styles.adDesc}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {displayData.description || 'Không có mô tả'}
                    </p>

                    {displayData.fileUrl && (
                        <div style={{ marginTop: 24, padding: '12px 16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, background: '#ebf8ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce', fontSize: 24 }}>
                                <FileTextOutlined />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 400 }}>
                                <span style={{ fontWeight: 600, color: '#2d3748', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {decodeURIComponent(displayData.fileUrl.split('/').pop().split('?')[0]) || 'Tệp đính kèm.pdf'}
                                </span>
                                <span style={{ fontSize: 12, color: '#718096' }}>Tài liệu tham khảo / Yêu cầu đề bài</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => setPreviewOpen(true)}
                                    style={{ borderRadius: 6 }}
                                >
                                    Xem trước
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => window.open(displayData.fileUrl, '_blank')}
                                    style={{ borderRadius: 6, background: '#2b6cb0', borderColor: '#2b6cb0' }}
                                >
                                    Tải xuống
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.adTableCard}>
                <div className={styles.adTableHeader}>
                    <div className={styles.adStudentFilters}>
                        {STUDENT_FILTERS.map(f => (
                            <button
                                key={f.key}
                                className={`${styles.adFilterBtn} ${studentFilter === f.key ? styles.adFilterBtnActive : ''}`}
                                onClick={() => { setStudentFilter(f.key); setCurrentPage(1); }}
                            >
                                {f.label}
                                {f.key === 'all' && ` (${allStudents.length})`}
                                {f.hasDot && feedbackCount > 0 && (
                                    <span className={styles.adFeedbackDot} />
                                )}
                            </button>
                        ))}
                    </div>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm kiếm sinh viên..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        className={styles.adSearchInput}
                    />
                </div>

                <table className={styles.adTable}>
                    <thead>
                        <tr>
                            <th>SINH VIÊN</th>
                            <th>MÃ SV</th>
                            <th>TRẠNG THÁI</th>
                            <th>ĐIỂM</th>
                            <th>BÀI LÀM</th>
                            <th>SỬA ĐIỂM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(s => (
                            <tr
                                key={s.id}
                                className={clsx(s.isPending && styles.adFeedbackRow)}
                                style={s.isPending ? { background: '#fffbeb' } : {}}
                            >
                                <td>
                                    <div className={styles.adStudentName}>
                                        <span className={styles.adAvatar} style={{ background: s.color }}>
                                            {s.initials}
                                        </span>
                                        <div className={styles.adNameCol}>
                                            <div className={styles.adRealName}>{s.name}</div>
                                            {s.hasFeedback && s.feedbackContent && (
                                                <div className={styles.adFeedbackSnippet}>
                                                    <MessageOutlined style={{ fontSize: 11, color: '#d97706' }} /> {truncateText(s.feedbackContent, 40)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.adMsvCell}>{s.msv}</td>
                                <td>
                                    <div className={styles.adStatusCell}>
                                        {statusBadge(s)}
                                        {s.hasFeedback && (
                                            <span className={styles.adFeedbackBadge}>
                                                <MessageOutlined style={{ fontSize: 10 }} /> CÓ PHẢN HỒI
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className={`${styles.adScoreCell} ${s.score ? styles.adScoreValue : ''}`}>
                                    {s.score !== null ? s.score : '—'}
                                </td>
                                <td className={styles.adDownloadCell}>
                                    {s.status !== 'missing' ? (
                                        <DownCircleOutlined
                                            className={styles.adDownIcon}
                                            style={{ cursor: 'pointer', fontSize: 20, color: '#3182ce' }}
                                            onClick={() => window.open(s.fileUrl, '_blank')}
                                            title="Tải bài làm"
                                        />
                                    ) : (
                                        <span className={styles.adNoFile}>○</span>
                                    )}
                                </td>
                                <td>
                                    {s.status !== 'missing' ? (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Button
                                                size="small"
                                                type={s.status === 'graded' ? 'default' : 'primary'}
                                                danger={s.status === 'graded'}
                                                icon={<EditOutlined />}
                                                className={styles.adGradeBtn}
                                                onClick={() => navigate(`/teacher/classes/${id}/assignments/${assignmentId}/grade-edit/${s.id}`)}
                                            >
                                                {s.status === 'graded' ? 'SỬA ĐIỂM' : 'CHẤM ĐIỂM'}
                                            </Button>

                                            {s.fileUrl && s.fileUrl.endsWith('.txt') && (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    style={{ background: '#805ad5', borderColor: '#805ad5', color: '#fff', fontSize: 12 }}
                                                    icon={<RobotOutlined />}
                                                    onClick={() => handleAIGrade(s.id)}
                                                >
                                                    AI Chấm
                                                </Button>
                                            )}
                                        </div>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.adTableFooter}>
                    <span className={styles.adTableInfo}>
                        Hiện thị {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} sinh viên
                    </span>
                    <Pagination
                        current={currentPage}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        showSizeChanger={false}
                        onChange={p => setCurrentPage(p)}
                        size="small"
                    />
                </div>
            </div>

            <Modal
                title="Chỉnh sửa bài tập"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isUpdating}
                width={700}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 20 }}>
                    <Form.Item
                        label="Tên bài tập"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Thông tin bài tập" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item label="Hạn nộp bài" name="deadline" style={{ flex: 1 }}>
                            <DatePicker showTime style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Điểm tối đa" name="maxScore" style={{ flex: 1 }}>
                            <Input type="number" min={0} max={100} />
                        </Form.Item>
                    </div>
                    <Form.Item label="File đính kèm cập nhật (nếu có)">
                        <Input
                            type="file"
                            accept=".pdf,.docx,.zip"
                            onChange={(e) => setEditFile(e.target.files[0])}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Xem trước"
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                width={800}
                centered
                destroyOnClose
            >
                {displayData?.fileUrl && (
                    <iframe
                        src={
                            displayData.fileUrl.match(/\.(png|jpe?g)$/i)
                                ? displayData.fileUrl
                                : `https://docs.google.com/viewer?url=${encodeURIComponent(displayData.fileUrl)}&embedded=true`
                        }
                        width="100%"
                        height="600px"
                        style={{ border: 'none', borderRadius: 8, background: '#f8f9fa' }}
                        title="Document Preview"
                    />
                )}
            </Modal>
        </div>
    );
};

export default AssignmentDetail;
