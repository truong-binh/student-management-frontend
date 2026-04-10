import React, { useRef, useState } from 'react';
import { Button, Input, Avatar, Tooltip, Popconfirm, message, Modal } from 'antd';
import {
    InfoCircleOutlined,
    DatabaseOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileTextOutlined,
    FileOutlined,
    FileZipOutlined,
    EditOutlined,
    PlusOutlined,
    CloudDownloadOutlined,
    PaperClipOutlined,
    PictureOutlined,
    MessageOutlined,
    DeleteOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '../styles.module.scss';
import userDefault from '@/assets/images/logos/user_default.png';
import { useCourseAnnouncements } from '@/hooks/useCourseAnnouncement';
import { useCourseMaterials } from '@/hooks/useCourseMaterial';

const { TextArea } = Input;

const getMaterialPresentation = (type = '') => {
    const ext = type.toLowerCase();

    if (ext === 'pdf') {
        return { icon: <FilePdfOutlined />, iconBg: '#ebf8ff', iconColor: '#3b82f6' };
    }

    if (['doc', 'docx'].includes(ext)) {
        return { icon: <FileWordOutlined />, iconBg: '#e6f7ff', iconColor: '#1677ff' };
    }

    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return { icon: <FileExcelOutlined />, iconBg: '#f0fff4', iconColor: '#22c55e' };
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return { icon: <FileZipOutlined />, iconBg: '#fffbeb', iconColor: '#d69e2e' };
    }

    if (['ppt', 'pptx', 'txt'].includes(ext)) {
        return { icon: <FileTextOutlined />, iconBg: '#fff7e6', iconColor: '#fa8c16' };
    }

    return { icon: <FileOutlined />, iconBg: '#f7fafc', iconColor: '#64748b' };
};

const getMaterialTime = (createdAt) => {
    if (!createdAt) return '--';
    const createdTime = dayjs(createdAt);
    return createdTime.isValid() ? `Đã tải lên ${createdTime.format('DD/MM/YYYY - HH:mm')}` : '--';
};

const safeDecodeURIComponent = (value = '') => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const isLikelyMojibake = (value = '') => /Ã.|Â.|á»|áº|Æ|Ä|Å|Ð|�/.test(value);

const decodePotentialMojibake = (value = '') => {
    if (typeof value !== 'string') return '';

    const normalizedValue = safeDecodeURIComponent(value.trim());
    if (!normalizedValue) return '';
    if (!isLikelyMojibake(normalizedValue)) return normalizedValue;

    try {
        const bytes = Uint8Array.from(normalizedValue, (char) => char.charCodeAt(0) & 0xff);
        const decodedValue = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        return decodedValue || normalizedValue;
    } catch {
        return normalizedValue;
    }
};

const sanitizeFilenamePart = (value, fallback = '') => {
    const normalized = decodePotentialMojibake(value || '')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized || fallback;
};

const getFileNameFromUrl = (fileUrl = '') => {
    if (!fileUrl) return '';

    try {
        const pathName = new URL(fileUrl).pathname;
        const rawFileName = pathName.split('/').pop() || '';
        return decodePotentialMojibake(rawFileName);
    } catch {
        const rawFileName = fileUrl.split('/').pop()?.split('?')[0] || '';
        return decodePotentialMojibake(rawFileName);
    }
};

const getMaterialDisplayTitle = (material) => {
    const normalizedTitle = decodePotentialMojibake(material?.title || '');
    if (normalizedTitle) return normalizedTitle;

    const fileNameFromUrl = getFileNameFromUrl(material?.fileUrl || '');
    return fileNameFromUrl || 'Tài liệu không tên';
};

const buildDownloadFileName = (material, courseCode, courseName) => {
    const normalizedCourseCode = sanitizeFilenamePart(courseCode, 'Mon-hoc');
    const normalizedCourseName = sanitizeFilenamePart(courseName, 'Khong-ten-mon');
    const normalizedMaterialTitle = sanitizeFilenamePart(getMaterialDisplayTitle(material), 'Tai-lieu');

    return `${normalizedCourseCode} - ${normalizedCourseName} - ${normalizedMaterialTitle}`;
};

