<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { onMount } from 'svelte';
    import { title, socket } from '$lib/store';
    import { toast } from 'svelte-sonner';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
    import { UserCheck, User, EllipsisVertical, AudioLines, UserPlus } from 'lucide-svelte';
    import { Separator } from "$lib/components/ui/separator";
    import { UserManager } from '$lib/api/UserManager';
    import { Input } from '$lib/components/ui/input/index.js';

    import { OPFS } from '$lib/opfs';
    import type { Song } from '$lib/types/song';
    import type { Playlist } from '$lib/types/playlist';

    let authenticated = false;
    $: authenticated = authenticated;

    let tracks: Song[] = [];
	let playlists: Playlist[] = [];
    let selectedFriend = "";

    onMount(async () => {
        const authenticatedS = await UserManager.isLoggedIn();
        if (authenticatedS !== undefined) {
            authenticated = authenticatedS.isAuthenticated;
        } else {
            authenticated = false;
        }
        tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		playlists = await OPFS.get().playlists();
		title.set('Tracks');
    });

    async function addFriend() {
        const selectedUser = await UserManager.getUserName(selectedFriend);
        $socket?.emit('addFriend', { friendId: selectedUser });
        toast.success('Friend request sent to: ' + selectedFriend);  
    }

</script>

{#if !authenticated}

<h1 class="text-5xl text-center mt-10 font-black">
    You are not logged in!
</h1>

<Button href="/account/login" class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary">
    Login
</Button>

{:else}

<h1 class="text-3xl text-center mt-10 font-black">
    Friends
</h1>

<div class="flex flex-col md:mx-[30%] mx-[10%] mt-10 border-4 rounded-lg border-border">
    <div class=" ml-2 rounded-lg my-1 mx-2">
        <div class="flex flex-col">
            <div class="flex flex-row justify-between">
                <div class="flex flex-row items-center">
                    <UserPlus size={40} class="my-auto py-2 px-2" />
                    <h2 class="text-lg inter-normal my-auto py-2">Add Friend</h2>
                    <Input bind:value={selectedFriend} placeholder="Username" class="my-auto w-48 ml-2 py-2 px-2" />
                </div>
                <div class="ml-2 flex items-center">
                    <Button on:click={() => addFriend()} class="h-10 w-10 px-1 mx-1 my-1 bg-green-700 hover:bg-green-800">
                        <UserPlus size={20} color="white" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
    <Separator class="my-2 ml-4 mr-4 w-auto" />
    <div class="flex flex-row ml-2 hover:bg-secondary rounded-lg my-1 mx-2 justify-between">
        <div class="flex flex-row">
            <User size={40} class="my-auto py-2 px-2" />
            <h2 class="text-lg inter-normal my-auto py-2">Cattn</h2>
        </div>
        <div class="ml-2 flex items-center">
            <Button class="h-10 w-10 px-1 mx-1 my-1">
                <AudioLines size={20} color="white" />
            </Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button class="h-10 w-10 bg-transparent px-1 mx-1 my-1" builders={[builder]}>
						<EllipsisVertical size={20} color="white" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Manage Friend</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Remove Friend</DropdownMenu.Item>
                    <DropdownMenu.Item>Transfer Library</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<span>Send Playlist</span>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent side="right">
							{#if playlists.length > 0}
								{#each playlists as playlist}
									<DropdownMenu.Item>
										<span>{playlist.name}</span>
									</DropdownMenu.Item>
								{/each}
							{:else}
								<DropdownMenu.Item disabled>
									<span>No Playlists</span>
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
    </div>
    <div class="flex flex-row ml-2 hover:bg-secondary rounded-lg my-1 mx-2 justify-between">
        <div class="flex flex-row">
            <User size={40} class="my-auto py-2 px-2" />
            <h2 class="text-lg inter-normal my-auto py-2">Nail</h2>
        </div>
        <div class="ml-2 flex items-center">
            <Button class="h-10 w-10 px-1 mx-1 my-1">
                <AudioLines size={20} color="white" />
            </Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button class="h-10 w-10 bg-transparent px-1 mx-1 my-1" builders={[builder]}>
						<EllipsisVertical size={20} color="white" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Label>Manage Friend</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Remove Friend</DropdownMenu.Item>
                    <DropdownMenu.Item>Transfer Library</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>
							<span>Send Playlist</span>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent side="right">
							{#if playlists.length > 0}
								{#each playlists as playlist}
									<DropdownMenu.Item>
										<span>{playlist.name}</span>
									</DropdownMenu.Item>
								{/each}
							{:else}
								<DropdownMenu.Item disabled>
									<span>No Playlists</span>
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
    </div>
    <Separator class="my-2 ml-4 mr-4 w-auto" />
    <div class="flex flex-row ml-2 hover:bg-secondary rounded-lg my-1 mx-2 justify-between">
        <div class="flex flex-row">
            <UserPlus size={40} class="my-auto py-2 px-2" />
            <h2 class="text-lg inter-normal my-auto py-2">Nail</h2>
        </div>
        <div class="ml-2 flex items-center">
            <Button class="h-10 w-10 px-1 mx-1 my-1 bg-green-700 hover:bg-green-800">
                <UserCheck size={20} color="white" />
            </Button>
        </div>
    </div>
</div>

{/if}

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
    .inter-normal {
        font-family: "Inter", serif;
        font-optical-sizing: auto;
        font-weight: 600;
        font-style: normal;
    }
</style>

