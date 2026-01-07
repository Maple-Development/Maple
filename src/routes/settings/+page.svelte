<script lang="ts">
    import { Card, Button } from 'm3-svelte';
    import { isLoggedIn, UserInfo, SavedUser } from '$lib/store';

    let name = $state('');
    let initialName = $state('');
    let webhookEnabled = $state(false);
    let initialWebhookEnabled = $state(false);
    let webhookUrl = $state('');
    let initialWebhookUrl = $state('');
    let discordRpcEnabled = $state(false);
    let initialDiscordRpcEnabled = $state(false);
    $effect(() => {
        name = $UserInfo?.name ?? '';
        initialName = $UserInfo?.name ?? '';
    });

    let hasChanges = $derived(
        name !== initialName ||
            webhookEnabled !== initialWebhookEnabled ||
            webhookUrl !== initialWebhookUrl ||
            discordRpcEnabled !== initialDiscordRpcEnabled
    );
</script>

<div class="flex w-full justify-center px-4 py-12">
    <div class="flex w-full max-w-6xl flex-col gap-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex flex-col gap-1">
                <p class="text-xs uppercase tracking-[0.16em] text-on-surface-variant">Settings</p>
                <h1 class="text-4xl font-black">Account</h1>
                <p class="text-sm text-on-surface-variant">Manage your Maple account.</p>
            </div>
            <Button
                variant="filled"
                disabled={!hasChanges}
            >
                Save changes
            </Button>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <section class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <div class="flex flex-col gap-1">
                        <p class="text-xs uppercase tracking-[0.16em] text-on-surface-variant">Profile</p>
                        <p class="text-sm text-on-surface-variant">Update how your account appears.</p>
                    </div>
                </div>

                <Card variant="outlined" class="flex flex-col gap-6 p-6">
                    <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div class="relative flex items-center justify-center">
                            {#if $SavedUser?.pfp}
                                <img src={$SavedUser?.pfp} alt="Profile" class="h-28 w-28 rounded-full object-cover ring-2 ring-primary/20" />
                            {:else}
                                <div class="flex h-28 w-28 items-center justify-center rounded-full bg-surface-container-high ring-2 ring-surface-container-high">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><path fill="currentColor" d="M9.775 12q-.9 0-1.5-.675T7.8 9.75l.325-2.45q.2-1.425 1.3-2.363T12 4t2.575.938t1.3 2.362l.325 2.45q.125.9-.475 1.575t-1.5.675zM4 18v-.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2v.8q0 .825-.587 1.413T18 20H6q-.825 0-1.412-.587T4 18"/></svg>
                                </div>
                            {/if}
                            <button type="button" class="absolute -bottom-3 flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary ring-1 ring-outline shadow-md hover:bg-surface-container-high">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8 17h8v-.55q0-1.125-1.1-1.787T12 14t-2.9.663T8 16.45zm4-4q.825 0 1.413-.587T14 11t-.587-1.412T12 9t-1.412.588T10 11t.588 1.413T12 13m-8 8q-.825 0-1.412-.587T2 19V7q0-.825.588-1.412T4 5h3.15L9 3h6l1.85 2H20q.825 0 1.413.588T22 7v12q0 .825-.587 1.413T20 21zm0-2h16V7h-4.05l-1.825-2h-4.25L8.05 7H4zm8-6"/></svg>                        Change photo
                            </button>
                        </div>

                        <div class="flex flex-1 flex-col gap-4">
                            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div class="flex items-center gap-3">
                                    <h2 class="text-2xl font-bold">{$UserInfo?.username ?? 'Guest'}</h2>
                                    <span class={`rounded-full px-3 py-1 text-xs font-semibold ${$isLoggedIn ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                        {$isLoggedIn ? 'Signed in' : 'Not signed in'}
                                    </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div class="flex h-full flex-col justify-center gap-2 rounded-xl bg-surface-container-high p-4">
                                    <p class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Display name (optional)</p>
                                    <input
                                        type="text"
                                        bind:value={name}
                                        placeholder="Add a display name"
                                        class="w-full rounded-lg bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant/70 ring-1 ring-outline focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div class="flex h-full flex-col justify-center gap-1 rounded-xl bg-surface-container-high p-4">
                                    <p class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Username</p>
                                    <p class="text-lg font-semibold text-on-surface">{$UserInfo?.username ?? 'Not set'}</p>
                                </div>
                                <div class="flex h-full flex-col justify-center gap-1 rounded-xl bg-surface-container-high p-4 sm:col-span-2">
                                    <p class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Account ID</p>
                                    <p class="text-lg font-semibold text-on-surface">{$UserInfo?.id ?? 'Not available'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <section class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <div class="flex flex-col gap-1">
                        <p class="text-xs uppercase tracking-[0.16em] text-on-surface-variant">Preferences</p>
                        <p class="text-sm text-on-surface-variant">Manage your account preferences.</p>
                    </div>
                </div>

                <Card variant="outlined" class="flex flex-col gap-6 p-6">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4 ring-1 ring-outline/50">
                            <div class="flex flex-col gap-1">
                                <p class="text-xs uppercase font-semibold tracking-wide text-on-surface">Webhook Settings</p>
                            </div>
                            <div class="flex flex-col gap-4">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex flex-col gap-1">
                                        <p class="text-sm font-semibold text-on-surface-variant">Enable Webhooks</p>
                                        <p class="text-xs text-on-surface-variant">Send data to a chosen webhook service</p>
                                    </div>
                                    <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                        <input type="checkbox" class="peer sr-only" bind:checked={webhookEnabled} />
                                        <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                        <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                    </label>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <div class="flex flex-col gap-2">
                                        <div class="flex flex-col gap-1">
                                            <p class="text-sm font-semibold text-on-surface-variant">Webhook URL</p>
                                            <p class="text-xs text-on-surface-variant">Webhook URL to automatically send to. Currently supports Discord webhooks. If left blank, nothing will be sent.</p>
                                        </div>
                                        <input
                                            type="url"
                                            bind:value={webhookUrl}
                                            placeholder="https://discord.com/api/webhooks/..."
                                            class="w-full rounded-lg bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant/70 ring-1 ring-outline focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4 ring-1 ring-outline/50">
                            <div class="flex flex-col gap-1">
                                <p class="text-xs uppercase font-semibold tracking-wide text-on-surface">Discord Settings</p>
                            </div>
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex flex-col gap-1">
                                    <p class="text-sm font-semibold text-on-surface-variant">Enable Discord RPC</p>
                                    <p class="text-xs text-on-surface-variant">Show what you're listening to in Discord</p>
                                </div>
                                <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                    <input type="checkbox" class="peer sr-only" bind:checked={discordRpcEnabled} />
                                    <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                    <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
        </div>


        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex flex-col gap-1">
                <h1 class="text-4xl font-black">App Settings</h1>
                <p class="text-sm text-on-surface-variant">Additional options that change the way the app works.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <section class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <div class="flex flex-col gap-1">
                        <p class="text-xs uppercase tracking-[0.16em] text-on-surface-variant">Preferences</p>
                        <p class="text-sm text-on-surface-variant">Manage your app preferences.</p>
                    </div>
                </div>

                <Card variant="outlined" class="flex flex-col gap-6 p-6">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4 ring-1 ring-outline/50">
                            <div class="flex flex-col gap-1">
                                <p class="text-xs uppercase font-semibold tracking-wide text-on-surface">Network Settings</p>
                            </div>
                            <div class="flex flex-col gap-4">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex flex-col gap-1">
                                        <p class="text-sm font-semibold text-on-surface-variant">Enable P2P Transfers</p>
                                        <p class="text-xs text-on-surface-variant">Allow you to transfer your library to other devices via peer-to-peer connections.</p>
                                    </div>
                                    <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                        <input type="checkbox" class="peer sr-only" bind:checked={webhookEnabled} />
                                        <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                        <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                    </label>
                                </div>
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex flex-col gap-1">
                                        <p class="text-sm font-semibold text-on-surface-variant">Enable Socket.io Communication</p>
                                        <p class="text-xs text-on-surface-variant">Allow you to communicate with the server in real-time via socket.io.</p>
                                    </div>
                                    <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                        <input type="checkbox" class="peer sr-only" bind:checked={webhookEnabled} />
                                        <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                        <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4 ring-1 ring-outline/50">
                            <div class="flex flex-col gap-1">
                                <p class="text-xs uppercase font-semibold tracking-wide text-on-surface">Library Settings</p>
                            </div>
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex flex-col gap-1">
                                    <p class="text-sm font-semibold text-on-surface-variant">Enable Jellyfin Support</p>
                                    <p class="text-xs text-on-surface-variant">Allows for importing libraries in the jellyfin format.</p>
                                </div>
                                <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                    <input type="checkbox" class="peer sr-only" bind:checked={discordRpcEnabled} />
                                    <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                    <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            <section class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <div class="flex flex-col gap-1">
                        <p class="text-xs uppercase tracking-[0.16em] text-on-surface-variant">Developer</p>
                        <p class="text-sm text-on-surface-variant">Developer options for advanced users.</p>
                    </div>
                </div>

                <Card variant="outlined" class="flex flex-col gap-6 p-6">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-3 rounded-xl bg-surface-container-high p-4 ring-1 ring-outline/50">
                            <div class="flex flex-col gap-1">
                                <p class="text-xs uppercase font-semibold tracking-wide text-on-surface">Advanced Settings</p>
                            </div>
                            <div class="flex flex-col gap-4">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex flex-col gap-1">
                                        <p class="text-sm font-semibold text-on-surface-variant">Enable Logging</p>
                                        <p class="text-xs text-on-surface-variant">Save logs to a file for debugging purposes.</p>
                                    </div>
                                    <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                        <input type="checkbox" class="peer sr-only" bind:checked={webhookEnabled} />
                                        <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                        <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                    </label>
                                </div>
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex flex-col gap-1">
                                        <p class="text-sm font-semibold text-on-surface-variant">Enable Developer Mode</p>
                                        <p class="text-xs text-on-surface-variant">Enable developer mode for advanced users.</p>
                                    </div>
                                    <label class="relative inline-flex h-6 w-11 cursor-pointer items-center">
                                        <input type="checkbox" class="peer sr-only" bind:checked={webhookEnabled} />
                                        <div class="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary/90"></div>
                                        <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition peer-checked:translate-x-5"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    </div>
</div>