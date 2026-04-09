import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/user/notification';

const DEFAULT_LIMIT = 6;
const DEFAULT_POLL_INTERVAL = 20000;

const normalizeNotifications = (res, fallbackPage = 1, fallbackLimit = DEFAULT_LIMIT) => {
    const payload = res?.data || {};
    const notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
    const unreadCount = Number(payload.unreadCount || 0);
    const pagination = payload.pagination || {
        page: fallbackPage,
        limit: fallbackLimit,
        total: notifications.length,
        totalPages: notifications.length > 0 ? 1 : 0,
    };

    return {
        notifications,
        unreadCount,
        pagination,
    };
};

export const useNotifications = ({ limit = DEFAULT_LIMIT, enabled = true, pollInterval = DEFAULT_POLL_INTERVAL } = {}) => {
    const queryClient = useQueryClient();

    const listQuery = useInfiniteQuery({
        queryKey: ['notifications', limit],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const res = await notificationApi.getNotifications({ page: pageParam, limit });
            if (!res.success) throw res;
            return normalizeNotifications(res, pageParam, limit);
        },
        getNextPageParam: (lastPage) => {
            const currentPage = Number(lastPage?.pagination?.page || 1);
            const totalPages = Number(lastPage?.pagination?.totalPages || 1);
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        refetchInterval: enabled ? pollInterval : false,
        refetchIntervalInBackground: true,
        enabled,
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id) => {
            const res = await notificationApi.markAsRead(id);
            if (!res.success) throw res;
            return res;
        },
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const res = await notificationApi.markAllAsRead();
            if (!res.success) throw res;
            return res;
        },
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const removeNotificationMutation = useMutation({
        mutationFn: async (id) => {
            const res = await notificationApi.deleteNotification(id);
            if (!res.success) throw res;
            return res;
        },
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const allPages = listQuery.data?.pages || [];
    const mergedNotifications = allPages.flatMap((pageData) => pageData.notifications || []);
    const dedupedNotifications = [];
    const seenIds = new Set();

    mergedNotifications.forEach((item) => {
        const id = String(item?._id || '');
        if (!id || seenIds.has(id)) return;
        seenIds.add(id);
        dedupedNotifications.push(item);
    });

    const firstPage = allPages[0] || null;

    return {
        notifications: dedupedNotifications,
        unreadCount: firstPage?.unreadCount || 0,
        pagination: firstPage?.pagination,
        isLoadingNotifications: listQuery.isLoading,
        isRefetchingNotifications: listQuery.isFetching,
        notificationsError: listQuery.error,
        refetchNotifications: listQuery.refetch,
        fetchNextNotifications: listQuery.fetchNextPage,
        hasNextNotifications: listQuery.hasNextPage,
        isFetchingNextNotifications: listQuery.isFetchingNextPage,
        markAsRead: markAsReadMutation.mutateAsync,
        isMarkingAsRead: markAsReadMutation.isPending,
        markAllAsRead: markAllAsReadMutation.mutateAsync,
        isMarkingAllAsRead: markAllAsReadMutation.isPending,
        removeNotification: removeNotificationMutation.mutateAsync,
        isRemovingNotification: removeNotificationMutation.isPending,
    };
};
