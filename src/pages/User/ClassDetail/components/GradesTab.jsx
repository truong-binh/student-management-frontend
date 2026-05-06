import React from 'react';
import { Table, Tag, Typography, Spin, Card, Row, Col, Statistic, Empty } from 'antd';
import { CheckCircleOutlined, LockOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useStudentGrade } from '@/hooks/useGrade';
import { useAuth } from '@/hooks/useAuth';
import styles from '../styles.module.scss';

const { Text, Title } = Typography;

const GradesTab = ({ courseId }) => {
    const { user } = useAuth();
    const { gradeData, isLoading, error } = useStudentGrade(courseId, user?._id);

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}><Spin tip="Đang tải bảng điểm..." /></div>;
    }

    if (error || !gradeData) {
        return <Empty description="Chưa có dữ liệu bảng điểm cho học phần này." />;
    }

    const { components, finalScore, status } = gradeData;

    const columns = [
        {
            title: 'Tên đầu điểm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" size="small">{record.type}</Text>
                </Space>
            )
        },
        {
            title: 'Hệ số',
            dataIndex: 'weight',
            key: 'weight',
            render: (weight) => `${weight}%`
        },
        {
            title: 'Điểm số',
            dataIndex: 'score',
            key: 'score',
            render: (score) => (
                <Text strong style={{ fontSize: '16px' }}>
                    {score != null ? score : '-'}
                </Text>
            )
        }
    ];

    const getStatusTag = (status) => {
        switch (status) {
            case 'COMPLETED': return <Tag color="green">Đã hoàn thành</Tag>;
            case 'IN_PROGRESS': return <Tag color="blue">Đang cập nhật</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    return (
        <div className={styles.gradesTab}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false} className={styles.statCard}>
                        <Statistic 
                            title="Điểm tổng kết (Dự tính)" 
                            value={finalScore != null ? finalScore : '-'} 
                            precision={2}
                            valueStyle={{ color: '#3182ce', fontWeight: 700 }}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false} className={styles.statCard}>
                        <Statistic 
                            title="Trạng thái" 
                            value=" "
                            formatter={() => getStatusTag(status)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <div style={{ padding: '16px', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}>
                        <Space align="start">
                            <InfoCircleOutlined style={{ color: '#3182ce', marginTop: 4 }} />
                            <Text size="small" type="secondary">
                                Điểm tổng kết được tính dựa trên hệ số của từng đầu điểm thành phần. 
                                Nếu điểm chuyên cần &lt; 7, bạn sẽ bị cấm thi (điểm cuối kỳ = 0).
                            </Text>
                        </Space>
                    </div>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={components || []}
                rowKey="componentId"
                pagination={false}
                bordered
            />
            
            <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                    <LockOutlined /> Điểm sẽ được khóa sau khi giảng viên nhập điểm cuối kỳ. 
                    Mọi thắc mắc vui lòng liên hệ trực tiếp giảng viên hoặc gửi yêu cầu phúc khảo.
                </Text>
            </div>
        </div>
    );
};

const Space = ({ children, direction = 'horizontal', size = 8, align = 'center', style }) => (
    <div style={{ 
        display: 'flex', 
        flexDirection: direction === 'vertical' ? 'column' : 'row', 
        gap: size,
        alignItems: align,
        ...style 
    }}>
        {children}
    </div>
);

export default GradesTab;
