import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '@/api/admin/assignment';

export const useCourseAssignments = (courseId) => {
    const queryClient = useQueryClient();

    const assignmentsQuery = useQuery({
        queryKey: ['courses', courseId, 'assignments'],
        queryFn: async () => {
            const res = await assignmentApi.getAssignmentsByCourseId(courseId);
            if (!res.success) throw res;
            return Array.isArray(res.data) ? res.data : (res.data?.items || []);
        },
        enabled: !!courseId,
    });

    const createAssignmentMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await assignmentApi.createAssignment(courseId, formData);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'assignments'] });
        },
    });

    return {
        assignments: assignmentsQuery.data || [],
        isLoading: assignmentsQuery.isLoading,
        error: assignmentsQuery.error,
        createAssignment: createAssignmentMutation.mutateAsync,
        isCreating: createAssignmentMutation.isPending,
    };
};

export const useAssignmentDetail = (assignmentId) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['assignments', assignmentId],
        queryFn: async () => {
            const res = await assignmentApi.getAssignmentById(assignmentId);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!assignmentId,
    });

    const updateMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await assignmentApi.updateAssignment(assignmentId, formData);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments', assignmentId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await assignmentApi.deleteAssignment(assignmentId);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });

    return {
        assignment: query.data,
        isLoading: query.isLoading,
        updateAssignment: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteAssignment: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};
