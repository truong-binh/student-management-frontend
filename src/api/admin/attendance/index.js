import { apiAxios } from "../../rootApi";

export const attendanceApi = {
    importAttendance: (courseId, formData) => {
        return apiAxios.post(`/api/attendance/${courseId}/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    getClassAttendance: (courseId, week) => {
        const params = week ? { week } : {};
        return apiAxios.get(`/api/attendance/${courseId}`, { params });
    },

    getMyAttendance: (courseId) => {
        return apiAxios.get(`/api/attendance/${courseId}/me`);
    }
};
