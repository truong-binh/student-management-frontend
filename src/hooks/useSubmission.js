import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submissionApi } from '@/api/admin/submission';

export const useAssignmentSubmissions = (assignmentId) => {
    const queryClient = useQueryClient();

    const submittedQuery = useQuery({
        queryKey: ['assignments', assignmentId, 'submissions'],
        queryFn: async () => {
            const res = await submissionApi.getSubmissionsByAssignmentId(assignmentId);
            if (!res.success) throw res;
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!assignmentId,
    });

    const notSubmittedQuery = useQuery({
        queryKey: ['assignments', assignmentId, 'not-submitted'],
        queryFn: async () => {
            const res = await submissionApi.getNotSubmittedStudents(assignmentId);
            if (!res.success) throw res;
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!assignmentId,
    });

    return {
        submissions: submittedQuery.data || [],
        isSubmissionsLoading: submittedQuery.isLoading,
        notSubmittedStudents: notSubmittedQuery.data || [],
        isNotSubmittedLoading: notSubmittedQuery.isLoading,
    };
};

export const useSubmissionDetail = (submissionId) => {
    const queryClient = useQueryClient();

    const detailQuery = useQuery({
        queryKey: ['submissions', submissionId],
        queryFn: async () => {
            const res = await submissionApi.getSubmissionById(submissionId);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!submissionId,
    });

    const gradeAI = useMutation({
        mutationFn: async (idToGrade) => {
            const res = await submissionApi.gradeSubmissionByAI(idToGrade || submissionId);
            if (!res.success) throw res;
            return res.data;
        },
        onSuccess: (data, variables) => {
            const idToGrade = variables || submissionId;
            queryClient.invalidateQueries({ queryKey: ['submissions', idToGrade] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });

    return {
        submission: detailQuery.data,
        isLoading: detailQuery.isLoading,
        gradeSubmissionByAI: gradeAI.mutateAsync,
        isGrading: gradeAI.isPending,
    };
};

export const useStudentSubmissions = (assignmentId) => {
    const queryClient = useQueryClient();

    const submitAndGradeMutation = useMutation({
        mutationFn: async (formData) => {
            const submitRes = await submissionApi.submitAssignment(assignmentId, formData);
            if (!submitRes.success) throw submitRes;

            let submissionId = submitRes.data?.id || submitRes.data?._id;

            if (!submissionId) {
                const mySubsRes = await submissionApi.getMySubmissions();
                if (mySubsRes.success && Array.isArray(mySubsRes.data)) {
                    const found = mySubsRes.data.find(sub => {
                        const subAssignmentId = sub.assignment?.id || sub.assignment?._id || sub.assignment;
                        return String(subAssignmentId) === String(assignmentId);
                    });
                    submissionId = found?.id || found?._id;
                }
            }

            if (submissionId) {
                try {
                    await submissionApi.gradeSubmissionByAI(submissionId);
                } catch {
                    // AI grading may fail due to permissions or file type — not critical
                }
            }

            return submitRes.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
            queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId, 'submissions'] });
        },
    });

    return {
        submitAssignment: submitAndGradeMutation.mutateAsync,
        isSubmitting: submitAndGradeMutation.isPending,
        isGrading: false,
    };
};

export const useMySubmissions = () => {
    const query = useQuery({
        queryKey: ['my-submissions'],
        queryFn: async () => {
            const res = await submissionApi.getMySubmissions();
            if (!res.success) throw res;
            return Array.isArray(res.data) ? res.data : [];
        },
    });

    return {
        mySubmissions: query.data || [],
        isLoading: query.isLoading,
    };
};
