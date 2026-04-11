import React, { useState } from 'react';
import { Button, Input, DatePicker, Form } from 'antd';
import { FileOutlined, ToolOutlined, StarOutlined, CalendarOutlined, EyeOutlined, UnorderedListOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.scss';
import { useCourseAssignments } from '@/hooks/useCourseAssignment';

const CreateAssignmentTab = ({ classInfo = {}, courseId }) => {
    const [form] = Form.useForm();
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const { createAssignment, isCreating } = useCourseAssignments(courseId);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) {
            setFile(f);
            setFileName(f.name);
        }
    };

    const handleFileInput = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setFileName(f.name);
        }
    };

    const resetCreateForm = () => {
        setSuccess(null);
        form.resetFields();
        setFile(null);
        setFileName(null);
    };

    const handleFinish = async (values) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            if (values.description) formData.append('description', values.description);
            formData.append('maxScore', values.maxScore);

            if (values.deadline) {
                formData.append('dueDate', values.deadline.toISOString());
            }

            if (file) {
                formData.append('file', file);
            }

            const createdResponse = await createAssignment(formData);
            const createdAssignment = createdResponse?.data || {};
            const createdAssignmentId = createdAssignment._id || createdAssignment.id || null;

            setSuccess({
                title: createdAssignment.title || values.title || 'Bài tập mới',
                id: createdAssignmentId,
            });
        } catch (error) {
            // error is handled by the API interceptor or can be handled here
        }
    };

    /* ── Success screen ── */
    if (success) {
        const groupCode = classInfo.groupCode || classInfo.code || 'D21CQCN01-B';
        return (
            <div className={styles.successWrap}>
                <div className={styles.successCard}>
                    <div className={styles.successIconCircle}>
                        <CheckOutlined className={styles.successCheckIcon} />
                    </div>
                    <h2 className={styles.successTitle}>Tạo bài tập thành công!</h2>
                    <p className={styles.successDesc}>
                        Bài tập <span className={styles.successHighlight}>{success?.title}</span> đã được đăng tải
                        và thông báo đến toàn bộ sinh viên trong lớp{' '}
                        <span className={styles.successHighlight}>{groupCode}</span>.
                    </p>
                    <div className={styles.successActions}>
                        <Button
                            size="large"
                            icon={<EyeOutlined />}
                            className={styles.successBtnOutline}
                            onClick={() => {
                                const assignmentId = success?.id;
                                resetCreateForm();

                                if (assignmentId) {
                                    navigate(`?tab=assignments&assignmentId=${assignmentId}`);
                                    return;
                                }

                                navigate('?tab=assignments');
                            }}
                        >
                            Xem chi tiết
                        </Button>
                        <Button
                            type="primary"
                            danger
                            size="large"
                            icon={<UnorderedListOutlined />}
                            className={styles.successBtnFill}
                            onClick={() => {
                                resetCreateForm();
                                navigate('?tab=assignments');
                            }}
                        >
                            Về danh sách bài tập
                        </Button>
                    </div>
                    <p className={styles.successFooter}>
                        Hệ thống đã gửi thông báo tới sinh viên lớp {groupCode}.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.createAssignmentWrap}>
            {/* Header */}
            <div className={styles.createHeader}>
                <h2 className={styles.createTitle}>Tạo bài tập mới</h2>
                <p className={styles.createSubtitle}>
                    Điền thông tin chi tiết để giao nhiệm vụ cho sinh viên trong lớp học.
                </p>
            </div>

            <Form form={form} layout="vertical" className={styles.createForm} onFinish={handleFinish}>
                {/* Tên bài tập */}
                <Form.Item
                    label={<span className={styles.fieldLabel}>Tên bài tập</span>}
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}
                >
                    <Input
                        size="large"
                        className={styles.pinkInput}
                        placeholder="Ví dụ: Bài tập thực hành số 1: Xây dựng lớp đa giác"
                    />
                </Form.Item>

                {/* Thông tin bài tập */}
                <Form.Item
                    label={<span className={styles.fieldLabel}>Thông tin bài tập</span>}
                    name="description"
                >
                    <Input.TextArea
                        rows={12}
                        className={styles.pinkInput}
                        placeholder="Mô tả chi tiết yêu cầu bài tập..."
                    />
                </Form.Item>

                {/* Deadline + Max score */}
                <div className={styles.formRow}>
                    <Form.Item
                        label={
                            <span className={styles.fieldLabel}>
                                <CalendarOutlined className={styles.fieldIcon} /> Cài đặt hạn nộp bài
                            </span>
                        }
                        name="deadline"
                        rules={[{ required: true, message: 'Vui lòng chọn hạn nộp bài' }]}
                    >
                        <DatePicker
                            showTime
                            size="large"
                            style={{ width: '100%' }}
                            className={styles.pinkInput}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span className={styles.fieldLabel}>
                                <StarOutlined className={styles.fieldIcon} /> Điểm tối đa
                            </span>
                        }
                        name="maxScore"
                        initialValue={10}
                    >
                        <Input
                            size="large"
                            className={styles.pinkInput}
                            placeholder="10"
                            type="number"
                            min={0}
                            max={100}
                        />
                    </Form.Item>
                </div>

                {/* File upload */}
                <Form.Item
                    label={<span className={styles.fieldLabel}>File bài tập</span>}
                >
                    <div
                        className={`${styles.uploadArea2} ${dragging ? styles.uploadDragging : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('create-file-input').click()}
                    >
                        <input
                            id="create-file-input"
                            type="file"
                            accept=".pdf,.docx,.zip"
                            style={{ display: 'none' }}
                            onChange={handleFileInput}
                        />
                        <div className={styles.uploadIconCircle}>
                            <FileOutlined className={styles.uploadFileIcon} />
                        </div>
                        <div className={styles.uploadContent}>
                            {fileName ? (
                                <p className={styles.uploadFileName}>{fileName}</p>
                            ) : (
                                <>
                                    <p className={styles.uploadMainText}>Nhấp để tải lên hoặc kéo thả file vào đây</p>
                                    <p className={styles.uploadHint2}>Hỗ trợ PDF, DOCX, ZIP (Tối đa 25MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                </Form.Item>

                {/* Submit */}
                <div className={styles.createFormFooter}>
                    <Button
                        type="primary"
                        danger
                        size="large"
                        icon={<ToolOutlined />}
                        className={styles.submitBtn}
                        htmlType="submit"
                        loading={isCreating}
                    >
                        Tạo bài tập
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default CreateAssignmentTab;