const OverviewTab = ({ description: defaultDesc, courseId, courseCode, courseName }) => {
    const [announcement, setAnnouncement] = useState('');
    const [description, setDescription] = useState(
        defaultDesc || 'Chưa có mô tả cho học phần này.'
    );
    const [editingDesc, setEditingDesc] = useState(false);
    const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
    const [renamingMaterial, setRenamingMaterial] = useState(null);
    const [renamingTitle, setRenamingTitle] = useState('');
    const [deletingMaterialId, setDeletingMaterialId] = useState(null);
    const [showAllMaterials, setShowAllMaterials] = useState(false);
    const fileInputRef = useRef(null);

    const {
        announcements,
        isLoadingAnnouncements,
        createAnnouncement,
        isCreatingAnnouncement,
        deleteAnnouncement,
        isDeletingAnnouncement,
    } = useCourseAnnouncements(courseId);

    const {
        materials,
        isLoadingMaterials,
        uploadMaterials,
        isUploadingMaterials,
        updateMaterialTitle,
        isUpdatingMaterial,
        deleteMaterial,
        isDeletingMaterial,
    } = useCourseMaterials(courseId);

    const sortedMaterials = [...materials].sort((firstMaterial, secondMaterial) => {
        const firstTime = dayjs(firstMaterial?.createdAt).valueOf();
        const secondTime = dayjs(secondMaterial?.createdAt).valueOf();
        return secondTime - firstTime;
    });
    const visibleMaterials = showAllMaterials ? sortedMaterials : sortedMaterials.slice(0, 4);
    const hasMoreMaterials = sortedMaterials.length > 4;

    const getAnnouncementAuthor = (createdBy) => {
        if (!createdBy || typeof createdBy === 'string') return 'Giảng viên';
        return createdBy.fullName || createdBy.name || createdBy.email || 'Giảng viên';
    };

    const getAnnouncementTime = (createdAt) => {
        if (!createdAt) return '--';
        const createdTime = dayjs(createdAt);
        return createdTime.isValid() ? createdTime.format('DD/MM/YYYY - HH:mm') : '--';
    };

    const handlePost = async () => {
        if (!announcement.trim()) return;

        if (!courseId) {
            message.error('Không xác định được lớp học để đăng thông báo');
            return;
        }

        try {
            await createAnnouncement(announcement.trim());
            message.success('Đăng thông báo thành công');
            setAnnouncement('');
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi đăng thông báo');
        }
    };

    const handleDeleteAnnouncement = async (annoId) => {
        if (!annoId) return;

        try {
            setDeletingAnnouncementId(annoId);
            await deleteAnnouncement(annoId);
            message.success('Xóa thông báo thành công');
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi xóa thông báo');
        } finally {
            setDeletingAnnouncementId(null);
        }
    };

    const openFileDialog = () => {
        if (!courseId) {
            message.error('Không xác định được lớp học để tải tài liệu');
            return;
        }

        fileInputRef.current?.click();
    };

    const handleUploadMaterial = async (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = '';

        if (selectedFiles.length === 0) return;

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => formData.append('attachments', file));

            await uploadMaterials(formData);
            message.success(`Tải lên thành công ${selectedFiles.length} tài liệu`);
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi tải tài liệu');
        }
    };

    const handleDownloadMaterial = async (material) => {
        if (!material?.fileUrl) {
            message.error('Không tìm thấy đường dẫn tài liệu');
            return;
        }

        const downloadFileName = buildDownloadFileName(material, courseCode, courseName);

        try {
            const response = await fetch(material.fileUrl);
            if (!response.ok) throw new Error('Không thể tải file từ máy chủ');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', downloadFileName);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            const link = document.createElement('a');
            link.href = material.fileUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('download', downloadFileName);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const openRenameMaterialModal = (material) => {
        setRenamingMaterial(material);
        setRenamingTitle(getMaterialDisplayTitle(material));
    };

    const closeRenameModal = () => {
        setRenamingMaterial(null);
        setRenamingTitle('');
    };

    const handleRenameMaterial = async () => {
        const materialId = renamingMaterial?._id || renamingMaterial?.id;
        const nextTitle = renamingTitle.trim();

        if (!materialId) {
            message.error('Không xác định được tài liệu cần cập nhật');
            return;
        }

        if (!nextTitle) {
            message.warning('Vui lòng nhập tiêu đề tài liệu');
            return;
        }

        try {
            await updateMaterialTitle(materialId, nextTitle);
            message.success('Cập nhật tiêu đề tài liệu thành công');
            closeRenameModal();
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi cập nhật tiêu đề');
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!materialId) return;

        try {
            setDeletingMaterialId(materialId);
            await deleteMaterial(materialId);
            message.success('Xóa tài liệu thành công');
        } catch (error) {
            message.error(error?.message || 'Có lỗi xảy ra khi xóa tài liệu');
        } finally {
            setDeletingMaterialId(null);
        }
    };

    return (
        <div className={styles.overviewWrap}>
            <div className={styles.overviewGrid}>
                <div className={styles.overviewLeft}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardHeaderLeft}>
                                <InfoCircleOutlined className={styles.icon} />
                                Mô tả lớp học
                            </span>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                className={styles.editBtn}
                                onClick={() => setEditingDesc(!editingDesc)}
                            >
                                {editingDesc ? 'Lưu' : 'Chỉnh sửa'}
                            </Button>
                        </div>
                        {editingDesc ? (
                            <TextArea
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.descTextarea}
                            />
                        ) : (
                            <p className={styles.description}>{description}</p>
                        )}
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardHeaderLeft}>
                                <DatabaseOutlined className={styles.icon} />
                                Đề cương
                            </span>
                        </div>
                        <div className={styles.uploadArea}>
                            <InboxOutlined className={styles.uploadIcon} />
                            <p className={styles.uploadText}>Kéo thả hoặc nhấn để tải lên đề cương</p>
                            <p className={styles.uploadHint}>Định dạng hỗ trợ: PDF, DOCX (Tối đa 10MB)</p>
                        </div>
                    </div>
                </div>

                <div className={styles.overviewRight}>
                    <div className={styles.card} style={{ height: '100%' }}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardHeaderLeft}>
                                <DatabaseOutlined className={styles.icon} />
                                Tài liệu học tập
                            </span>
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<PlusOutlined />}
                                className={styles.addBtn}
                                loading={isUploadingMaterials}
                                disabled={!courseId}
                                onClick={openFileDialog}
                            >
                                Thêm tài liệu
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            onChange={handleUploadMaterial}
                        />
                        <div className={styles.fileList}>
                            {isLoadingMaterials ? (
                                <div className={styles.postEmptyState}>Đang tải tài liệu...</div>
                            ) : sortedMaterials.length === 0 ? (
                                <div className={styles.postEmptyState}>Chưa có tài liệu nào cho lớp học này.</div>
                            ) : (
                                visibleMaterials.map((material) => {
                                    const materialId = material._id || material.id;
                                    const presentation = getMaterialPresentation(material.type);
                                    const materialTitle = getMaterialDisplayTitle(material);

                                    return (
                                        <div key={materialId || material.createdAt} className={styles.fileItem}>
                                            <div className={styles.fileInfo}>
                                                <div
                                                    className={styles.fileIcon}
                                                    style={{ background: presentation.iconBg, color: presentation.iconColor }}
                                                >
                                                    {presentation.icon}
                                                </div>
                                                <div className={styles.fileMeta}>
                                                    <div className={styles.fileName}>{materialTitle}</div>
                                                    <div className={styles.fileSize}>
                                                        {(material.type || 'file').toUpperCase()} • {getMaterialTime(material.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.fileActions}>
                                                <Tooltip title="Tải xuống">
                                                    <Button
                                                        type="text"
                                                        icon={<CloudDownloadOutlined />}
                                                        className={`${styles.downloadBtn} ${styles.actionBtn}`}
                                                        onClick={() => handleDownloadMaterial(material)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Đổi tên tài liệu">
                                                    <Button
                                                        type="text"
                                                        icon={<EditOutlined />}
                                                        className={styles.actionBtn}
                                                        onClick={() => openRenameMaterialModal(material)}
                                                        disabled={!materialId}
                                                    />
                                                </Tooltip>
                                                <Popconfirm
                                                    title="Xóa tài liệu này?"
                                                    description="Hành động này không thể hoàn tác."
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true }}
                                                    onConfirm={() => handleDeleteMaterial(materialId)}
                                                    disabled={!materialId}
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        className={styles.actionBtn}
                                                        loading={deletingMaterialId === materialId && isDeletingMaterial}
                                                        disabled={!materialId}
                                                    />
                                                </Popconfirm>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {(hasMoreMaterials || showAllMaterials) && (
                            <Button
                                type="link"
                                danger
                                style={{ padding: 0, marginTop: 12, fontWeight: 600 }}
                                onClick={() => setShowAllMaterials((previous) => !previous)}
                            >
                                {showAllMaterials ? 'Thu gọn tài liệu' : 'Xem tất cả tài liệu'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className={`${styles.card} ${styles.announcementSection}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardHeaderLeft}>
                        <MessageOutlined className={styles.icon} />
                        Thông báo lớp học
                    </span>
                </div>

                <div className={styles.postInput}>
                    <TextArea
                        rows={3}
                        placeholder="Nhập thông báo mới cho sinh viên của bạn..."
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        className={styles.postTextarea}
                    />
                    <div className={styles.postActions}>
                        <div className={styles.postTools}>
                            <Tooltip title="Đính kèm ảnh">
                                <Button type="text" icon={<PictureOutlined />} className={styles.toolBtn} />
                            </Tooltip>
                            <Tooltip title="Đính kèm file">
                                <Button type="text" icon={<PaperClipOutlined />} className={styles.toolBtn} />
                            </Tooltip>
                        </div>
                        <Button
                            type="primary"
                            danger
                            className={styles.postBtn}
                            onClick={handlePost}
                            loading={isCreatingAnnouncement}
                            disabled={!announcement.trim() || !courseId}
                        >
                            Đăng thông báo
                        </Button>
                    </div>
                </div>

                <div className={styles.postList}>
                    {isLoadingAnnouncements ? (
                        <div className={styles.postEmptyState}>Đang tải thông báo...</div>
                    ) : announcements.length === 0 ? (
                        <div className={styles.postEmptyState}>Chưa có thông báo nào cho lớp học này.</div>
                    ) : (
                        announcements.map((post) => {
                            const announcementId = post._id || post.id;

                            return (
                                <div key={announcementId || post.createdAt} className={styles.postItem}>
                                    <Avatar src={post.createdBy?.avatar || userDefault} size={44} className={styles.postAvatar} />
                                    <div className={styles.postBody}>
                                        <div className={styles.postHeader}>
                                            <div>
                                                <span className={styles.postName}>{getAnnouncementAuthor(post.createdBy)}</span>
                                                <span className={styles.postTime}>{getAnnouncementTime(post.createdAt)}</span>
                                            </div>
                                            <Popconfirm
                                                title="Xóa thông báo này?"
                                                description="Hành động này không thể hoàn tác."
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                                onConfirm={() => handleDeleteAnnouncement(announcementId)}
                                                disabled={!announcementId}
                                            >
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    className={styles.moreBtn}
                                                    loading={deletingAnnouncementId === announcementId && isDeletingAnnouncement}
                                                    disabled={!announcementId}
                                                />
                                            </Popconfirm>
                                        </div>
                                        <p className={styles.postContent}>{post.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <Modal
                title="Cập nhật tiêu đề tài liệu"
                open={!!renamingMaterial}
                onCancel={closeRenameModal}
                onOk={handleRenameMaterial}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={isUpdatingMaterial}
            >
                <Input
                    placeholder="Nhập tiêu đề tài liệu"
                    value={renamingTitle}
                    onChange={(e) => setRenamingTitle(e.target.value)}
                    maxLength={255}
                />
            </Modal>
        </div>
    );
};

export default OverviewTab;
