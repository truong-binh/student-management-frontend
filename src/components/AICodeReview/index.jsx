import React, { useState, useEffect } from 'react';
import { Spin, Tag, Empty } from 'antd';
import {
    RobotOutlined,
    BulbOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    CodeOutlined,
    MessageOutlined
} from '@ant-design/icons';
import styles from './styles.module.scss';
import clsx from 'clsx';

const AICodeReview = ({ fileUrl, errors = [], summary = '' }) => {
    const [codeLines, setCodeLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCode = async () => {
            if (!fileUrl) {
                setLoading(false);
                setError('Không tìm thấy file mã nguồn để hiển thị.');
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error('Không thể tải mã nguồn');
                const text = await response.text();
                setCodeLines(text.split('\n'));
                setError(null);
            } catch (err) {
                console.error('Fetch code error:', err);
                setError('Không thể hiển thị nội dung file. Có thể đây là file nhị phân hoặc đã bị xóa.');
            } finally {
                setLoading(false);
            }
        };

        fetchCode();
    }, [fileUrl]);

    if (loading) return <div className={styles.loadingArea}><Spin tip="Đang đọc mã nguồn..." /></div>;
    if (error) return <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE} />;

    const errorsByLine = errors.reduce((acc, curr) => {
        const line = parseInt(curr.line) || 0;
        if (!acc[line]) acc[line] = [];
        acc[line].push(curr);
        return acc;
    }, {});

    const getSeverity = (err) => {
        const text = (err.issue + ' ' + (err.type || '')).toLowerCase();
        if (text.includes('warning') || text.includes('cảnh báo') || text.includes('nên')) return 'warning';
        if (text.includes('suggestion') || text.includes('gợi ý') || text.includes('tối ưu')) return 'suggestion';
        return 'error';
    };

    return (
        <div className={styles.codeReviewContainer}>
            <div className={styles.reviewHeader}>
                <div className={styles.headerInfo}>
                    <div className={styles.iconCircle}>
                        <RobotOutlined />
                    </div>
                    <div>
                        <h4>Phân tích mã nguồn bởi AI</h4>
                        <div className={styles.statsRow}>
                            <Tag color="blue">{codeLines.length} dòng code</Tag>
                            <Tag color="red">{errors.filter(e => getSeverity(e) === 'error').length} lỗi</Tag>
                            <Tag color="orange">{errors.filter(e => getSeverity(e) === 'warning').length} cảnh báo</Tag>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.codeViewport}>
                <table className={styles.codeTable}>
                    <tbody>
                        {codeLines.map((lineText, index) => {
                            const lineNumber = index + 1;
                            const lineErrors = errorsByLine[lineNumber] || [];
                            const hasErrors = lineErrors.length > 0;

                            return (
                                <React.Fragment key={index}>
                                    <tr className={clsx(
                                        styles.codeRow,
                                        hasErrors && styles.hasErrorHighlight,
                                        hasErrors && styles[getSeverity(lineErrors[0])]
                                    )}>
                                        <td className={styles.lineNum}>
                                            {hasErrors && <div className={styles.errorMarker} />}
                                            {lineNumber}
                                        </td>
                                        <td className={styles.codeCell}>
                                            <pre>{lineText || ' '}</pre>
                                        </td>
                                    </tr>

                                    {lineErrors.map((err, errIdx) => {
                                        const severity = getSeverity(err);
                                        return (
                                            <tr key={`err-${lineNumber}-${errIdx}`} className={styles.commentRow}>
                                                <td className={styles.commentGutter}>
                                                    <div className={clsx(styles.aiAvatar, styles[severity])}>
                                                        <RobotOutlined />
                                                    </div>
                                                </td>
                                                <td className={styles.commentCell}>
                                                    <div className={clsx(styles.commentBox, styles[severity])}>
                                                        <div className={styles.commentHeader}>
                                                            <span className={styles.aiBadge}>Reviewer AI</span>
                                                            <Tag className={styles.severityTag} color={
                                                                severity === 'error' ? 'red' :
                                                                    severity === 'warning' ? 'orange' : 'green'
                                                            }>
                                                                {severity === 'error' ? 'LỖI' :
                                                                    severity === 'warning' ? 'CẢNH BÁO' : 'GỢI Ý'}
                                                            </Tag>
                                                            <span className={styles.locationTag}>{err.location || `Dòng ${lineNumber}`}</span>
                                                        </div>
                                                        <div className={styles.commentBody}>
                                                            <div className={styles.issueText}>
                                                                {severity === 'error' ? <CloseCircleOutlined className={styles.errorIcon} /> :
                                                                    severity === 'warning' ? <ExclamationCircleOutlined className={styles.warnIcon} /> :
                                                                        <InfoCircleOutlined className={styles.infoIcon} />}
                                                                {err.issue}
                                                            </div>
                                                            {err.suggestion && (
                                                                <div className={styles.suggestionBlock}>
                                                                    <div className={styles.suggestHeader}>
                                                                        <BulbOutlined /> Gợi ý chỉnh sửa
                                                                    </div>
                                                                    <div className={styles.suggestText}>
                                                                        {err.suggestion}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {summary && (
                <div className={styles.reviewFooter}>
                    <div className={styles.summaryTitle}>
                        <MessageOutlined /> Tổng kết đánh giá
                    </div>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
};

export default AICodeReview;
