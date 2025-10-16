import { SERVER } from '$lib/api/server';
import type { Actions } from './$types';
import { UserInfo, SavedUser } from '$lib/store';
import { get } from 'svelte/store';
import type { User } from '$lib/types';

export const actions = {
	default: async (event) => {
		const { request } = event;
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		const response = await fetch(`${SERVER}/login`, {
            headers: {
                'Content-Type': 'application/json'
            },
			method: 'POST',
			body: JSON.stringify({ username, password })
		});
        const data = await response.json();
        const returnName = data.user.username;
		const id = data.user.id;
        UserInfo.set({ username: returnName, id: id });

        const response2 = await fetch(`${SERVER}/get/user/${get(UserInfo)?.id}`, {
            credentials: 'include',
            method: 'GET'
        });
        const data2 = await response2.json();

        const returnUser: User = {
            id: data2.id,
            username: data2.username,
            name: data2.name,
            pfp: data2.pfp ? `data:image/png;base64,${data2.pfp}` : null
        };

        if (response2.ok) {
            SavedUser.set(returnUser);
        }

        if (data.status === 'Success') {
            return { success: true };
        }
        return { success: false, error: data.error };
	}
} satisfies Actions;