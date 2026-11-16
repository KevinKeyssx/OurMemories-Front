<script lang="ts">
	import { Film, Clock, Music, ShieldCheck, ArrowRight } from '@lucide/svelte';
</script>

<section id="innovacion" class="py-16 sm:py-24 bg-purple-50/50 dark:bg-[#100720] border-t border-purple-200/60 dark:border-purple-500/20 backdrop-blur-md scroll-mt-28">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
			<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/25">
				<span>Innovación Emocional</span>
			</div>

            <h2 class="text-3xl sm:text-5xl font-black tracking-tight text-purple-950 dark:text-white">
				Mucho más que un álbum de fotos
			</h2>

            <p class="text-base sm:text-lg text-purple-900/80 dark:text-purple-200">
				Funciones diseñadas para revivir emociones auténticas y proteger tu intimidad digital.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
			<!-- Card 1: Modo Cine (6 cols) -->
			<div class="md:col-span-6 rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/5 relative overflow-hidden group hover:border-purple-500/50 transition-all flex flex-col justify-between">
				<div class="space-y-4">
					<div class="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style="background: linear-gradient(135deg, #7c3aed, #db2777);">
						<Film size={ 22 } />
					</div>

                    <div class="space-y-1">
						<span class="text-xs font-bold text-purple-600 dark:text-purple-400">Inmersión Absoluta</span>

                        <h3 class="text-xl sm:text-2xl font-black text-purple-950 dark:text-white">Modo Cine</h3>
					</div>

                    <p class="text-xs sm:text-sm text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Proyecta cualquier memoria en pantalla completa con animaciones suaves entre palabras, música ambiental sincronizada y una tira fílmica de miniaturas para disfrutar en familia o en pareja desde el sillón.
					</p>
				</div>

				<div class="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
					<span>Carrusel automático o manual con temporizador</span>

                    <ArrowRight size={ 14 } />
				</div>
			</div>

			<!-- Card 2: Cápsulas del Tiempo y Entregas Programadas (6 cols) -->
			<div class="md:col-span-6 rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/5 relative overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col justify-between">
				<div class="space-y-4">
					<div class="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style="background: linear-gradient(135deg, #fbbf24, #d97706);">
						<Clock size={ 22 } />
					</div>

                    <div class="space-y-1">
						<span class="text-xs font-bold text-amber-600 dark:text-amber-400">Expectativa y Sorpresa</span>

                        <h3 class="text-xl sm:text-2xl font-black text-purple-950 dark:text-white">Cápsulas del Tiempo</h3>
					</div>

                    <p class="text-xs sm:text-sm text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Sella un recuerdo o una galería completa para que se desbloquee en una fecha futura: un cumpleaños, un aniversario o el próximo fin de año. Genera emoción con una cuenta regresiva que no se puede abrir antes de tiempo.
					</p>
				</div>

				<div class="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
					<span>Desbloqueo automático al segundo exacto</span>

                    <ArrowRight size={ 14 } />
				</div>
			</div>

			<!-- Card 3: Banda Sonora y Notas de Voz (6 cols) -->
			<div class="md:col-span-6 rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/5 relative overflow-hidden group hover:border-rose-500/50 transition-all flex flex-col justify-between">
				<div class="space-y-4">
					<div class="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style="background: linear-gradient(135deg, #f43f5e, #be185d);">
						<Music size={ 22 } />
					</div>

                    <div class="space-y-1">
						<span class="text-xs font-bold text-rose-600 dark:text-rose-400">Audio Inmersivo</span>

                        <h3 class="text-xl sm:text-2xl font-black text-purple-950 dark:text-white">Banda Sonora & Notas de Voz</h3>
					</div>

                    <p class="text-xs sm:text-sm text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Acompaña tus momentos con la canción de YouTube que sonaba ese día, o graba un audio contando la anécdota detrás de la foto para que nunca se olvide la voz y la risa de ese instante.
					</p>
				</div>

				<div class="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
					<span>Ecualizador animado y notas de voz con onda sonora</span>

                    <ArrowRight size={ 14 } />
				</div>
			</div>

			<!-- Card 4: Privacidad Extrema y Momentos Efímeros (6 cols) -->
			<div class="md:col-span-6 rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/25 shadow-xl shadow-purple-950/5 relative overflow-hidden group hover:border-emerald-500/50 transition-all flex flex-col justify-between">
				<div class="space-y-4">
					<div class="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style="background: linear-gradient(135deg, #10b981, #059669);">
						<ShieldCheck size={ 22 } />
					</div>

                    <div class="space-y-1">
						<span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Confidencialidad Total</span>

                        <h3 class="text-xl sm:text-2xl font-black text-purple-950 dark:text-white">Privacidad a tu Medida</h3>
					</div>

                    <p class="text-xs sm:text-sm text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Protege recuerdos individuales con contraseña, define momentos efímeros con cuenta regresiva que se desintegran tras ser vistos y disfruta de un escudo anti-captura de pantalla y anti-inspección.
					</p>
				</div>

				<div class="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
					<span>Desvanecimiento Thanos y escudos activos</span>

                    <ArrowRight size={ 14 } />
				</div>
			</div>
		</div>
	</div>
</section>
