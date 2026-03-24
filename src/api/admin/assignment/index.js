import { apiAxios } from "@/api/rootApi.js";

export const assignmentApi = {
    getAssignmentsByCourse: async (courseId) => {
        return await apiAxios({
            method: "get",
            url: `/api/courses/${courseId}/assignments`,
        });
    },

    createAssignment: async (courseId, formData) => {
        return await apiAxios({
            method: "post",
            url: `/api/courses/${courseId}/assignments`,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateAssignment: async (id, formData) => {
        return await apiAxios({
            method: "put",
            url: `/api/assignments/${id}`,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    deleteAssignment: async (id) => {
        return await apiAxios({
            method: "delete",
            url: `/api/assignments/${id}`,
        });
    },

    getSubmissionsByAssignment: async (id) => {
        return await apiAxios({
            method: "get",
            url: `/api/assignments/${id}/submissions`,
        });
    },

    getNotSubmittedStudents: async (id) => {
        return await apiAxios({
            method: "get",
            url: `/api/assignments/${id}/submissions/not-submitted`,
        });
    },
};
