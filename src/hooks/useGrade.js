import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';

export const useGradeConfig = (courseId) => {
    const queryClient = useQueryClient();

    const updateConfigMutation = useMutation({
        mutationFn: async (data) => {
            const res = await courseApi.updateGradeConfig(courseId, data);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
            queryClient.invalidateQueries({ queryKey: ['grades', courseId] });
        },
    });

    return {
        updateConfig: updateConfigMutation.mutateAsync,
        isUpdating: updateConfigMutation.isPending,
    };
};

export const useStudentGrade = (courseId, studentId) => {
    const queryClient = useQueryClient();

    const gradeQuery = useQuery({
        queryKey: ['grades', courseId, studentId],
        queryFn: async () => {
            const res = await courseApi.getFinalGrade(courseId, studentId);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!courseId && !!studentId,
    });

    const updateComponentGradeMutation = useMutation({
        mutationFn: async ({ componentId, score }) => {
            const res = await courseApi.updateComponentGrade(courseId, studentId, componentId, score);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades', courseId, studentId] });
        },
    });

    const updateFinalGradeMutation = useMutation({
        mutationFn: async (score) => {
            const res = await courseApi.updateFinalGrade(courseId, studentId, score);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades', courseId, studentId] });
        },
    });

    return {
        gradeData: gradeQuery.data,
        isLoading: gradeQuery.isLoading,
        error: gradeQuery.error,
        updateComponentGrade: updateComponentGradeMutation.mutateAsync,
        isUpdatingComponent: updateComponentGradeMutation.isPending,
        updateFinalGrade: updateFinalGradeMutation.mutateAsync,
        isUpdatingFinal: updateFinalGradeMutation.isPending,
    };
};
