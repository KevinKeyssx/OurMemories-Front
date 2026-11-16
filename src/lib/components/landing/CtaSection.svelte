<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	interface Props {
		firstRelationPath : string;
	}

	let { firstRelationPath }: Props = $props();
</script>

<div class="w-full">
	<!-- SECCIÓN: CIERRE / LLAMADO A LA ACCIÓN FINAL (CTA BANNER MONUMENTAL) -->
	<section id="cta" class="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 scroll-mt-20">
		<div
			class="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border transition-all duration-300 bg-linear-to-br from-purple-100/90 via-white to-amber-50/80 border-purple-200/80 shadow-purple-950/10 dark:from-[#200b3b] dark:via-[#38125c] dark:to-[#581643] dark:border-amber-500/40 dark:shadow-purple-950/50"
		>
			<div class="absolute -top-24 -left-24 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/25 rounded-full blur-3xl pointer-events-none"></div>
			<div class="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-400/20 dark:bg-fuchsia-500/25 rounded-full blur-3xl pointer-events-none"></div>

			<div class="relative z-10 max-w-3xl mx-auto space-y-6">
				<div class="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-purple-200/80 dark:border-white/20 shadow-md">
					<img
						src="/logo.avif"
						alt="OurMemories"
						class="size-20 sm:size-28 object-contain drop-shadow-md select-none"
					/>
				</div>

				<h2 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-purple-950 dark:text-white">
					Tus mejores historias merecen <br class="hidden sm:inline" />
					<span class="bg-linear-to-r from-amber-500 via-rose-500 to-purple-600 dark:from-amber-300 dark:via-rose-300 dark:to-purple-300 bg-clip-text text-transparent">un lugar a su altura.</span>
				</h2>

				<p class="text-base sm:text-lg text-purple-900/80 dark:text-purple-100 max-w-xl mx-auto leading-relaxed font-normal">
					Empieza hoy gratis y construye el archivo privado de tus recuerdos más valiosos.
				</p>

				<div class="pt-4 flex flex-wrap items-center justify-center gap-4">
					<a
						href={`/dashboard/${ firstRelationPath }`}
						class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-extrabold text-white shadow-2xl hover:scale-105 active:scale-95 transition-all group"
						style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 35%, #e11d48 75%, #7c3aed 100%); box-shadow: 0 15px 35px -5px rgba(245, 158, 11, 0.45), 0 5px 20px -2px rgba(124, 58, 237, 0.35);"
					>
						<span>Crear mi cuenta en OurMemories</span>
						<ArrowRight size={ 18 } class="transition-transform group-hover:translate-x-1" />
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- FOOTER MODERNO Y ELEGANTE -->
	<footer class="border-t border-purple-200/70 dark:border-purple-500/20 bg-purple-100/30 dark:bg-[#0b0416] backdrop-blur-md py-10">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
			<div class="flex items-center gap-3">
				<img
					src="/logo.avif"
					alt="OurMemories"
					class="size-7 object-contain drop-shadow-xs"
				/>
				<span class="text-sm font-black tracking-tight text-purple-950 dark:text-white">Our<span class="italic bg-linear-to-r from-purple-600 to-amber-500 dark:from-purple-500 dark:to-amber-500 bg-clip-text text-transparent inline-block pr-1.5">Memories</span></span>
				<span class="text-xs text-purple-700/60 dark:text-purple-400/60">© 2026. Todos los derechos reservados.</span>
			</div>

			<div class="flex items-center gap-6 text-xs font-semibold text-purple-800/70 dark:text-purple-300/70">
				<span>Atesora lo que de verdad importa.</span>
			</div>
		</div>
	</footer>
</div>
