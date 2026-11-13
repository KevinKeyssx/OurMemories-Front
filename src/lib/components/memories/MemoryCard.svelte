<script lang="ts">
	import { Lock, Images, ArrowUpRight, Clock, ShieldCheck, Edit3, Trash2 } from '@lucide/svelte';

    import type { MemoryEntity }    from '$lib/types';
	import { memoriesStore }        from '$lib/store.svelte';
	import Tooltip                  from '$lib/components/shared/Tooltip.svelte';

	interface Props {
		memory          : MemoryEntity;
		relationPath    : string;
		momentsCount?   : number;
		color?          : string;
		layoutMode?     : 'carousel' | 'grid';
		onUnlock?       : ( memory: MemoryEntity ) => void;
		onEdit?         : ( memory: MemoryEntity ) => void;
		onDelete?       : ( memory: MemoryEntity ) => void;
	}

	let {
		memory,
		relationPath,
		momentsCount = 0,
		color        = '#f43f5e',
		layoutMode   = 'carousel',
		onUnlock,
		onEdit,
		onDelete
	}: Props = $props();

	const isUnlocked = $derived<boolean>( !memory.password || memoriesStore.isMemoryUnlocked( memory.id ) );
	const memoryRemainingSeconds = $derived<number | undefined>(
		memoriesStore.getMemoryRemainingSeconds( memory.id )
	);

	const canManage = $derived<boolean>(
		memoriesStore.currentUser.role === 'super_admin' ||
		memoriesStore.currentUser.role === 'admin' ||
		Boolean( memory.created_by && memory.created_by === memoriesStore.currentUser.id )
	);


    function handleClick( e: MouseEvent ): void {
		if ( memory.password && !isUnlocked ) {
			e.preventDefault();
			if ( onUnlock ) {
				onUnlock( memory );
			}
		}
	}


    function handleEdit( e: MouseEvent ): void {
		e.preventDefault();

        e.stopPropagation();

        if ( onEdit ) {
			onEdit( memory );
		}
	}


    function handleDelete( e: MouseEvent ): void {
		e.preventDefault();

        e.stopPropagation();

        if ( onDelete ) {
			onDelete( memory );
		}
	}
</script>

<a
	href={`/dashboard/${ relationPath }/memory/${ memory.id }`}
	onclick={ handleClick }
	class="group relative flex flex-col justify-between h-64 { layoutMode === 'grid' ? 'w-full' : 'w-72 shrink-0' } rounded-3xl overflow-hidden border border-stone-200/60 dark:border-white/10 bg-white/70 dark:bg-dark-card/70 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] p-5 select-none"
>
	<!-- Imagen de fondo con superposición suave -->
	{#if memory.cover_url}
		<img
			src={ memory.cover_url }
			alt={ memory.title }
			class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 { memory.password && !isUnlocked ? 'blur-md brightness-90 dark:brightness-75' : 'brightness-95 dark:brightness-75' }"
		/>
		<!-- Gradiente para legibilidad de texto sobre imagen (suave en light mode, profundo en dark mode) -->
		<div class="absolute inset-0 bg-linear-to-t from-black/50 via-black/15 to-transparent dark:from-black/85 dark:via-black/35 dark:to-black/20"></div>
	{:else}
		<div class="absolute inset-0 bg-linear-to-tr from-brand-accent/20 via-purple-500/15 to-pink-500/15 dark:from-brand-accent/30 dark:via-purple-500/20 dark:to-pink-500/30"></div>
		<!-- Suave viñeta en lugar de bloque negro -->
		<div class="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent dark:from-black/60 dark:via-black/25 dark:to-transparent"></div>
	{/if}

	<!-- Insignias Superiores -->
	<div class="relative z-10 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-black/30 dark:bg-black/50 backdrop-blur-md border border-white/20 shadow-xs">
				<Images size={ 13 } />
				<span>{ momentsCount } momentos</span>
			</span>

			{#if memory.timer}
				<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 bg-black/30 dark:bg-amber-950/60 backdrop-blur-md border border-amber-400/30 { isUnlocked && memoryRemainingSeconds !== undefined ? 'animate-pulse' : '' }">
					<Clock size={ 12 } />
					{#if isUnlocked && memoryRemainingSeconds !== undefined}
						<span>{ memoryRemainingSeconds }s</span>
					{:else}
						<span>{ memory.timer }s</span>
					{/if}
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-1.5">
			{#if canManage}
				<Tooltip text="Editar memoria">
					<button
						type="button"
						onclick={ handleEdit }
						class="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 dark:bg-black/50 hover:bg-black/50 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shadow-xs"
						aria-label="Editar memoria"
					>
						<Edit3 size={ 13 } />
					</button>
				</Tooltip>

				<Tooltip text="Eliminar memoria">
					<button
						type="button"
						onclick={ handleDelete }
						class="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 dark:bg-black/50 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 backdrop-blur-md border border-white/20 hover:border-rose-500/40 transition-all active:scale-95 cursor-pointer shadow-xs"
						aria-label="Eliminar memoria"
					>
						<Trash2 size={ 13 } />
					</button>
				</Tooltip>
			{/if}

			{#if memory.password}
				<div class="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-md text-amber-400 border border-white/20">
					{#if isUnlocked}
						<ShieldCheck size={ 15 } class="text-emerald-400" />
					{:else}
						<Lock size={ 15 } />
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Información Inferior de la Memoria -->
	<div class="relative z-10 space-y-1 text-white">
		<div class="flex items-center justify-between">
			<h3
				class="text-lg font-extrabold tracking-tight line-clamp-1 group-hover:brightness-125 transition-all drop-shadow-sm"
				style="color: { color };"
			>
				{ memory.title }
			</h3>

            <ArrowUpRight size={ 18 } class="text-white/80 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all drop-shadow-xs" />
		</div>

		{#if memory.description}
			<p class="text-xs text-white/90 line-clamp-2 leading-relaxed drop-shadow-xs">
				{ memory.description }
			</p>
		{/if}
	</div>
</a>
