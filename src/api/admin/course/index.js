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
};
