import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';

const normalizeStudentsResponse = (res) => {
    if (!res?.success) throw res;

    if (Array.isArray(res.data)) {
        return {
            students: res.data,
            pagination: null,
        };
    }

    if (Array.isArray(res.data?.items)) {
        return {
            students: res.data.items,
            pagination: res.pagination || res.data.pagination || null,
        };
    }

    return {
        students: res.data?.students || [],
        pagination: res.pagination || res.data?.pagination || null,
    };
};

export const useCourseStudents = (courseId, params = {}) => {
    const queryClient = useQueryClient();

    const studentsQuery = useQuery({
        queryKey: ['courseStudents', courseId, params],
        queryFn: async () => {
            const res = await courseApi.getCourseStudents(courseId, params);
            return normalizeStudentsResponse(res);
        },
        enabled: !!courseId,
    });

    const addStudentMutation = useMutation({
        mutationFn: async (studentId) => {
            const res = await courseApi.addStudentToCourse(courseId, studentId);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseStudents', courseId] });
        },
    });

    const removeStudentMutation = useMutation({
        mutationFn: async (studentId) => {
            const res = await courseApi.removeStudentFromCourse(courseId, studentId);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseStudents', courseId] });
        },
    });

    const importStudentsMutation = useMutation({
        mutationFn: async (studentIds) => {
            const res = await courseApi.importStudents(courseId, studentIds);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseStudents', courseId] });
        },
    });

    const importStudentsExcelMutation = useMutation({
        mutationFn: async (file) => {
            const res = await courseApi.importStudentsFromExcel(courseId, file);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseStudents', courseId] });
        },
    });

    return {
        students: studentsQuery.data?.students || [],
        pagination: studentsQuery.data?.pagination || null,
        studentsQuery,
        isLoadingStudents: studentsQuery.isLoading,
        studentsError: studentsQuery.error,

        addStudent: (studentId, options = {}) => addStudentMutation.mutate(studentId, options),
        removeStudent: (studentId, options = {}) => removeStudentMutation.mutate(studentId, options),
        importStudents: (studentIds, options = {}) => importStudentsMutation.mutate(studentIds, options),
        importStudentsExcel: (file, options = {}) => importStudentsExcelMutation.mutate(file, options),

        isAddingStudent: addStudentMutation.isPending,
        isRemovingStudent: removeStudentMutation.isPending,
        isImportingStudents: importStudentsMutation.isPending,
        isImportingStudentsExcel: importStudentsExcelMutation.isPending,
    };
};
