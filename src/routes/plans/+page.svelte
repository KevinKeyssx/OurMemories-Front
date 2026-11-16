<script lang="ts">
	import { memoriesStore }    from '$lib/store.svelte';
	import LandingHeader        from '$lib/components/landing/LandingHeader.svelte';
	import PlansSection         from '$lib/components/landing/PlansSection.svelte';
	import CtaSection           from '$lib/components/landing/CtaSection.svelte';


    const firstRelationPath: string = memoriesStore.groups[ 0 ]?.path_name || 'pareja';
</script>

<svelte:head>
	<title>Planes y Precios - OurMemories</title>
	<meta name="description" content="Conoce los planes y Legacy Packs de OurMemories. Espacios privados para guardar tus mejores recuerdos e historias." />
</svelte:head>

<div class="min-h-screen bg-brand-paper dark:bg-dark-paper text-brand-ink dark:text-dark-ink selection:bg-purple-500/25 selection:text-purple-400 transition-colors duration-500 relative overflow-hidden font-sans">
	<!-- Luces Ambientales Moradas, Violetas y Doradas -->
	<div class="fixed top-0 left-1/2 -translate-x-1/2 w-275 h-150 bg-linear-to-b from-purple-600/25 via-fuchsia-500/15 to-transparent blur-3xl pointer-events-none -z-10"></div>
	<div class="fixed top-1/3 -left-48 w-112.5 h-112.5 bg-purple-700/20 dark:bg-purple-600/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
	<div class="fixed bottom-1/4 -right-48 w-125 h-125 bg-violet-600/20 dark:bg-violet-500/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
	<div class="fixed top-2/3 left-1/3 w-100 h-100 bg-amber-500/15 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

	<!-- 1. Header de Navegación Flotante -->
	<LandingHeader {firstRelationPath} />

	<!-- 2. Sección Principal de Planes y Legacy Packs -->
	<div class="pt-24 sm:pt-28">
		<PlansSection {firstRelationPath} />
	</div>

	<!-- 3. Llamado a la Acción Final (CTA) y Pie de Página -->
	<CtaSection {firstRelationPath} />
</div>