<script lang="ts">
	import { Film } from '@lucide/svelte';

	interface RelationShowcaseItem {
		id          : string;
		name        : string;
		icon        : string;
		color       : string;
		tagline     : string;
		memoryTitle : string;
		description : string;
		imageUrl    : string;
		stats       : string;
		quote       : string;
	}

	const relationShowcase: RelationShowcaseItem[] = [
		{
			id          : 'pareja',
			name        : 'Pareja',
			icon        : '❤️',
			color       : '#f43f5e',
			tagline     : 'Vuestro rincón privado para celebrar cada capítulo juntos.',
			memoryTitle : 'Viaje a la Costa y Atardeceres',
			description : 'Nuestra primera escapada a la playa, cartas secretas y la lista de canciones que no pararon de sonar.',
			imageUrl    : 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
			stats       : '24 Recuerdos • 3 Cápsulas activas',
			quote       : '“Prométeme que cada año volveremos a mirar el atardecer aquí.”'
		},
		{
			id          : 'familia',
			name        : 'Familia',
			icon        : '🏡',
			color       : '#8b5cf6',
			tagline     : 'El árbol genealógico de vivencias, risas y consejos inolvidables.',
			memoryTitle : 'Almuerzos de Domingo y Recetas del Abuelo',
			description : 'Grabaciones con anécdotas de los abuelos, fotos de cumpleaños y el paso a paso de las recetas tradicionales.',
			imageUrl    : 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
			stats       : '48 Recuerdos • 4 Generaciones',
			quote       : '“El secreto de la salsa no se escribe en un papel, se cocina juntos.”'
		},
		{
			id          : 'amigos',
			name        : 'Amigos',
			icon        : '🎒',
			color       : '#06b6d4',
			tagline     : 'Viajes, anécdotas locas y momentos que solo ustedes entienden.',
			memoryTitle : 'Roadtrip a las Montañas del Sur',
			description : 'Tres días de campamento, videos de cuando se voló la carpa y notas de voz con risas a las 3 a.m.',
			imageUrl    : 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
			stats       : '32 Recuerdos • 6 Integrantes',
			quote       : '“Lo que pasa en el campamento... se queda guardado para siempre en OurMemories.”'
		},
		{
			id          : 'mascotas',
			name        : 'Mascotas',
			icon        : '🐾',
			color       : '#f59e0b',
			tagline     : 'El registro de amor más leal y puro de cuatro patas.',
			memoryTitle : 'El Primer Año de Milo',
			description : 'Desde su primer día mordiendo zapatillas hasta sus carreras en el parque. Cada ladrido y alegría.',
			imageUrl    : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
			stats       : '19 Recuerdos • 1 Año de aventuras',
			quote       : '“No hablan nuestro idioma, pero llenan nuestras vidas de amor infinito.”'
		}
	];

	let activeRelationId = $state<string>( 'pareja' );
	const currentRelation = $derived<RelationShowcaseItem>(
		relationShowcase.find( ( r: RelationShowcaseItem ) => r.id === activeRelationId ) || relationShowcase[ 0 ]
	);
</script>

