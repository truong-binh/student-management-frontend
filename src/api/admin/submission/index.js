import { apiAxios } from '@/api/rootApi.js';

export const submissionApi = {
    getSubmissionDetail: async (id) => {
        return await apiAxios({
            method: 'get',
            url: `/api/submissions/${id}`,
        });
    },

    gradeSubmissionAI: async (id) => {
        return await apiAxios({
            method: 'post',
            url: `/api/submissions/${id}/grade/ai`,
        });
    },
};
