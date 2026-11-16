<script lang="ts">
	import {
		Heart,
		Music,
		Mic,
		Volume2,
		Clock,
		Play,
		Pause,
		RotateCw,
		Sparkles,
		Video,
		FileText,
		CheckCircle2
	} from '@lucide/svelte';


    let isDedicationFlipped = $state<boolean>( false );
	let isVideoPlaying      = $state<boolean>( false );
	let isAudioPlaying      = $state<boolean>( false );
</script>

<section id="funciones" class="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-28">
	<!-- Encabezado de la Sección -->
	<div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
		<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/25">
			<Sparkles size={ 13 } class="text-amber-500" />
			<span>Formatos que Emocionan</span>
		</div>

        <h2 class="text-3xl sm:text-5xl font-black tracking-tight text-purple-950 dark:text-white">
			Tus momentos no son simples archivos
		</h2>

        <p class="text-base sm:text-lg text-purple-900/80 dark:text-purple-200">
			Fotos con cartas al reverso, videos que cobran vida, notas de voz con risas reales y cápsulas que aguardan el momento perfecto.
		</p>
	</div>

	<!-- Bento Grid de Funciones Principales -->
	<div class="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
		<!-- 1. Tarjeta: Fotografía con Banda Sonora (6 cols) -->
		<div class="md:col-span-6 rounded-3xl p-5 sm:p-6 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/10 backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/40 transition-all duration-500 flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2.5">
						<span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs bg-rose-500/15 text-rose-500">
							❤️
						</span>

                        <div>
							<h4 class="text-xs font-extrabold text-purple-950 dark:text-white">Fotografías con Banda Sonora</h4>

                            <p class="text-[10px] text-purple-800/70 dark:text-purple-300/70">Música de fondo sincronizada</p>
						</div>
					</div>

                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20">
						<Heart size={ 10 } class="fill-current" />

                        <span>Íntimo</span>
					</span>
				</div>

				<div class="relative rounded-2xl overflow-hidden mb-4 shadow-md aspect-16/10">
					<img
						src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
						alt="Momento especial"
						class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>

                    <div class="absolute inset-0 bg-linear-to-t from-purple-950/80 via-transparent to-transparent"></div>

                    <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
						<span class="text-xs font-bold drop-shadow-sm">El atardecer en el faro</span>

                        <span class="inline-flex items-center gap-1.5 text-[10px] bg-purple-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-purple-400/30">
							<Music size={ 11 } class="text-amber-400 animate-pulse" />

                            <span>Coldplay • Yellow</span>
						</span>
					</div>
				</div>

				<p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed mb-4">
					Asocia cualquier tema de YouTube o audio ambiental a cada foto para que, al abrirla, la melodía te transporte de inmediato al día en que se tomó.
				</p>
			</div>

			<div class="p-3.5 rounded-2xl bg-amber-500/8 dark:bg-amber-400/8 border border-amber-500/25">
				<p class="text-xs sm:text-sm font-serif italic text-purple-950 dark:text-purple-100 border-l-2 border-amber-500 pl-3 leading-relaxed">
					“Prométeme que sin importar cuántos años pasen, siempre volveremos a sentarnos en esta misma roca a mirar el mar.”
				</p>
			</div>
		</div>

		<!-- 2. Tarjeta: Videos Inolvidables en Alta Resolución (6 cols) -->
		<div class="md:col-span-6 rounded-3xl p-5 sm:p-6 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/10 backdrop-blur-xl relative overflow-hidden group hover:border-violet-500/40 transition-all duration-500 flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2.5">
						<span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs bg-purple-500/15 text-purple-600 dark:text-purple-400">
							<Video size={ 16 } />
						</span>

                        <div>
							<h4 class="text-xs font-extrabold text-purple-950 dark:text-white">Videos en Movimiento</h4>

                            <p class="text-[10px] text-purple-800/70 dark:text-purple-300/70">Revive gestos, risas y miradas vivas</p>
						</div>
					</div>

                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20">
						<span>0:45 min • 4K</span>
					</span>
				</div>

				<div class="relative rounded-2xl overflow-hidden mb-4 shadow-md aspect-16/10 bg-purple-950/80">
					<img
						src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
						alt="Video de amigos"
						class="w-full h-full object-cover transition-transform duration-700 { isVideoPlaying ? 'scale-105 brightness-105' : 'group-hover:scale-105 opacity-90' }"
					/>

                    <div class="absolute inset-0 bg-linear-to-t from-purple-950/80 via-transparent to-purple-950/30"></div>

					<!-- Botón Play Central -->
					<div class="absolute inset-0 flex items-center justify-center">
						<button
							type="button"
							onclick={ () => ( isVideoPlaying = !isVideoPlaying ) }
							class="size-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95"
							style="background: linear-gradient(135deg, #fbbf24 0%, #e11d48 50%, #7c3aed 100%); box-shadow: 0 10px 25px -4px rgba(225, 29, 72, 0.6);"
							aria-label={ isVideoPlaying ? 'Pausar video' : 'Reproducir video' }
						>
							{#if isVideoPlaying}
								<Pause size={ 22 } class="fill-current" />
							{:else}
								<Play size={ 22 } class="fill-current ml-1" />
							{/if}
						</button>
					</div>

					<div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
						<span>Roadtrip a las montañas del sur</span>
						<span class="text-[10px] font-mono bg-purple-950/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-purple-400/30">
							{ isVideoPlaying ? 'Reproduciendo...' : 'Pausado' }
						</span>
					</div>
				</div>

				<p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed mb-4">
					Guarda videos de celebraciones, viajes y anécdotas espontáneas. Con soporte para pantalla completa, control de audio y reproducción sin pérdida de calidad.
				</p>
			</div>

			<div class="flex items-center gap-2 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-500/20 text-xs font-semibold text-purple-900 dark:text-purple-200">
				<CheckCircle2 size={ 16 } class="text-emerald-500 shrink-0" />
				<span>Sin límites de compresión agresiva ni marcas de agua.</span>
			</div>
		</div>

		<!-- 3. Tarjeta: Dedicatorias Interactivas - El Reverso de la Foto (7 cols) -->
		<div class="md:col-span-7 rounded-3xl p-5 sm:p-6 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/10 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-2.5">
						<span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs bg-amber-500/15 text-amber-600 dark:text-amber-400">
							<FileText size={ 16 } />
						</span>

                        <div>
							<h4 class="text-xs font-extrabold text-purple-950 dark:text-white">Dedicatorias al Reverso</h4>

                            <p class="text-[10px] text-purple-800/70 dark:text-purple-300/70">Como escribir detrás de una foto física</p>
						</div>
					</div>

					<!-- Botón para voltear la tarjeta -->
					<button
						type="button"
						onclick={ () => ( isDedicationFlipped = !isDedicationFlipped ) }
						class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 hover:bg-amber-500/25 transition-all cursor-pointer active:scale-95 shadow-xs"
					>
						<RotateCw size={ 12 } class="transition-transform duration-500 { isDedicationFlipped ? 'rotate-180 text-rose-500' : '' }" />
						<span>{ isDedicationFlipped ? 'Ver Foto Frontal' : 'Voltear Dedicatoria' }</span>
					</button>
				</div>

				<!-- Contenedor con efecto postal interactiva -->
				<div class="relative rounded-2xl overflow-hidden mb-4 shadow-md aspect-16/10 border border-purple-200/60 dark:border-purple-500/20">
					{#if !isDedicationFlipped}
						<!-- Vista Frontal: Fotografía con marca de agua sutil -->
						<img
							src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80"
							alt="Almuerzo de Domingo"
							class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>

                        <div class="absolute inset-0 bg-linear-to-t from-purple-950/80 via-transparent to-transparent"></div>

                        <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
							<span class="text-xs font-bold drop-shadow-sm">Almuerzo de domingo con la familia</span>

                            <span class="text-[10px] bg-amber-500/80 text-white font-extrabold px-2 py-0.5 rounded-full">
								Tiene Dedicatoria ✍️
							</span>
						</div>
					{:else}
						<!-- Vista Reverso: Carta Manuscrita Cálida -->
						<div class="w-full h-full p-5 sm:p-6 bg-linear-to-br from-[#fffdfa] via-[#fefaf0] to-[#fcf4e3] dark:from-[#1b0d30] dark:via-[#160928] dark:to-[#110522] flex flex-col justify-between text-left border-2 border-dashed border-amber-400/40">
							<div class="space-y-2">
								<div class="flex items-center justify-between text-[11px] font-mono text-amber-700/80 dark:text-amber-400/80 border-b border-amber-300/40 pb-1.5">
									<span>📍 Santiago, Chile</span>

                                    <span>18 de Octubre, 2024</span>
								</div>

                                <h5 class="text-sm font-bold text-purple-950 dark:text-white">Para toda la familia:</h5>

                                <p class="text-xs sm:text-sm font-serif italic text-purple-950/90 dark:text-purple-100 leading-relaxed">
									“El secreto de las mejores tardes nunca estuvo en lo que cocinamos, sino en las risas alrededor de la mesa y las historias del abuelo que repetimos año tras año con el mismo cariño.”
								</p>
							</div>

							<div class="flex items-center justify-between text-[10px] text-purple-800/70 dark:text-purple-300/70 pt-2 border-t border-amber-300/30">
								<span>Escrito por: <strong class="text-purple-950 dark:text-white">Mamá</strong></span>

                                <span class="italic text-amber-600 dark:text-amber-400 font-serif">Con todo mi amor ♥</span>
							</div>
						</div>
					{/if}
				</div>

				<p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
					En el mundo físico solíamos dar vuelta las fotos para escribir detrás quiénes estaban y qué sentimos ese día. En OurMemories cada recuerdo tiene su propio reverso para cartas manuscritas y palabras sinceras.
				</p>
			</div>

			<div class="mt-4 pt-3 border-t border-purple-100 dark:border-purple-500/20 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
				<span>Tip: Toca el botón superior para dar vuelta la tarjeta</span>

                <RotateCw size={ 14 } class="animate-spin" style="animation-duration: 8s;" />
			</div>
		</div>

		<!-- 4. Tarjeta Columna Derecha: Notas de Voz + Cápsulas (5 cols) -->
		<div class="md:col-span-5 flex flex-col justify-between gap-6">
			<!-- Sub-tarjeta: Nota de Voz -->
			<div class="rounded-3xl p-5 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/10 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<div class="size-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
							<Mic size={ 16 } />
						</div>

                        <div>
							<h4 class="text-xs font-bold text-purple-950 dark:text-white">Nota de Voz Inolvidable</h4>

                            <p class="text-[10px] text-purple-800/70 dark:text-purple-300/70">Mamá contando una anécdota</p>
						</div>
					</div>

                    <span class="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
						1:42 min
					</span>
				</div>

				<div class="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-500/20 mb-3">
					<button
						type="button"
						onclick={ () => ( isAudioPlaying = !isAudioPlaying ) }
						class="size-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer hover:bg-purple-700 transition-colors"
						aria-label={ isAudioPlaying ? 'Pausar audio' : 'Reproducir audio' }
					>
						{#if isAudioPlaying}
							<Pause size={ 13 } class="fill-current" />
						{:else}
							<Volume2 size={ 13 } />
						{/if}
					</button>

					<div class="flex-1 flex items-end gap-1 h-5 px-1">
						<span class="w-1 bg-purple-500 rounded-full h-2 { isAudioPlaying ? 'animate-pulse' : '' }"></span>
						<span class="w-1 bg-purple-500 rounded-full h-4 { isAudioPlaying ? 'animate-pulse' : '' }" style="animation-delay: 150ms;"></span>
						<span class="w-1 bg-purple-500 rounded-full h-3 { isAudioPlaying ? 'animate-pulse' : '' }" style="animation-delay: 300ms;"></span>
						<span class="w-1 bg-purple-500 rounded-full h-5 { isAudioPlaying ? 'animate-pulse' : '' }" style="animation-delay: 100ms;"></span>
						<span class="w-1 bg-purple-500 rounded-full h-2"></span>
						<span class="w-1 bg-purple-500 rounded-full h-4 { isAudioPlaying ? 'animate-pulse' : '' }" style="animation-delay: 250ms;"></span>
						<span class="w-1 bg-purple-500 rounded-full h-3"></span>
						<span class="w-1 bg-purple-500 rounded-full h-1"></span>
					</div>
				</div>

				<p class="text-[11px] text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
					Porque la voz de quienes amas es el recuerdo más valioso con el paso de los años. Graba audios directamente o adjunta notas de voz.
				</p>
			</div>

			<!-- Sub-tarjeta: Cápsula del Tiempo -->
			<div class="rounded-3xl p-5 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/10 backdrop-blur-xl relative overflow-hidden hover:border-amber-500/40 transition-all flex-1 flex flex-col justify-between">
				<div class="flex items-center justify-between mb-3">
					<span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
						<Clock size={ 14 } />
						<span>Cápsula del Tiempo</span>
					</span>

                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25">
						Sellada
					</span>
				</div>

				<div class="space-y-1 my-2">
					<h5 class="text-sm font-extrabold text-purple-950 dark:text-white">Mensaje para nuestro 5° Aniversario</h5>

                    <p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Guardado con fotos y videos inéditos que no podrán abrirse hasta la fecha programada.
					</p>
				</div>

				<div class="pt-2 border-t border-purple-100 dark:border-purple-500/20 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
					<span>Desbloqueo en:</span>
					<span class="font-mono bg-amber-500/10 px-2.5 py-1 rounded-xl">42 días 14h 22m</span>
				</div>
			</div>
		</div>
	</div>
</section>
