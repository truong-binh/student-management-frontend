import React, { useState, useEffect } from 'react';
import { Spin, Tag, Empty } from 'antd';
import { 
    RobotOutlined, 
    BulbOutlined, 
    CloseCircleOutlined,
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
        if (!fileUrl) return;

        const fetchCode = async () => {
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

    return (
        <div className={styles.codeReviewContainer}>
            <div className={styles.reviewHeader}>
                <div className={styles.headerInfo}>
                    <CodeOutlined className={styles.mainIcon} />
                    <div>
                        <h4>Review chi tiết từ AI</h4>
                        <span>{codeLines.length} dòng mã nguồn • {errors.length} nhận xét</span>
                    </div>
                </div>
            </div>

            <div className={styles.codeViewport}>
                <table className={styles.codeTable}>
                    <tbody>
                        {codeLines.map((lineText, index) => {
                            const lineNumber = index + 1;
                            const lineErrors = errorsByLine[lineNumber] || [];
                            
                            return (
                                <React.Fragment key={index}>
                                    <tr className={clsx(styles.codeRow, lineErrors.length > 0 && styles.hasErrorHighlight)}>
                                        <td className={styles.lineNum}>{lineNumber}</td>
                                        <td className={styles.codeCell}>
                                            <pre>{lineText || ' '}</pre>
                                        </td>
                                    </tr>
                                    
                                    {lineErrors.map((err, errIdx) => (
                                        <tr key={`err-${lineNumber}-${errIdx}`} className={styles.commentRow}>
                                            <td className={styles.commentGutter}>
                                                <div className={styles.aiAvatar}>
                                                    <RobotOutlined />
                                                </div>
                                            </td>
                                            <td className={styles.commentCell}>
                                                <div className={styles.commentBox}>
                                                    <div className={styles.commentHeader}>
                                                        <span className={styles.aiBadge}>Reviewer AI</span>
                                                        <span className={styles.locationTag}>{err.location || `Dòng ${lineNumber}`}</span>
                                                    </div>
                                                    <div className={styles.commentBody}>
                                                        <div className={styles.issueText}>
                                                            <CloseCircleOutlined className={styles.errorIcon} />
                                                            {err.issue}
                                                        </div>
                                                        {err.suggestion && (
                                                            <div className={styles.suggestionBlock}>
                                                                <BulbOutlined className={styles.suggestIcon} />
                                                                <div className={styles.suggestText}>
                                                                    <strong>Gợi ý chỉnh sửa:</strong> {err.suggestion}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
