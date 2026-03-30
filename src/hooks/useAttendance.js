import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/admin/attendance';

export const useClassAttendance = (courseId, week) => {
    const query = useQuery({
        queryKey: ['attendance', courseId, week],
        queryFn: async () => {
            const res = await attendanceApi.getClassAttendance(courseId, week);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!courseId,
    });

    return {
        attendance: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
};

export const useMyAttendance = (courseId) => {
    const query = useQuery({
        queryKey: ['my-attendance', courseId],
        queryFn: async () => {
            const res = await attendanceApi.getMyAttendance(courseId);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!courseId,
    });

    return {
        summary: query.data?.summary || { total: 0, present: 0, excused: 0, absent: 0, late: 0 },
        records: query.data?.records || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
};

export const useAttendanceImport = (courseId) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (formData) => attendanceApi.importAttendance(courseId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance', courseId] });
        },
    });

    return {
        importAttendance: mutation.mutateAsync,
        isLoading: mutation.isPending,
    };
};
