<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { title, recentlyPlayedManager } from '$lib/store';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import {
		ArrowDownZA,
		ArrowUpAZ,
		List,
		ListFilter,
		Info,
		CircleAlert,
		CircleCheck
	} from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import TrackWrapper from '$lib/components/TrackWrapper.svelte';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import type { Song } from '$lib/types/song';
	import type { Playlist } from '$lib/types/playlist';
	import { toast } from 'svelte-sonner';

	$: recentlyPlayedSongs = $recentlyPlayedManager.get();

	let tracks: Song[] = [];
	let playlists: Playlist[] = [];

	let onboard = true;
	onMount(async () => {
		tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		playlists = await OPFS.get().playlists();
		onboard = await OPFS.ifExists('tracks');
		console.log(onboard);
		title.set('Home');
	});
	import * as Command from '$lib/components/ui/command';

	let ascending = true;

	function swapAscending() {
		ascending = !ascending;
	}

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

	async function addTrackToPlaylist(track: Song, playlist: Playlist) {
		if (track && playlist) {
			OPFS.track().addToPlaylist(track, playlist);
			toast.success(`Added ${track.title} to ${playlist.name}`);
		}
	}

	let openContextMenu = false;
	let open = false;
	let selectedSong: Song | null = null;

	function openAlert(track: Song) {
		open = true;
		selectedSong = track;
	}
</script>

