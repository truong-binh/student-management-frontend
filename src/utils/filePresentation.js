import React from 'react';
import {
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileZipOutlined,
    FileTextOutlined,
    FileOutlined
} from '@ant-design/icons';

export const getFilePresentation = (fileNameOrType = '') => {
    const ext = fileNameOrType.includes('.') 
        ? fileNameOrType.split('.').pop()?.toLowerCase() || ''
        : fileNameOrType.toLowerCase();

    if (ext === 'pdf') {
        return { icon: <FilePdfOutlined />, iconBg: '#fef2f2', iconColor: '#ef4444' };
    }

    if (['doc', 'docx'].includes(ext)) {
        return { icon: <FileWordOutlined />, iconBg: '#eff6ff', iconColor: '#3b82f6' };
    }

    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return { icon: <FileExcelOutlined />, iconBg: '#f0fdf4', iconColor: '#22c55e' };
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return { icon: <FileZipOutlined />, iconBg: '#fffbeb', iconColor: '#d69e2e' };
    }

    if (['ppt', 'pptx', 'cpp', 'js', 'py', 'java', 'html', 'css', 'txt'].includes(ext)) {
        return { icon: <FileTextOutlined />, iconBg: '#fff7e6', iconColor: '#fa8c16' };
    }

    return { icon: <FileOutlined />, iconBg: '#f7fafc', iconColor: '#64748b' };
};

const safeDecodeURIComponent = (value = '') => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const isLikelyMojibake = (value = '') => /Ã.|Â.|á»|áº|Æ|Ä|Å|Ð/.test(value);

export const decodePotentialMojibake = (value = '') => {
    if (typeof value !== 'string') return '';

    const normalizedValue = safeDecodeURIComponent(value.trim());
    if (!normalizedValue) return '';
    if (!isLikelyMojibake(normalizedValue)) return normalizedValue;

    try {
        // Use Uint8Array and TextDecoder to re-interpret the string as UTF-8
        const bytes = Uint8Array.from(normalizedValue, (char) => char.charCodeAt(0) & 0xff);
        const decodedValue = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        return decodedValue || normalizedValue;
    } catch {
        return normalizedValue;
    }
};

export const getFileNameFromUrl = (fileUrl = '') => {
    if (!fileUrl) return '';
    let rawFileName = '';
    try {
        const path = new URL(fileUrl).pathname;
        rawFileName = path.split('/').pop() || '';
    } catch {
        rawFileName = fileUrl.split('/').pop()?.split('?')[0] || '';
    }
    return decodePotentialMojibake(rawFileName);
};

export const sanitizeFilenamePart = (value, fallback = '') => {
    const normalized = decodePotentialMojibake(value || '')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized || fallback;
};

export const getMaterialDisplayTitle = (material) => {
    const normalizedTitle = decodePotentialMojibake(material?.title || '');
    if (normalizedTitle) return normalizedTitle;

    const fileNameFromUrl = getFileNameFromUrl(material?.fileUrl || '');
    return fileNameFromUrl || 'Tài liệu không tên';
};

export const buildDownloadFileName = (material, courseCode, courseName) => {
    const normalizedCourseCode = sanitizeFilenamePart(courseCode, 'Mon-hoc');
    const normalizedCourseName = sanitizeFilenamePart(courseName, 'Khong-ten-mon');
    const normalizedMaterialTitle = sanitizeFilenamePart(getMaterialDisplayTitle(material), 'Tai-lieu');

    return `${normalizedCourseCode} - ${normalizedCourseName} - ${normalizedMaterialTitle}`;
};
