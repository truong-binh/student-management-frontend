import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';

export const useCourseAnnouncements = (courseId) => {
    const queryClient = useQueryClient();

    const announcementsQuery = useQuery({
        queryKey: ['courses', courseId, 'announcements'],
        queryFn: async () => {
            const res = await courseApi.getAnnouncements(courseId);
            if (!res.success) throw res;
            return Array.isArray(res.data) ? res.data : (res.data?.items || []);
        },
        enabled: !!courseId,
    });

    const createAnnouncementMutation = useMutation({
        mutationFn: async (content) => {
            const res = await courseApi.createAnnouncement(courseId, { content });
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'announcements'] });
        },
    });

    const deleteAnnouncementMutation = useMutation({
        mutationFn: async (annoId) => {
            const res = await courseApi.deleteAnnouncement(courseId, annoId);
            if (!res.success) throw res;
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'announcements'] });
        },
    });

    return {
        announcements: announcementsQuery.data || [],
        isLoadingAnnouncements: announcementsQuery.isLoading,
        announcementsError: announcementsQuery.error,
        createAnnouncement: createAnnouncementMutation.mutateAsync,
        isCreatingAnnouncement: createAnnouncementMutation.isPending,
        deleteAnnouncement: deleteAnnouncementMutation.mutateAsync,
        isDeletingAnnouncement: deleteAnnouncementMutation.isPending,
    };
};
