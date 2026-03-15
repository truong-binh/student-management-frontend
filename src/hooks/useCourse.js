import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';

export const useCourse = () => {
    const queryClient = useQueryClient();

    const coursesQuery = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await courseApi.getAllCourses();
            if (!res.success) throw res;
            if (Array.isArray(res.data)) return res.data;
            return res.data?.items || res.data?.courses || [];
        },
    });

    const getCourseDetailQuery = (id) => useQuery({
        queryKey: ['courses', id],
        queryFn: async () => {
            const res = await courseApi.getCourseById(id);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!id,
    });

    const createCourseMutation = useMutation({
        mutationFn: async (data) => {
            const res = await courseApi.createCourse(data);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    const updateCourseMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await courseApi.updateCourse(id, data);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    const deleteCourseMutation = useMutation({
        mutationFn: async (id) => {
            const res = await courseApi.deleteCourse(id);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: (res, id, context) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    return {
        courses: coursesQuery.data || [],
        isLoading: coursesQuery.isLoading,
        error: coursesQuery.error,
        coursesQuery,
        getCourseDetailQuery,
        createCourse: (data, options = {}) => createCourseMutation.mutate(data, options),
        updateCourse: (id, data, options = {}) => updateCourseMutation.mutate({ id, data }, options),
        deleteCourse: (id, options = {}) => deleteCourseMutation.mutate(id, options),
        isCreating: createCourseMutation.isPending,
        isUpdating: updateCourseMutation.isPending,
        isDeleting: deleteCourseMutation.isPending,
    };
};
