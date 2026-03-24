import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '@/api/admin/assignment';

const normalizeListData = (res, fallbackKey) => {
    if (!res?.success) throw res;
    if (Array.isArray(res.data)) return res.data;
    return res.data?.[fallbackKey] || [];
};

export const useAssignment = (courseId, assignmentId) => {
    const queryClient = useQueryClient();

    const assignmentsQuery = useQuery({
        queryKey: ['assignments', courseId],
        queryFn: async () => {
            const res = await assignmentApi.getAssignmentsByCourse(courseId);
            return normalizeListData(res, 'assignments');
        },
        enabled: !!courseId,
    });

    const submissionsQuery = useQuery({
        queryKey: ['assignmentSubmissions', assignmentId],
        queryFn: async () => {
            const res = await assignmentApi.getSubmissionsByAssignment(assignmentId);
            return normalizeListData(res, 'submissions');
        },
        enabled: !!assignmentId,
    });

    const notSubmittedQuery = useQuery({
        queryKey: ['assignmentNotSubmitted', assignmentId],
        queryFn: async () => {
            const res = await assignmentApi.getNotSubmittedStudents(assignmentId);
            return normalizeListData(res, 'students');
        },
        enabled: !!assignmentId,
    });

    const createAssignmentMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await assignmentApi.createAssignment(courseId, formData);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    const updateAssignmentMutation = useMutation({
        mutationFn: async ({ id, formData }) => {
            const res = await assignmentApi.updateAssignment(id, formData);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            queryClient.invalidateQueries({ queryKey: ['assignmentSubmissions', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['assignmentNotSubmitted', variables.id] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    const deleteAssignmentMutation = useMutation({
        mutationFn: async (id) => {
            const res = await assignmentApi.deleteAssignment(id);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: (res, id, context) => {
            queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
            queryClient.removeQueries({ queryKey: ['assignmentSubmissions', id] });
            queryClient.removeQueries({ queryKey: ['assignmentNotSubmitted', id] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    return {
        assignments: assignmentsQuery.data || [],
        isLoadingAssignments: assignmentsQuery.isLoading,
        assignmentsError: assignmentsQuery.error,

        submissions: submissionsQuery.data || [],
        notSubmittedStudents: notSubmittedQuery.data || [],
        isLoadingSubmissions: submissionsQuery.isLoading || notSubmittedQuery.isLoading,
        submissionsError: submissionsQuery.error || notSubmittedQuery.error,

        createAssignment: (formData, options = {}) => createAssignmentMutation.mutate(formData, options),
        updateAssignment: (id, formData, options = {}) => updateAssignmentMutation.mutate({ id, formData }, options),
        deleteAssignment: (id, options = {}) => deleteAssignmentMutation.mutate(id, options),

        isCreatingAssignment: createAssignmentMutation.isPending,
        isUpdatingAssignment: updateAssignmentMutation.isPending,
        isDeletingAssignment: deleteAssignmentMutation.isPending,
    };
};
