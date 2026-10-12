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
    EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import { getFilePresentation, getFileNameFromUrl } from '@/utils/filePresentation';

import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useAssignmentSubmissions, useSubmissionDetail } from '@/hooks/useSubmission';
import { useCourseStudents } from '@/hooks/useCourseStudent';
import { Modal, Form, DatePicker, message, Popconfirm, Spin } from 'antd';
import dayjs from 'dayjs';
import styles from '../styles.module.scss';

const PAGE_SIZE = 10;

const STUDENT_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'submitted', label: 'Đã nộp' },
    { key: 'missing', label: 'Chưa nộp' },
    { key: 'feedback', label: 'Phản hồI', hasDot: true },
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
    const { id: courseId } = useParams();
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
        isSubmissionsLoading,
    } = useAssignmentSubmissions(assignmentId);

    // Fetch all students in course to compare with submissions
    const { data: courseStudentsData, isLoading: isStudentsLoading } = useCourseStudents(courseId, { limit: 1000 });
    const courseStudents = (Array.isArray(courseStudentsData) ? courseStudentsData : courseStudentsData?.items || []).filter(item => !!item.student);

    const displayData = detailData || assignment.original;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [form] = Form.useForm();
    const [editFile, setEditFile] = useState(null);

    const [studentFilter, setStudentFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const groupCode = classInfo.groupCode || classInfo.code || 'TH036';
    const classTitle = classInfo.title || 'LỚP TEST';
    const semester = classInfo.semester || 'Học kỳ 1 - 2026';

    const mappedSubmissions = submissions.map((sub, i) => {
        const studentInfo = sub.student;
        const hasFeedback = sub.feedbackStatus && sub.feedbackStatus !== 'NONE';
        const isPending = sub.feedbackStatus === 'PENDING';

        return {
            id: sub.id || sub._id,
            studentId: studentInfo?.id || studentInfo?._id,
            name: studentInfo?.fullName || 'Không rõ',
            initials: getInitials(studentInfo?.fullName),
            color: COLORS[i % COLORS.length],
            msv: studentInfo?.userCode || 'N/A',
            status: hasFeedback ? 'feedback' : (sub.status === 'GRADED' ? 'graded' : 'submitted'),
            hasFeedback,
            isPending,
            feedbackContent: sub.studentFeedback?.content,
            score: sub.score,
            fileUrl: sub.fileUrl,
            createdAt: sub.createdAt
        };
    });

    // Determine who hasn't submitted by comparing course students and submissions
    const submittedStudentIds = new Set(mappedSubmissions.map(s => String(s.studentId)));
    
    const mappedNotSubmitted = courseStudents
        .filter(enrollment => !submittedStudentIds.has(String(enrollment.student?._id || enrollment.student?.id)))
        .map((enrollment, i) => {
            const stu = enrollment.student;
            return {
                id: `not-sub-${stu._id || stu.id}`,
                studentId: stu._id || stu.id,
                name: stu.fullName || 'Không rõ',
                initials: getInitials(stu.fullName),
                color: COLORS[(mappedSubmissions.length + i) % COLORS.length],
                msv: stu.userCode || 'N/A',
                status: 'missing',
                hasFeedback: false,
                score: null,
                fileUrl: null
            };
        });

    const allStudents = [...mappedSubmissions, ...mappedNotSubmitted];

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    const feedbackCount = allStudents.filter(s => s.hasFeedback).length;

    const filtered = allStudents.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.msv.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        
        if (studentFilter === 'all') return true;
        if (studentFilter === 'feedback') return s.hasFeedback;
        if (studentFilter === 'submitted') return (s.status === 'submitted' || s.status === 'graded' || s.status === 'feedback');
        return s.status === studentFilter;
    });

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const statusBadge = (s) => {
        if (s.isPending) return <span className={`${styles.stBadge} ${styles.stFeedback}`}>ĐANG KHIẾU NẠI</span>;
        if (s.status === 'RESOLVED' || s.status === 'feedback') {
            return <span className={`${styles.stBadge} ${styles.stGraded}`}>Đã giải quyết</span>;
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

    if (isLoading || isSubmissionsLoading || isStudentsLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#64748b' }}>Đang tải dữ liệu bài tập...</div>
            </div>
        );
    }

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
                        <TeamOutlined /> Sĩ số: {allStudents.length} Sinh viên
                    </span>
                </div>

                <div className={styles.adDesc}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>
                        {displayData.description || 'Không có mô tả'}
                    </p>

                    {displayData.fileUrl && (
                        <div className={styles.fileList} style={{ marginTop: 24 }}>
                            {(() => {
                                const fileName = getFileNameFromUrl(displayData.fileUrl);
                                const pres = getFilePresentation(fileName);
                                return (
                                    <div className={styles.fileItem} style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <div className={styles.fileInfo}>
                                            <div className={styles.fileIcon} style={{ background: pres.iconBg, color: pres.iconColor }}>
                                                {pres.icon}
                                            </div>
                                            <div className={styles.fileMeta}>
                                                <div className={styles.fileName}>{fileName}</div>
                                                <div className={styles.fileSize}>
                                                    {(fileName.split('.').pop() || 'file').toUpperCase()} • Tài liệu tham khảo / Yêu cầu đề bài
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Button
                                                icon={<EyeOutlined />}
                                                size="small"
                                                onClick={() => setPreviewOpen(true)}
                                                style={{ border: 'none', background: 'transparent', color: '#64748b' }}
                                            />
                                            <DownloadOutlined
                                                className={styles.downloadBtn}
                                                onClick={() => window.open(displayData.fileUrl, '_blank')}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.adTableCard}>
                <div className={styles.adTableHeader}>
                    <div className={styles.adStudentFilters}>
                        {STUDENT_FILTERS.map(f => {
                            let count = 0;
                            if (f.key === 'all') count = allStudents.length;
                            else if (f.key === 'submitted') count = allStudents.filter(s => s.status === 'submitted' || s.status === 'graded' || s.status === 'feedback').length;
                            else if (f.key === 'missing') count = allStudents.filter(s => s.status === 'missing').length;
                            else if (f.key === 'feedback') count = feedbackCount;

                            return (
                                <button
                                    key={f.key}
                                    className={`${styles.adFilterBtn} ${studentFilter === f.key ? styles.adFilterBtnActive : ''}`}
                                    onClick={() => { setStudentFilter(f.key); setCurrentPage(1); }}
                                >
                                    {f.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm kiếm sinh viên..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        className={styles.adSearchInput}
                    />
                </div>

                <div className={styles.adTableScroll}>
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
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<DownloadOutlined style={{ fontSize: 20 }} />}
                                                style={{ color: '#b71c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                                                onClick={() => window.open(s.fileUrl, '_blank')}
                                                title="Tải xuống bài làm"
                                            />
                                        ) : (
                                            <span style={{ color: '#cbd5e0' }}>—</span>
                                        )}
                                    </td>
                                    <td className={styles.adActionCell}>
                                        {s.status !== 'missing' ? (
                                            <>
                                                <Button
                                                    size="small"
                                                    type={s.status === 'graded' ? 'default' : 'primary'}
                                                    danger={s.status === 'graded'}
                                                    icon={<EditOutlined />}
                                                    className={styles.adGradeBtn}
                                                    onClick={() => navigate(`/teacher/classes/${courseId}/assignments/${assignmentId}/grade-edit/${s.id}`)}
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
                                            </>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
                        <Input.TextArea className={styles.pinkInput} />
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
