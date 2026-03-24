import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Pagination, Popconfirm, Spin, message } from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    TeamOutlined,
    DownloadOutlined,
    EditOutlined,
    DeleteOutlined,
    DownCircleOutlined,
    MessageOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAssignment } from '@/hooks/useAssignment';
import styles from '../styles.module.scss';

const PAGE_SIZE = 4;

const STUDENT_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'submitted', label: 'Đã nộp' },
    { key: 'missing', label: 'Chưa nộp' },
    { key: 'graded', label: 'Đã chấm' },
    { key: 'feedback', label: 'Phản hồi', hasDot: true },
];

const AVATAR_COLORS = ['#e53e3e', '#d69e2e', '#805ad5', '#3182ce', '#38b2ac', '#ed64a6', '#48bb78', '#f6ad55'];

const getInitials = (name = '') => {
    const words = name.trim().split(' ').filter(Boolean);
    if (!words.length) return 'SV';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const colorById = (id = '') => {
    const value = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[value % AVATAR_COLORS.length];
};

const mapSubmissionStatus = (status) => {
    if (status === 'GRADED') return 'graded';
    if (status === 'SUBMITTED' || status === 'LATE') return 'submitted';
    return 'missing';
};

const AssignmentDetail = ({ assignment, classInfo = {}, onBack, courseId }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [studentFilter, setStudentFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editFile, setEditFile] = useState(null);
    const [form] = Form.useForm();

    const {
        submissions,
        notSubmittedStudents,
        isLoadingSubmissions,
        submissionsError,
        updateAssignment,
        deleteAssignment,
        isUpdatingAssignment,
        isDeletingAssignment,
    } = useAssignment(courseId, assignment?.id || assignment?._id);

    useEffect(() => {
        if (submissionsError) {
            message.error(submissionsError?.message || 'Không thể tải dữ liệu bài nộp');
        }
    }, [submissionsError]);

    const groupCode = classInfo.groupCode || classInfo.code || 'D21CQCN01-B';
    const classTitle = classInfo.title || 'Lập trình hướng đối tượng';
    const semester = classInfo.semester || 'Học kỳ 1 - 2023-2024';

    const allStudents = useMemo(() => {
        const submittedRows = submissions.map((submission) => {
            const student = submission.student || {};
            const studentId = student._id || submission.student;

            return {
                id: studentId,
                submissionId: submission._id,
                name: student.fullName || 'Sinh viên',
                initials: getInitials(student.fullName),
                color: colorById(studentId),
                msv: student.userCode || student.studentCode || '—',
                status: mapSubmissionStatus(submission.status),
                hasFeedback: Boolean(submission.aiFeedback),
                score: typeof submission.score === 'number' ? submission.score : null,
                fileUrl: submission.fileUrl,
            };
        });

        const missingRows = notSubmittedStudents.map((student) => ({
            id: student._id,
            submissionId: null,
            name: student.fullName || 'Sinh viên',
            initials: getInitials(student.fullName),
            color: colorById(student._id),
            msv: student.userCode || student.studentCode || '—',
            status: 'missing',
            hasFeedback: false,
            score: null,
            fileUrl: null,
        }));

        return [...submittedRows, ...missingRows];
    }, [notSubmittedStudents, submissions]);

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

    const handleOpenEdit = () => {
        form.setFieldsValue({
            title: assignment?.title || '',
            description: assignment?.description || '',
            maxScore: assignment?.maxScore || 10,
            deadline: assignment?.dueDate ? dayjs(assignment.dueDate) : undefined,
        });
        setEditFile(null);
        setIsEditOpen(true);
    };

    const handleUpdateAssignment = (values) => {
        const formData = new FormData();
        formData.append('title', values.title || '');
        formData.append('description', values.description || '');
        formData.append('maxScore', values.maxScore || 10);
        if (values.deadline) {
            formData.append('dueDate', values.deadline.toISOString());
        }
        if (editFile) {
            formData.append('file', editFile);
        }

        updateAssignment(assignment?.id || assignment?._id, formData, {
            onSuccess: () => {
                message.success('Cập nhật bài tập thành công');
                setIsEditOpen(false);
            },
            onError: (err) => {
                message.error(err?.message || 'Cập nhật bài tập thất bại');
            },
        });
    };

    const handleDeleteAssignment = () => {
        deleteAssignment(assignment?.id || assignment?._id, {
            onSuccess: () => {
                message.success('Xóa bài tập thành công');
                onBack?.();
            },
            onError: (err) => {
                message.error(err?.message || 'Xóa bài tập thất bại');
            },
        });
    };

    const statusBadge = (s) => {
        if (s.status === 'graded') return <span className={`${styles.stBadge} ${styles.stGraded}`}>ĐÃ CHẤM</span>;
        if (s.status === 'submitted') return <span className={`${styles.stBadge} ${styles.stSubmitted}`}>ĐÃ NỘP</span>;
        return <span className={`${styles.stBadge} ${styles.stMissing}`}>CHƯA NỘP</span>;
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
                        <Button
                            type="primary"
                            danger
                            icon={<DownloadOutlined />}
                            className={styles.adDownloadBtn}
                            disabled={!assignment?.fileUrl}
                            onClick={() => assignment?.fileUrl && window.open(assignment.fileUrl, '_blank')}
                        >
                            Tải file đề bài (.docx)
                        </Button>
                        <Button icon={<EditOutlined />} className={styles.adEditBtn} onClick={handleOpenEdit}>
                            Chỉnh sửa đề bài
                        </Button>
                        <Popconfirm
                            title="Xóa bài tập"
                            description="Bạn có chắc chắn muốn xóa bài tập này?"
                            onConfirm={handleDeleteAssignment}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true, loading: isDeletingAssignment }}
                        >
                            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                        </Popconfirm>
                    </div>
                </div>

                <div className={styles.adTitleRow}>
                    <h2 className={styles.adTitle}>{assignment.title}</h2>
                    <span className={styles.adStatusBadge}>• {assignment.status || 'Đang mở'}</span>
                </div>
                <div className={styles.adInfoRow}>
                    <span className={styles.adInfoItem}>
                        <CalendarOutlined /> Hạn nộp: {assignment.deadline || assignment.dueDateFormatted}
                    </span>
                    <span className={styles.adInfoItem}>
                        <TeamOutlined /> Sĩ số: {allStudents.length} Sinh viên
                    </span>
                </div>

                <div className={styles.adDesc}>
                    {assignment?.description ? (
                        <p>{assignment.description}</p>
                    ) : (
                        <p>Chưa có mô tả cho bài tập này.</p>
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
                        {isLoadingSubmissions && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                                    <Spin tip="Đang tải bài nộp..." />
                                </td>
                            </tr>
                        )}

                        {!isLoadingSubmissions && paginated.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                                    Không có dữ liệu sinh viên
                                </td>
                            </tr>
                        )}

                        {paginated.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div className={styles.adStudentName}>
                                        <span className={styles.adAvatar} style={{ background: s.color }}>
                                            {s.initials}
                                        </span>
                                        {s.name}
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
                                    {s.status !== 'missing' && s.fileUrl ? (
                                        <DownCircleOutlined className={styles.adDownIcon} onClick={() => window.open(s.fileUrl, '_blank')} />
                                    ) : (
                                        <span className={styles.adNoFile}>○</span>
                                    )}
                                </td>
                                <td>
                                    {s.status === 'graded' && s.submissionId ? (
                                        <Button
                                            size="small"
                                            type="primary"
                                            danger
                                            icon={<EditOutlined />}
                                            className={styles.adGradeBtn}
                                            onClick={() => navigate(`/teacher/classes/${id}/assignments/${assignment?.id || assignment?._id}/grade-edit/${s.submissionId}`)}
                                        >
                                            SỬA ĐIỂM
                                        </Button>
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
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateAssignment}>
                    <Form.Item name="title" label="Tên bài tập" rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item name="deadline" label="Hạn nộp bài" rules={[{ required: true, message: 'Vui lòng chọn hạn nộp' }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="maxScore" label="Điểm tối đa">
                        <Input type="number" min={1} max={100} />
                    </Form.Item>

                    <Form.Item label="File đính kèm mới (tuỳ chọn)">
                        <Input type="file" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={() => setIsEditOpen(false)}>Hủy</Button>
                        <Button type="primary" danger htmlType="submit" loading={isUpdatingAssignment}>
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AssignmentDetail;
