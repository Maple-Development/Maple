<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { UserManager } from '$lib/api/UserManager';
    import { Input } from "$lib/components/ui/input/index.js";
    import { onMount } from 'svelte';
    import { UserInfo } from '$lib/store';
    import { Switch } from "$lib/components/ui/switch/index.js";
    import UserSettings from '$lib/preferences/usersettings';
    import { Settings } from '$lib/preferences/fetch';
    import { toast } from 'svelte-sonner';

    let webhookSettings = new Settings('webhook');

    let doWebhooks = true;
    let webhookUrl = "";

    let authenticated = false;
    $: authenticated = authenticated;

    onMount(async () => {
        const authenticatedS = await UserManager.isLoggedIn();
        authenticated = authenticatedS.isAuthenticated;
        webhookUrl = UserSettings.webhook.url;
        doWebhooks = UserSettings.webhook.enabled == "true";
    });

    UserInfo.subscribe(async (value) => {
        if (value) {
            const islogOut = await UserManager.isLoggedIn();
            authenticated = islogOut.isAuthenticated;
        }
    })


    function updateSettings() {
        console.log(doWebhooks);
        webhookSettings.set('enabled', doWebhooks.toString());
        if (webhookUrl != "") {
            webhookSettings.set('url', webhookUrl);
        } else {
            webhookSettings.set('url', UserSettings.webhook.url);
        }
        toast.success("Settings updated, refreshing now.");
        window.location.reload();
    }

</script>

{#await UserManager.isLoggedIn() then user}

{#if !authenticated}

<h1 class="text-5xl text-center mt-10 font-black">
    You are not logged in!
</h1>

<Button href="/account/login" class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary">
    Login
</Button>

{:else}

<h1 class="text-5xl text-center mt-10 font-black">
    Preferences
</h1>

<div class="flex flex-col md:mx-[30%] mx-[10%] justify-center mt-10">
    <h2 class="text-4xl font-black mt-5">Webhook Options</h2>

    <div class="flex items-center space-x-2 mt-5">
        <Switch bind:checked={doWebhooks} id="webhooks" class="text-muted hover:text-black"/>
        <label for="webhooks">Enable Webhooks</label>
    </div>
    <p class="text-muted text-xs">Enables sending data to a chosen webhook</p>

    <div class="flex items-center space-x-2 mt-5">
        <Input bind:value={webhookUrl} class="text-muted" placeholder="Ex: https://discord.com/api/webhooks/13292141241482912/HCAg7pewfwfewF_wefcQxOGN6ZAMDewfwfwfbIAawefhLz"/>
    </div>
    <p class="text-muted text-xs">Webhook URL to automatically send to. (Currently, the only supported service is Discord) [If left blank, the community webhook will be used.]</p>
</div>

<div class="flex flex-col md:mx-[30%] mx-[10%] justify-center mt-5">
   <!--  <h2 class="text-4xl font-black mt-5">Manage Profile</h2>
    <p class="text-muted mt-2">Change Display Name</p>
    <Input class="text-muted" placeholder="Display name"/>

    <p class="text-muted mt-2">Change Profile Picture</p>
    <Input type="file" accept="image/*" class="text-muted"/> -->
</div>

<div class="flex flex-col md:mx-[30%] mx-[10%] justify-center mt-5 mb-20">
    <!-- <h2 class="text-4xl font-black mt-5">Manage Profile</h2>
    <p class="text-muted mt-2">Change Display Name</p>
    <Input class="text-muted" placeholder="Display name"/>

    <p class="text-muted mt-2">Change Profile Picture</p>
    <Input type="file" accept="image/*" class="text-muted"/>
 -->
    <Button on:click={updateSettings} class="py-6 px-4 mx-2 text-white mt-4" variant="secondary">Submit</Button>
</div>

{/if}

{/await}

