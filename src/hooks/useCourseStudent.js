import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';

export const useCourseStudents = (courseId, params) => {
    const queryClient = useQueryClient();

    const studentsQuery = useQuery({
        queryKey: ['courses', courseId, 'students', params],
        queryFn: async () => {
            const res = await courseApi.getCourseStudents(courseId, params);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!courseId,
    });

    const addStudentMutation = useMutation({
        mutationFn: async (data) => {
            const res = await courseApi.addStudentToCourse(courseId, data);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'students'] });
        },
    });

    const removeStudentMutation = useMutation({
        mutationFn: async (studentId) => {
            const res = await courseApi.removeStudentFromCourse(courseId, studentId);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'students'] });
        },
    });

    const importStudentsMutation = useMutation({
        mutationFn: async (data) => {
            const res = await courseApi.importStudentsToCourse(courseId, data);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'students'] });
        },
    });

    const importExcelMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await courseApi.importStudentsExcelToCourse(courseId, formData);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'students'] });
        },
    });

    return {
        data: studentsQuery.data,
        isLoading: studentsQuery.isLoading,
        error: studentsQuery.error,
        studentsQuery,
        addStudent: addStudentMutation.mutateAsync,
        isAdding: addStudentMutation.isPending,
        removeStudent: removeStudentMutation.mutateAsync,
        isRemoving: removeStudentMutation.isPending,
        importStudents: importStudentsMutation.mutateAsync,
        isImporting: importStudentsMutation.isPending,
        importExcel: importExcelMutation.mutateAsync,
        isImportingExcel: importExcelMutation.isPending,
    };
};
