<script lang="ts">
	import { memoriesStore }    from '$lib/store.svelte';
	import LandingHeader        from '$lib/components/landing/LandingHeader.svelte';
	import HeroSection          from '$lib/components/landing/HeroSection.svelte';
	import FunctionsSection     from '$lib/components/landing/FunctionsSection.svelte';
	import PurposeSection       from '$lib/components/landing/PurposeSection.svelte';
	import OrganizationSection  from '$lib/components/landing/OrganizationSection.svelte';
	import InnovationSection    from '$lib/components/landing/InnovationSection.svelte';
	import PlansSection         from '$lib/components/landing/PlansSection.svelte';
	import CtaSection           from '$lib/components/landing/CtaSection.svelte';


	const firstRelationPath: string = memoriesStore.groups[ 0 ]?.path_name || 'pareja';
</script>

<svelte:head>
	<title>OurMemories - Donde los recuerdos se guardan, no se publican</title>
</svelte:head>

<div class="min-h-screen bg-brand-paper dark:bg-dark-paper text-brand-ink dark:text-dark-ink selection:bg-purple-500/25 selection:text-purple-400 transition-colors duration-500 relative overflow-hidden font-sans">
	<!-- Luces Ambientales Moradas, Violetas y Doradas -->
	<div class="fixed top-0 left-1/2 -translate-x-1/2 w-275 h-150 bg-linear-to-b from-purple-600/25 via-fuchsia-500/15 to-transparent blur-3xl pointer-events-none -z-10"></div>
	<div class="fixed top-1/3 -left-48 w-112.5 h-112.5 bg-purple-700/20 dark:bg-purple-600/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
	<div class="fixed bottom-1/4 -right-48 w-125 h-125 bg-violet-600/20 dark:bg-violet-500/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
	<div class="fixed top-2/3 left-1/3 w-100 h-100 bg-amber-500/15 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

	<!-- 1. Header de Navegación Flotante -->
	<LandingHeader {firstRelationPath} />

	<!-- 2. Hero Section: Pantalla Completa Exacta (100dvh) -->
	<HeroSection {firstRelationPath} />

	<!-- 3. Funciones: Bento Grid Enriquecido (Fotos, Videos, Dedicatorias, Audio, Cápsulas) -->
	<FunctionsSection />

	<!-- 4. Propósito: ¿Qué es OurMemories? vs Redes vs Nube -->
	<PurposeSection />

	<!-- 5. Organización: Pestañas de Relaciones y 3 Pasos Clave -->
	<OrganizationSection />

	<!-- 6. Innovación: Modo Cine, Cápsulas, Banda Sonora, Privacidad -->
	<InnovationSection />

	<!-- 7. Planes y Precios: Suscripciones y Legacy Packs -->
	<PlansSection {firstRelationPath} />

	<!-- 8. Llamado a la Acción Final (CTA) y Pie de Página -->
	<CtaSection {firstRelationPath} />
</div>
