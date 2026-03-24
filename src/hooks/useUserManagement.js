import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAdminApi } from '@/api/admin/user';

const normalizeUsers = (res) => {
    if (!res?.success) throw res;

    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.items)) return res.data.items;
    if (Array.isArray(res.data?.users)) return res.data.users;
    return [];
};

export const useUserManagement = () => {
    const queryClient = useQueryClient();

    const usersQuery = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const res = await userAdminApi.getAllUsersAdmin();
            return normalizeUsers(res);
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await userAdminApi.updateUser(id, data);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    const updateUserStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await userAdminApi.updateUserStatus(id, status);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ id, role }) => {
            const res = await userAdminApi.updateUserRole(id, role);
            if (!res?.success) throw res;
            return res;
        },
        onSuccess: (res, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            if (context?.onSuccess) context.onSuccess(res);
        },
        onError: (error, variables, context) => {
            if (context?.onError) context.onError(error);
        },
    });

    return {
        users: usersQuery.data || [],
        usersQuery,
        isLoadingUsers: usersQuery.isLoading,
        usersError: usersQuery.error,

        updateUser: (id, data, options = {}) => updateUserMutation.mutate({ id, data }, options),
        updateUserStatus: (id, status, options = {}) => updateUserStatusMutation.mutate({ id, status }, options),
        updateUserRole: (id, role, options = {}) => updateUserRoleMutation.mutate({ id, role }, options),

        isUpdatingUser: updateUserMutation.isPending,
        isUpdatingUserStatus: updateUserStatusMutation.isPending,
        isUpdatingUserRole: updateUserRoleMutation.isPending,
    };
};
