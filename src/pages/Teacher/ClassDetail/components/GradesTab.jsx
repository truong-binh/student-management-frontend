import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, InputNumber, Tag, message, Typography, Tooltip } from 'antd';
import { SettingOutlined, SaveOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useCourseStudents } from '@/hooks/useCourseStudent';
import { useStudentGrade, useGradeConfig } from '@/hooks/useGrade';
import { useCourseDetail } from '@/hooks/useCourse';
import styles from '../styles.module.scss';

const { Text } = Typography;

const GradesTab = ({ courseId }) => {
    const { data: course, isLoading: isCourseLoading } = useCourseDetail(courseId);
    const { data: studentsData, isLoading: isStudentsLoading } = useCourseStudents(courseId);
    const { updateConfig, isUpdating: isUpdatingConfig } = useGradeConfig(courseId);
    
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isEditGradeModalOpen, setIsEditGradeModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [gradeForm] = Form.useForm();
    const [configForm] = Form.useForm();

    const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || studentsData?.items || []);
    const gradeComponents = course?.gradeComponents || [];

    const openConfigModal = () => {
        configForm.setFieldsValue({
            gradeComponents: gradeComponents
        });
        setIsConfigModalOpen(true);
    };

    const handleConfigSubmit = async (values) => {
        const totalWeight = values.gradeComponents.reduce((acc, curr) => acc + (curr.weight || 0), 0);
        if (totalWeight !== 100) {
            message.error(`Tổng hệ số phải bằng 100%. Hiện tại là ${totalWeight}%`);
            return;
        }

        try {
            await updateConfig({ gradeComponents: values.gradeComponents });
            message.success('Cập nhật cấu trúc điểm thành công');
            setIsConfigModalOpen(false);
        } catch (error) {
            message.error(error?.message || 'Cập nhật thất bại');
        }
    };

    const openEditGradeModal = (student, component) => {
        setSelectedStudent(student);
        setSelectedComponent(component);
        gradeForm.setFieldsValue({ score: student.grades?.[component.type] || student.grades?.[component._id] || 0 });
        setIsEditGradeModalOpen(true);
    };

    const columns = [
        {
            title: 'Mã SV',
            dataIndex: 'userCode',
            key: 'userCode',
            fixed: 'left',
            width: 120,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            fixed: 'left',
            width: 200,
        },
        ...gradeComponents.filter(c => c.isMandatory).map(comp => ({
            title: `${comp.name} (${comp.weight}%)`,
            key: comp.type || comp._id,
            render: (student) => {
                const score = student.grades?.[comp.type] || student.grades?.[comp._id];
                return (
                    <Space>
                        <Text strong={comp.type === 'FINAL_EXAM'}>{score !== undefined ? score : '-'}</Text>
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EditOutlined />} 
                            onClick={() => openEditGradeModal(student, comp)}
                        />
                    </Space>
                );
            }
        })),
        {
            title: 'Điểm tổng kết',
            key: 'finalScore',
            fixed: 'right',
            width: 120,
            render: (student) => {
                return <Tag color="blue" style={{ fontSize: '14px' }}>{student.finalScore || '-'}</Tag>;
            }
        }
    ];

    return (
        <div className={styles.gradesTab}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Quản lý điểm thành phần và điểm tổng kết của lớp học.</Text>
                <Button icon={<SettingOutlined />} onClick={openConfigModal}>Cấu trúc điểm</Button>
            </div>

            <Table
                columns={columns}
                dataSource={students}
                rowKey="_id"
                loading={isCourseLoading || isStudentsLoading}
                scroll={{ x: 1000 }}
                pagination={false}
            />

            <Modal
                title="Cấu trúc điểm học phần"
                open={isConfigModalOpen}
                onCancel={() => setIsConfigModalOpen(false)}
                onOk={() => configForm.submit()}
                width={700}
                confirmLoading={isUpdatingConfig}
            >
                <Form
                    form={configForm}
                    layout="vertical"
                    onFinish={handleConfigSubmit}
                >
                    <Form.List name="gradeComponents">
                        {(fields) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            rules={[{ required: true, message: 'Tên đầu điểm' }]}
                                        >
                                            <Input placeholder="Tên đầu điểm" style={{ width: 250 }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'weight']}
                                            rules={[{ required: true, message: '%' }]}
                                        >
                                            <InputNumber min={0} max={100} placeholder="%" addonAfter="%" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'isMandatory']}
                                            valuePropName="checked"
                                        >
                                            <Tag color={configForm.getFieldValue(['gradeComponents', name, 'isMandatory']) ? 'green' : 'default'}>
                                                {configForm.getFieldValue(['gradeComponents', name, 'isMandatory']) ? 'Bắt buộc' : 'Tùy chọn'}
                                            </Tag>
                                        </Form.Item>
                                    </Space>
                                ))}
                            </>
                        )}
                    </Form.List>
                    <Text type="warning">Lưu ý: Tổng hệ số các đầu điểm phải bằng 100%.</Text>
                </Form>
            </Modal>

            {selectedStudent && selectedComponent && (
                <EditGradeModal
                    visible={isEditGradeModalOpen}
                    onCancel={() => setIsEditGradeModalOpen(false)}
                    courseId={courseId}
                    student={selectedStudent}
                    component={selectedComponent}
                />
            )}
        </div>
    );
};

const EditGradeModal = ({ visible, onCancel, courseId, student, component }) => {
    const { updateComponentGrade, updateFinalGrade, isUpdatingComponent, isUpdatingFinal } = useStudentGrade(courseId, student._id);
    const [score, setScore] = useState(student.grades?.[component.type] || student.grades?.[component._id] || 0);

    const handleSave = async () => {
        try {
            if (component.type === 'FINAL_EXAM') {
                await updateFinalGrade(score);
            } else {
                await updateComponentGrade({ componentId: component._id || component.type, score });
            }
            message.success('Cập nhật điểm thành công');
            onCancel();
        } catch (error) {
            message.error(error?.message || 'Cập nhật thất bại');
        }
    };

    return (
        <Modal
            title={`Nhập điểm: ${component.name}`}
            open={visible}
            onCancel={onCancel}
            onOk={handleSave}
            confirmLoading={isUpdatingComponent || isUpdatingFinal}
        >
            <div style={{ marginBottom: 16 }}>
                <Text>Sinh viên: </Text><Text strong>{student.fullName} ({student.userCode})</Text>
            </div>
            <Form layout="vertical">
                <Form.Item label="Điểm số (0-10)">
                    <InputNumber 
                        min={0} 
                        max={10} 
                        step={0.1} 
                        value={score} 
                        onChange={setScore} 
                        style={{ width: '100%' }}
                        autoFocus
                    />
                </Form.Item>
            </Form>
            {component.type === 'FINAL_EXAM' && (
                <Text type="danger"><LockOutlined /> Nhập điểm cuối kỳ sẽ đóng băng các điểm thành phần khác của sinh viên này.</Text>
            )}
        </Modal>
    );
};

export default GradesTab;
