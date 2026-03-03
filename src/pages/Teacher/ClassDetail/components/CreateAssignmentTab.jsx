import React, { useState } from 'react';
import { Button, Input, DatePicker, Form } from 'antd';
import { FileOutlined, ToolOutlined, StarOutlined, CalendarOutlined, EyeOutlined, UnorderedListOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from '../styles.module.scss';

const CreateAssignmentTab = ({ classInfo = {} }) => {
    const [form] = Form.useForm();
    const [dragging, setDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [success, setSuccess] = useState(null); // holds submitted title
    const navigate = useNavigate();

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setFileName(file.name);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) setFileName(file.name);
    };

    const handleFinish = (values) => {
        setSuccess(values.title || 'Bài tập mới');
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
                        Bài tập <span className={styles.successHighlight}>{success}</span> đã được đăng tải
                        và thông báo đến toàn bộ sinh viên trong lớp{' '}
                        <span className={styles.successHighlight}>{groupCode}</span>.
                    </p>
                    <div className={styles.successActions}>
                        <Button
                            size="large"
                            icon={<EyeOutlined />}
                            className={styles.successBtnOutline}
                        >
                            Xem chi tiết
                        </Button>
                        <Button
                            type="primary"
                            danger
                            size="large"
                            icon={<UnorderedListOutlined />}
                            className={styles.successBtnFill}
                            onClick={() => navigate('/teacher/classes')}
                        >
                            Về lớp học
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
                        rows={5}
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
                        {fileName ? (
                            <p className={styles.uploadFileName}>{fileName}</p>
                        ) : (
                            <>
                                <p className={styles.uploadMainText}>Nhấp để tải lên hoặc kéo thả file vào đây</p>
                                <p className={styles.uploadHint2}>Hỗ trợ PDF, DOCX, ZIP (Tối đa 25MB)</p>
                            </>
                        )}
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
                        onClick={() => form.submit()}
                        htmlType="submit"
                    >
                        Tạo bài tập
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default CreateAssignmentTab;
