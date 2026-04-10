import { apiAxios } from '@/api/rootApi.js';

export const notificationApi = {
	getNotifications: async (params) => {
		return await apiAxios({
			method: 'get',
			url: '/api/notifications',
			params,
		});
	},

	markAllAsRead: async () => {
		return await apiAxios({
			method: 'patch',
			url: '/api/notifications/read-all',
		});
	},

	markAsRead: async (id) => {
		return await apiAxios({
			method: 'patch',
			url: `/api/notifications/${id}/read`,
		});
	},

	deleteNotification: async (id) => {
		return await apiAxios({
			method: 'delete',
			url: `/api/notifications/${id}`,
		});
	},
};
