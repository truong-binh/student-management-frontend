import { apiAxios } from "@/api/rootApi.js";

export const courseApi = {
    getAllCourses: async () => {
        return await apiAxios({
            method: "get",
            url: "/api/courses",
        });
    },

    createCourse: async (data) => {
        return await apiAxios({
            method: "post",
            url: "/api/courses",
            data,
        });
    },

    getCourseById: async (id) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${id}`,
        });
    },

    updateCourse: async (id, data) => {
        return await apiAxios({
            method: "put",
            url: `/api/courses/${id}`,
            data,
        });
    },

    deleteCourse: async (id) => {
        return await apiAxios({
            method: "delete",
            url: `/api/courses/${id}`,
        });
    },

    getCourseStudents: async (courseId, params) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${courseId}/students`,
            params,
        });
    },

    addStudentToCourse: async (courseId, data) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/students`,
            data,
        });
    },

    removeStudentFromCourse: async (courseId, studentId) => {
        return await apiAxios({
            method: "delete",
            url: `/api/courses/${courseId}/students/${studentId}`,
        });
    },

    importStudentsToCourse: async (courseId, data) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/import-students`,
            data,
        });
    },

    importStudentsExcelToCourse: async (courseId, formData) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/import-students-excel`,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    getAnnouncements: async (courseId) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${courseId}/announcements`,
        });
    },

    createAnnouncement: async (courseId, data) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/announcements`,
            data,
        });
    },

    deleteAnnouncement: async (courseId, annoId) => {
        return await apiAxios({
            method: "delete",
            url: `/api/courses/${courseId}/announcements/${annoId}`,
        });
    },

    getMaterials: async (courseId) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${courseId}/materials`,
        });
    },

    uploadMaterials: async (courseId, formData) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/materials`,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateMaterial: async (courseId, materialId, data) => {
        return await apiAxios({
            method: "patch",
            url: `/api/courses/${courseId}/materials/${materialId}`,
            data,
        });
    },

    deleteMaterial: async (courseId, materialId) => {
        return await apiAxios({
            method: "delete",
            url: `/api/courses/${courseId}/materials/${materialId}`,
        });
    },

    updateGradeConfig: async (courseId, data) => {
        return await apiAxios({
            method: "patch",
            url: `/api/courses/${courseId}/grade-config`,
            data,
        });
    },

    updateComponentGrade: async (courseId, studentId, componentId, score) => {
        return await apiAxios({
            method: "patch",
            url: `/api/courses/${courseId}/grades/students/${studentId}/components/${componentId}`,
            data: { score },
        });
    },

    updateFinalGrade: async (courseId, studentId, score) => {
        return await apiAxios({
            method: "patch",
            url: `/api/courses/${courseId}/grades/students/${studentId}/final`,
            data: { score },
        });
    },

    getFinalGrade: async (courseId, studentId) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${courseId}/grades/students/${studentId}/final`,
        });
    },
};
