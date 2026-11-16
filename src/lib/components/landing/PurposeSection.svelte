<script lang="ts">
	import { XCircle, FolderHeart, CheckCircle2 } from '@lucide/svelte';
</script>

<section id="proposito" class="py-16 sm:py-24 bg-purple-50/40 dark:bg-[#120822] border-y border-purple-200/60 dark:border-purple-500/20 backdrop-blur-md scroll-mt-28">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4">
			<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/25">
				<span>Propósito & Filosofía</span>
			</div>
			<h2 class="text-3xl sm:text-5xl font-black tracking-tight text-purple-950 dark:text-white">
				Un refugio digital para tus vínculos más importantes
			</h2>
			<p class="text-base sm:text-lg text-purple-900/80 dark:text-purple-200 leading-relaxed">
				Las redes sociales están hechas para exhibir; las carpetas compartidas en la nube se sienten frías y técnicas. <span class="font-bold text-purple-950 dark:text-white">OurMemories nace en el punto medio:</span> un lugar cálido, privado y diseñado con cuidado para preservar la historia de tus relaciones.
			</p>
		</div>

		<!-- Triada Comparativa de Valor -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Tarjeta 1: Redes Sociales -->
			<div class="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/20 shadow-md flex flex-col justify-between space-y-5">
				<div class="space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
						<XCircle size={ 24 } />
					</div>
					<h3 class="text-lg font-extrabold text-purple-950 dark:text-white">Redes Sociales</h3>
					<p class="text-xs sm:text-sm text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Hechas para la validación pública, el scroll infinito y algoritmos que deciden qué ves. Tus recuerdos se pierden entre anuncios y personas que apenas conoces.
					</p>
				</div>
				<div class="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
					<span>❌ Ruido, likes y pérdida de intimidad</span>
				</div>
			</div>

			<!-- Tarjeta 2: Nube Técnica -->
			<div class="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-dark-card border border-purple-200/70 dark:border-purple-500/20 shadow-md flex flex-col justify-between space-y-5">
				<div class="space-y-3">
					<div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
						<FolderHeart size={ 24 } />
					</div>
					<h3 class="text-lg font-extrabold text-purple-950 dark:text-white">Carpetas en la Nube</h3>
					<p class="text-xs sm:text-sm text-purple-900/75 dark:text-purple-300/80 leading-relaxed">
						Útiles para documentos de oficina, pero frías para tus recuerdos. Nombres como <code class="text-[11px] bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 px-1.5 py-0.5 rounded font-mono">IMG_8932.JPG</code> sin dedicatorias, sin emoción y sin contexto.
					</p>
				</div>
				<div class="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
					<span>⚠️ Técnicas, desordenadas y sin alma</span>
				</div>
			</div>

			<!-- Tarjeta 3: OurMemories (Destacada en Púrpura y Dorado) -->
			<div
				class="p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-5 text-white transform md:-translate-y-2"
				style="background: linear-gradient(135deg, #240d42 0%, #3e145c 50%, #561845 100%); border: 1px solid rgba(251, 191, 36, 0.45); box-shadow: 0 20px 45px -10px rgba(124, 58, 237, 0.45);"
			>
				<div class="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

				<div class="space-y-3 relative z-10">
					<div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style="background: linear-gradient(135deg, #fbbf24 0%, #e11d48 100%);">
						<CheckCircle2 size={ 24 } class="text-white" />
					</div>
					<div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30">
						<span>Tu Santuario Digital</span>
					</div>
					<h3 class="text-xl font-extrabold text-white">OurMemories</h3>
					<p class="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
						Tú decides quién entra, qué se ve y cuándo se desbloquea cada momento. Con cartas manuscritas al reverso, canciones de fondo, notas de voz y modo cine en pantalla completa.
					</p>
				</div>

				<div class="text-[11px] font-bold text-amber-300 flex items-center gap-1 pt-2 border-t border-white/10 relative z-10">
					<span>✨ 100% íntimo, seguro y colaborativo</span>
				</div>
			</div>
		</div>
	</div>
</section>
