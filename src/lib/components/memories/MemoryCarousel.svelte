<script lang="ts">
	import { FolderPlus, Layers } from '@lucide/svelte';
	import type { MemoryEntity, MomentEntity } from '$lib/types';
	import MemoryCard from './MemoryCard.svelte';

	interface Props {
		memories        : MemoryEntity[];
		relationPath    : string;
		moments         : MomentEntity[];
		onOpenCreate    : () => void;
		onUnlockMemory ?: ( memory: MemoryEntity ) => void;
	}

	let {
		memories,
		relationPath,
		moments,
		onOpenCreate,
		onUnlockMemory
	}: Props = $props();

	function getMomentsCount( memoryId: string ): number {
		return moments.filter( ( m: MomentEntity ) => m.memory_id === memoryId ).length;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
				<Layers size={ 18 } />
			</div>
			<div>
				<h3 class="text-base font-extrabold tracking-tight">Memorias</h3>
				<p class="text-[11px] text-stone-400 font-medium">Colecciones temáticas de momentos</p>
			</div>
		</div>

		<button
			type="button"
			onclick={onOpenCreate}
			class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 hover:border-brand-accent text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-brand-accent transition-all active:scale-95 cursor-pointer"
		>
			<FolderPlus size={ 14 } />
			<span>Nueva Memoria</span>
		</button>
	</div>

	<!-- Carrusel / Fila con Scroll Horizontal Suave -->
	<div class="flex items-center gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-2 px-2">
		<!-- Tarjeta de Acción Rápida para Crear Memoria -->
		<button
			type="button"
			onclick={onOpenCreate}
			class="group flex flex-col items-center justify-center h-64 w-60 shrink-0 rounded-3xl border-2 border-dashed border-stone-200 dark:border-white/10 hover:border-brand-accent/50 bg-stone-50/50 dark:bg-white/1 hover:bg-brand-accent/5 transition-all duration-300 p-6 text-center space-y-3 cursor-pointer"
		>
			<div class="w-12 h-12 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
				<FolderPlus size={ 22 } />
			</div>
			<div>
				<p class="text-xs font-bold text-stone-800 dark:text-stone-200">Crear Memoria</p>
				<p class="text-[10px] text-stone-400 mt-0.5">Agrupa momentos en un capítulo especial</p>
			</div>
		</button>

		{#each memories as memory (memory.id)}
			<MemoryCard
				{memory}
				{relationPath}
				momentsCount={getMomentsCount( memory.id )}
				onUnlock={onUnlockMemory}
			/>
		{/each}
	</div>
</div>

