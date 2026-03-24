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

    getCourseStudents: async (courseId, params = {}) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${courseId}/students`,
            params,
        });
    },

    addStudentToCourse: async (courseId, studentId) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/students`,
            data: { studentId },
        });
    },

    removeStudentFromCourse: async (courseId, studentId) => {
        return await apiAxios({
            method: "delete",
            url: `/api/courses/${courseId}/students/${studentId}`,
        });
    },

    importStudents: async (courseId, studentIds) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/import-students`,
            data: { studentIds },
        });
    },

    importStudentsFromExcel: async (courseId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/import-students-excel`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
