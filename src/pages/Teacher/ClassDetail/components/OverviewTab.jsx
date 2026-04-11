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

import { 
    getFilePresentation as getMaterialPresentation, 
    getFileNameFromUrl, 
    buildDownloadFileName, 
    getMaterialDisplayTitle 
} from '@/utils/filePresentation';

const getMaterialTime = (createdAt) => {
    if (!createdAt) return '--';
    const createdTime = dayjs(createdAt);
    return createdTime.isValid() ? `Đã tải lên ${createdTime.format('DD/MM/YYYY - HH:mm')}` : '--';
};

const OverviewTab = ({ description: defaultDesc, courseId, courseCode, courseName }) => {
    const [announcement, setAnnouncement] = useState('');
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
                {/* Left Column: Announcements (Timeline) */}
                <div className={styles.overviewLeft}>
                    <div className={`${styles.card} ${styles.announcementSection}`} style={{ margin: 0 }}>
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
                                <div className={styles.postTools}></div>
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
                </div>

                {/* Right Column: Sidebar (Materials) */}
                <div className={styles.overviewRight}>
                    <div className={styles.card}>
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
                                Thêm
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
                                <div className={styles.postEmptyState}>Đang tải...</div>
                            ) : sortedMaterials.length === 0 ? (
                                <div className={styles.postEmptyState}>Chưa có tài liệu.</div>
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
                                                    style={{ 
                                                        background: presentation.iconBg, 
                                                        color: presentation.iconColor,
                                                        width: '36px',
                                                        height: '36px',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    {presentation.icon}
                                                </div>
                                                <div className={styles.fileMeta}>
                                                    <div className={styles.fileName} style={{ fontSize: '13px' }}>{materialTitle}</div>
                                                </div>
                                            </div>
                                            <div className={styles.fileActions}>
                                                <Tooltip title="Tải xuống">
                                                    <Button
                                                        type="text"
                                                        icon={<CloudDownloadOutlined />}
                                                        className={styles.actionBtn}
                                                        style={{ padding: '4px' }}
                                                        onClick={() => handleDownloadMaterial(material)}
                                                    />
                                                </Tooltip>
                                                <Popconfirm
                                                    title="Xóa tài liệu này?"
                                                    onConfirm={() => handleDeleteMaterial(materialId)}
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        className={styles.actionBtn}
                                                        style={{ padding: '4px' }}
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
                                size="small"
                                style={{ marginTop: 12, padding: 0 }}
                                onClick={() => setShowAllMaterials((prev) => !prev)}
                            >
                                {showAllMaterials ? 'Thu gọn' : 'Xem tất cả'}
                            </Button>
                        )}
                    </div>
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
