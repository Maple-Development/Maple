<script lang="ts">
	import { Button } from 'm3-svelte';
	import { Card } from 'm3-svelte';
	import { goto } from '$app/navigation';
	import { createLibrary } from '$lib/library';
</script>

<div class="flex min-h-[70vh] flex-col items-center justify-center px-6 py-8">
	<div class="w-full max-w-3xl space-y-10">
		<div class="flex flex-col items-center gap-6">
			<div class="bg-primary-container text-on-primary-container rounded-[2rem] p-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3z"
					/>
				</svg>
			</div>
			<h1 class="text-center text-4xl font-bold tracking-tight">Welcome to Maple</h1>
			<p class="text-on-surface-variant max-w-xl text-center text-lg leading-relaxed">
				Your personal music library, beautifully organized. Upload your collection and let Maple
				sort everything into albums, artists, and playlists.
			</p>
			<Button variant="filled" onclick={() => createLibrary()}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					class="mr-2"
				>
					<path
						fill="currentColor"
						d="M6 20q-.825 0-1.412-.587T4 18v-2q0-.425.288-.712T5 15t.713.288T6 16v2h12v-2q0-.425.288-.712T19 15t.713.288T20 16v2q0 .825-.587 1.413T18 20zm5-12.15L9.125 9.725q-.3.3-.712.288T7.7 9.7q-.275-.3-.288-.7t.288-.7l3.6-3.6q.15-.15.325-.212T12 4.425t.375.063t.325.212l3.6 3.6q.3.3.288.7t-.288.7q-.3.3-.712.313t-.713-.288L13 7.85V15q0 .425-.288.713T12 16t-.712-.288T11 15z"
					/>
				</svg>
				Upload Your Library
			</Button>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Card variant="filled">
				<div class="flex h-full flex-col items-center gap-4 px-4 py-6">
					<div class="bg-primary-container text-on-primary-container rounded-2xl p-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								><path
									fill="currentColor"
									d="M18 11h-2q-.425 0-.712-.288T15 10t.288-.712T16 9h2V7q0-.425.288-.712T19 6t.713.288T20 7v2h2q.425 0 .713.288T23 10t-.288.713T22 11h-2v2q0 .425-.288.713T19 14t-.712-.288T18 13zm-9 1q-1.65 0-2.825-1.175T5 8t1.175-2.825T9 4t2.825 1.175T13 8t-1.175 2.825T9 12m-8 6v-.8q0-.85.438-1.562T2.6 14.55q1.55-.775 3.15-1.162T9 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T17 17.2v.8q0 .825-.587 1.413T15 20H3q-.825 0-1.412-.587T1 18"
								/></svg
							>
						</svg>
					</div>
					<h2 class="text-center text-xl font-semibold">Create Account</h2>
					<p class="text-on-surface-variant flex-grow text-center text-sm">
						Track your listening history, connect with friends, and sync across devices.
					</p>
					<Button variant="tonal" onclick={() => goto('/register')}>Get Started</Button>
				</div>
			</Card>

			<Card variant="outlined">
				<div class="flex h-full flex-col items-center gap-4 px-4 py-6">
					<div class="bg-secondary-container text-on-secondary-container rounded-2xl p-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M12 21v-2h7V5h-7V3h7q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm-2-4l-1.375-1.45l2.55-2.55H3v-2h8.175l-2.55-2.55L10 7l5 5z"
							/></svg
						>
					</div>
					<h2 class="text-center text-xl font-semibold">Sign In</h2>
					<p class="text-on-surface-variant flex-grow text-center text-sm">
						Already have an account? Pick up right where you left off.
					</p>
					<Button variant="outlined" onclick={() => goto('/login')}>Login</Button>
				</div>
			</Card>
		</div>
	</div>
</div>

<style></style>