<section id="organizacion" class="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-28">
	<div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
		<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
			<span>Organización Natural</span>
		</div>

        <h2 class="text-3xl sm:text-5xl font-black tracking-tight text-purple-950 dark:text-white">
			Organizado tal como funciona tu vida
		</h2>

        <p class="text-base sm:text-lg text-purple-900/80 dark:text-purple-200">
			Tres pasos sencillos para estructurar tus recuerdos más valiosos sin mezclar mundos ni audiencias.
		</p>
	</div>

	<!-- Selector Interactivo de Pestañas de Relaciones -->
	<div class="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
		{#each relationShowcase as rel (rel.id)}
			<button
				type="button"
				onclick={ () => ( activeRelationId = rel.id ) }
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-sm active:scale-95 { activeRelationId === rel.id ? 'text-white scale-105 shadow-md' : 'bg-white/90 dark:bg-dark-card text-purple-900 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-purple-200/70 dark:border-purple-500/25' }"
				style={ activeRelationId === rel.id ? `background-color: ${ rel.color }; box-shadow: 0 8px 25px -4px ${ rel.color }66;` : '' }
			>
				<span>{ rel.icon }</span>

                <span>{ rel.name }</span>
			</button>
		{/each}
	</div>

	<!-- Tarjeta de Demostración Dinámica de la Relación Seleccionada -->
	<div
		class="rounded-3xl p-6 sm:p-10 bg-white/90 dark:bg-dark-card border shadow-2xl backdrop-blur-xl mb-16 transition-all duration-500"
		style="border-color: { currentRelation.color }45; box-shadow: 0 25px 60px -15px { currentRelation.color }30;"
	>
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
			<div class="lg:col-span-6 space-y-4">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style="background-color: { currentRelation.color }18; color: { currentRelation.color }; border: 1px solid { currentRelation.color }33;">
					<span>{ currentRelation.icon } Espacio { currentRelation.name }</span>
				</div>

				<h3 class="text-2xl sm:text-3xl font-black text-purple-950 dark:text-white">
					{ currentRelation.memoryTitle }
				</h3>

				<p class="text-sm sm:text-base text-purple-900/80 dark:text-purple-200 leading-relaxed">
					{ currentRelation.description }
				</p>

				<div class="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-500/20">
					<p class="text-xs sm:text-sm font-serif italic text-purple-950 dark:text-purple-100 leading-relaxed">
						{ currentRelation.quote }
					</p>
				</div>

				<div class="flex items-center gap-4 pt-2 text-xs font-semibold text-purple-800/70 dark:text-purple-300/70">
					<span>{ currentRelation.stats }</span>
					<span>•</span>
					<span class="text-emerald-500 font-bold">Totalmente Privado</span>
				</div>
			</div>

			<div class="lg:col-span-6">
				<div class="relative rounded-3xl overflow-hidden shadow-2xl aspect-16/10 border border-white/20 group">
					<img
						src={ currentRelation.imageUrl }
						alt={ currentRelation.memoryTitle }
						class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>

                    <div class="absolute inset-0 bg-linear-to-t from-purple-950/80 via-purple-950/20 to-transparent"></div>

                    <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
						<div>
							<span class="text-sm font-extrabold drop-shadow-sm">{ currentRelation.name }</span>

                            <p class="text-[11px] text-purple-100/90">{ currentRelation.tagline }</p>
						</div>

                        <div class="size-10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md bg-purple-900/40 border border-white/30 shadow-md">
							<Film size={ 18 } />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Los 3 Pasos Explicados con Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Paso 1 -->
		<div class="p-6 rounded-3xl bg-white/90 dark:bg-dark-card border border-purple-200/60 dark:border-purple-500/20 shadow-md space-y-3">
			<div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center">
				1
			</div>

            <h4 class="text-base font-extrabold text-purple-950 dark:text-white">Crea tus Relaciones</h4>

            <p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
				Separa tus mundos sin mezclar audiencias. Crea espacios independientes para pareja, familia, amigos o mascotas e invita únicamente a quienes forman parte de esa historia.
			</p>
		</div>

		<!-- Paso 2 -->
		<div class="p-6 rounded-3xl bg-white/90 dark:bg-dark-card border border-purple-200/60 dark:border-purple-500/20 shadow-md space-y-3">
			<div class="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black text-sm flex items-center justify-center">
				2
			</div>

            <h4 class="text-base font-extrabold text-purple-950 dark:text-white">Agrupa tus Memorias</h4>

            <p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
				Organiza tus capítulos: un viaje, un aniversario o el primer año de un hijo. Cada memoria funciona como un álbum vivo donde todos los invitados pueden aportar recuerdos.
			</p>
		</div>

		<!-- Paso 3 -->
		<div class="p-6 rounded-3xl bg-white/90 dark:bg-dark-card border border-purple-200/60 dark:border-purple-500/20 shadow-md space-y-3">
			<div class="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center">
				3
			</div>

            <h4 class="text-base font-extrabold text-purple-950 dark:text-white">Guarda cada Momento</h4>

            <p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
				Sube fotos, videos, notas de voz, música de fondo y dedicatorias. El reverso de cada tarjeta guarda tus palabras como una carta escrita detrás de una foto física.
			</p>
		</div>
	</div>
</section>
