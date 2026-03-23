import { apiAxios } from "@/api/rootApi.js";

export const submissionApi = {
    submitAssignment: async (id, formData) => {
        return await apiAxios({
            method: "post",
            url: `/api/assignments/${id}/submissions`,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    getSubmissionsByAssignmentId: async (id) => {
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

    getSubmissionById: async (id) => {
        return await apiAxios({
            method: "get",
            url: `/api/submissions/${id}`,
        });
    },

    gradeSubmissionByAI: async (id) => {
        return await apiAxios({
            method: "post",
            url: `/api/submissions/${id}/grade/ai`,
        });
    },


    getMySubmissions: async () => {
        return await apiAxios({
            method: "get",
            url: `/api/my/submissions`,
        });
    },
};
