<script lang="ts">
	import { Lock, Images, ArrowUpRight, Clock, ShieldCheck } from '@lucide/svelte';
	import type { MemoryEntity } from '$lib/types';
	import { memoriesStore } from '$lib/store.svelte';

	interface Props {
		memory        : MemoryEntity;
		relationPath  : string;
		momentsCount ?: number;
		onUnlock     ?: ( memory: MemoryEntity ) => void;
	}

	let {
		memory,
		relationPath,
		momentsCount = 0,
		onUnlock
	}: Props = $props();

	let isManuallyUnlocked = $state<boolean>( false );
	const isUnlockedSession = $derived<boolean>( !memory.password || isManuallyUnlocked );

	function handleClick( e: MouseEvent ): void {
		if ( memory.password && !isUnlockedSession ) {
			e.preventDefault();
			if ( onUnlock ) {
				onUnlock( memory );
			}
		}
	}
</script>

<a
	href={`/dashboard/${ relationPath }/memory/${ memory.id }`}
	onclick={handleClick}
	class="group relative flex flex-col justify-between h-64 w-72 shrink-0 rounded-3xl overflow-hidden border border-stone-200/60 dark:border-white/10 bg-white/70 dark:bg-dark-card/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] p-5 select-none"
>
	<!-- Imagen de fondo con superposición suave -->
	{#if memory.cover_url}
		<img
			src={ memory.cover_url }
			alt={ memory.title }
			class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 { memory.password && !isUnlockedSession ? 'blur-md brightness-75' : 'brightness-90 dark:brightness-75' }"
		/>
	{:else}
		<div class="absolute inset-0 bg-gradient-to-tr from-brand-accent/30 via-purple-500/20 to-pink-500/30"></div>
	{/if}

	<!-- Gradiente para legibilidad de texto -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20"></div>

	<!-- Insignias Superiores -->
	<div class="relative z-10 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-black/40 backdrop-blur-md border border-white/15">
				<Images size={ 13 } />
				<span>{ momentsCount } momentos</span>
			</span>

			{#if memory.timer}
				<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 bg-amber-950/60 backdrop-blur-md border border-amber-400/30">
					<Clock size={ 12 } />
					<span>{ memory.timer }s</span>
				</span>
			{/if}
		</div>

		{#if memory.password}
			<div class="w-8 h-8 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-amber-400 border border-white/20">
				{#if isUnlockedSession}
					<ShieldCheck size={ 15 } class="text-emerald-400" />
				{:else}
					<Lock size={ 15 } />
				{/if}
			</div>
		{/if}
	</div>

	<!-- Información Inferior de la Memoria -->
	<div class="relative z-10 space-y-1 text-white">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-extrabold tracking-tight line-clamp-1 group-hover:text-brand-accent transition-colors">
				{ memory.title }
			</h3>
			<ArrowUpRight size={ 18 } class="text-white/60 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
		</div>

		{#if memory.description}
			<p class="text-xs text-white/70 line-clamp-2 leading-relaxed">
				{ memory.description }
			</p>
		{/if}
	</div>
</a>