<div class="mt-2 flex flex-col items-center">
	{#if !onboard}
		<div class="flex flex-col items-center justify-center rounded-md p-5">
			<Alert.Root class="p-4">
				<Info class="h-4 w-4" />
				<Alert.Title>Welcome!</Alert.Title>
				<Alert.Description
					>This site allows you to upload your music library, and explore and organize your music. <br
					/>
					You can upload your music by going to settings or using the developer terminal.</Alert.Description
				>
			</Alert.Root>
		</div>
		<div class="flex flex-col items-center justify-center rounded-md p-1">
			<Alert.Root class="p-4" variant="destructive">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>Issue</Alert.Title>
				<Alert.Description
					>It seems like you are missing a library, head to <Button
						class="m-0 p-1"
						variant="link"
						href="/settings">Settings</Button
					> to add one.</Alert.Description
				>
			</Alert.Root>
		</div>
	{:else}
		<div class="justify-centerrounded-md mt-2 flex flex-col items-center">
			<Alert.Root class="p-4">
				<CircleCheck color="lime" class="h-4 w-4" />
				<Alert.Title>Done!</Alert.Title>
				<Alert.Description
					>You're all set! Head to <Button
						class="m-0 p-1 text-secondary-foreground"
						variant="link"
						href="/tracks">/tracks</Button
					> to see your full library!</Alert.Description
				>
			</Alert.Root>
		</div>
	{/if}
</div>



{#if recentlyPlayedSongs.length > 0}
	<div class="mt-5 my-5 ml-16 flex flex-col rounded-md">
		<h2 class="text-md text-left text-xl font-black">
			Recently Played:
		</h2>
	</div>
	<div
		class="my-5 ml-16 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
	>
	{#each recentlyPlayedSongs as track}
		{#if track}
		<div class="flex flex-col items-start">
			{#await getImageUrl(track.image) then image}
					<ContextMenu
						type={'track'}
						on:delete={(e) => openAlert(track)}
						on:addTrackToPlaylist={(e) => addTrackToPlaylist(track, e.detail.playlist)}
					>
					<TrackWrapper className="" {track} {tracks}>
						<Lazy height={208} keep={true}>
							<img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
						</Lazy>
					</TrackWrapper>
				</ContextMenu>
				<div class="flex flex-row items-start">
					<div class="mt-4 flex h-full flex-col items-start">
						<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{track.title}</h1>
						<h1 class="p text-base font-light leading-none text-slate-400">{track.artist}</h1>
					</div>
				</div>
			{:catch error}
				<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
			{/await}
			</div>
		{/if}
	{/each}
	</div>
{/if}

<!-- tips -->
<div class="mt-20 ml-16 flex flex-col rounded-md">
	<h2 class="text-md text-left text-xl font-black">
		Tips:
	</h2>
</div>
<Lazy keep={true}>
	<div class="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-center rounded-md p-4 md:p-8">
		<div class="mx-auto flex flex-col items-center justify-center">
			<Carousel.Root class="mt-1 w-full max-w-md px-4 md:px-8">
				<Carousel.Content>
					<Carousel.Item>
						<div class="p-1">
							<Card.Root>
								<Card.Content class="flex aspect-square flex-col items-center justify-center p-6">
									<h2 class="text-sm font-medium text-secondary-foreground">Tip #1: Filters</h2>
									<p class="text-sm font-medium text-muted-foreground">
										Filters allow you to organize the different sections of your library by various
										attributes. <br />
										(try it below!)
									</p>
									<div class="flex flex-col items-center justify-center">
										<div class="mt-4 flex h-10 w-full justify-center">
											{#if ascending}
												<Button
													class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
													on:click={() => swapAscending()}
												>
													<ArrowUpAZ size={20} color="white" />
												</Button>
											{:else}
												<Button
													class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
													on:click={() => swapAscending()}
												>
													<ArrowDownZA size={20} color="white" />
												</Button>
											{/if}
											<DropdownMenu.Root>
												<DropdownMenu.Trigger asChild let:builder>
													<Button
														class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
														builders={[builder]}
													>
														<ListFilter size={20} color="white" />
													</Button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Content class="w-56">
													<DropdownMenu.Label>Sort By</DropdownMenu.Label>
													<DropdownMenu.Separator />
													<DropdownMenu.RadioGroup>
														<DropdownMenu.RadioItem value="title">Title</DropdownMenu.RadioItem>
														<DropdownMenu.RadioItem value="artist">Artist</DropdownMenu.RadioItem>
														<DropdownMenu.RadioItem value="album">Album</DropdownMenu.RadioItem>
														<DropdownMenu.RadioItem value="year">Year</DropdownMenu.RadioItem>
														<DropdownMenu.RadioItem value="duration"
															>Duration</DropdownMenu.RadioItem
														>
													</DropdownMenu.RadioGroup>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
											<Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary">
												<List size={20} color="white" />
											</Button>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						</div>
					</Carousel.Item>
					<Carousel.Item>
						<div class="p-1">
							<Card.Root>
								<Card.Content class="flex aspect-square flex-col items-center justify-center p-6">
									<h2 class="text-sm font-medium text-secondary-foreground">Tip #2: Search</h2>
									<p class="text-sm font-medium text-muted-foreground">
										The search box is always available at the top of the screen to easily swap pages,
										or search the content on your current page! (try it below!)
									</p>
									<div class="border-1 mt-2 flex flex-col items-center justify-center rounded-sm border">
										<Command.Root class="bg-bg border-1 w-96 border-secondary-foreground">
											<Command.Input placeholder="Search for recent items, or type a page name." />
											<Command.List>
												<Command.Empty>No results found.</Command.Empty>
												<Command.Group heading="Pages">
													<Command.Item>Home</Command.Item>
													<Command.Item>Tracks</Command.Item>
													<Command.Item>Albums</Command.Item>
													<Command.Item>Playlists</Command.Item>
													<Command.Item>Artists</Command.Item>
													<Command.Item>Settings</Command.Item>
												</Command.Group>
												<Command.Separator />
												<Command.Group heading="Tracks">
													<Command.Item>bad guy</Command.Item>
													<Command.Item>i want it that way</Command.Item>
													<Command.Item>no tears left to cry</Command.Item>
												</Command.Group>
											</Command.List>
										</Command.Root>
									</div>
								</Card.Content>
							</Card.Root>
						</div>
					</Carousel.Item>
				</Carousel.Content>
				<Carousel.Previous />
				<Carousel.Next />
			</Carousel.Root>
		</div>
		<div class="mx-auto flex flex-col items-center justify-center">
			<div class="mt-5 flex flex-col items-center justify-center rounded-md bg-secondary p-5">
				<h2 class="text-sm font-medium text-secondary-foreground">Context Menus:</h2>
				<p class="text-sm font-medium text-muted-foreground">
					tip: right click on a song to open a context menu!<br />
					(try it below!)
				</p>
				<div class="flex flex-col items-center justify-center">
					<ContextMenu type={'track'}>
						<div class="mt-2 h-52 w-52 animate-pulse rounded-md bg-gray-500"></div>
					</ContextMenu>
				</div>
			</div>
		</div>
	</div>
</Lazy>