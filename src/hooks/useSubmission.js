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

    const submitMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await submissionApi.submitAssignment(assignmentId, formData);
            if (!res.success) throw res;
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
            queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId, 'submissions'] });
        },
    });

    return {
        submitAssignment: submitMutation.mutateAsync,
        isSubmitting: submitMutation.isPending,
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
