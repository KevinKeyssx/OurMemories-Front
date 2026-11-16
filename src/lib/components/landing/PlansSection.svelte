<script lang="ts">
	import {
		Sparkles,
		Check,
		Crown,
		Gift,
		Heart,
		ShieldCheck,
		ArrowRight,
		Users,
		Image,
		FolderHeart,
		Mic,
		Flame
	} from '@lucide/svelte';

	import type { BillingCycle, PlanPricingTier, LegacyGiftPack } from '$lib/types';
	import { memoriesStore } from '$lib/store.svelte';

	interface Props {
		firstRelationPath  ?: string;
	}

	let {
		firstRelationPath = 'pareja'
	}: Props = $props();

	let billingCycle = $state<BillingCycle>( 'yearly' );

	const plans: PlanPricingTier[] = [
		{
			id            : 'moment',
			name          : 'Plan Moment',
			tagline       : 'Para comenzar a atesorar lo esencial',
			monthlyPrice  : 0,
			yearlyPrice   : 0,
			badge         : 'Gratis Para Siempre',
			maxRelations  : '2 relaciones',
			maxMembers    : '3 miembros (tú + 2)',
			maxMemories   : '3 memorias / relación',
			maxMoments    : '15 momentos / memoria',
			audioDuration : 'Hasta 30 seg por audio',
			ctaText       : 'Empezar Gratis',
			colorTheme    : 'gray',
			features      : [
				{ text: 'Música de fondo (YouTube Music)', included: true },
				{ text: 'Dedicatorias y cartas ilimitadas', included: true },
				{ text: 'Chat y notificaciones en tiempo real', included: true, highlight: true },
				{ text: 'Cifrado y privacidad de recuerdos', included: true },
				{ text: 'Exportación completa en ZIP/PDF', included: false },
				{ text: 'Pases de regalo incluidos', included: false }
			]
		},
		{
			id            : 'remember',
			name          : 'Plan Remember',
			tagline       : 'El espacio ideal para tu pareja y núcleo cercano',
			monthlyPrice  : 4.99,
			yearlyPrice   : 39.99,
			isPopular     : true,
			badge         : 'Más Popular',
			maxRelations  : '7 relaciones',
			maxMembers    : '6 miembros (tú + 5)',
			maxMemories   : '20 memorias / relación',
			maxMoments    : '60 momentos / memoria',
			audioDuration : 'Hasta 2 min por audio',
			ctaText       : 'Elegir Remember',
			colorTheme    : 'purple',
			features      : [
				{ text: 'Todo lo incluido en Plan Moment', included: true },
				{ text: 'Capacidad multiplicada por 4', included: true, highlight: true },
				{ text: 'Notas de voz extendidas (2 minutos)', included: true },
				{ text: 'Soporte prioritario y copias seguras', included: true },
				{ text: 'Exportación completa en ZIP/PDF', included: false },
				{ text: 'Pases de regalo incluidos', included: false }
			]
		},
		{
			id            : 'timeless',
			name          : 'Plan Timeless',
			tagline       : 'Sin límites para tus álbumes y grandes familias',
			monthlyPrice  : 9.99,
			yearlyPrice   : 79.99,
			badge         : 'Máxima Capacidad',
			maxRelations  : '20 relaciones',
			maxMembers    : '20 miembros (tú + 19)',
			maxMemories   : 'Memorias Ilimitadas',
			maxMoments    : '150 momentos / memoria',
			audioDuration : 'Hasta 5 min por audio',
			ctaText       : 'Elegir Timeless',
			colorTheme    : 'violet',
			features      : [
				{ text: 'Todo lo incluido en Plan Remember', included: true },
				{ text: 'Memorias (álbumes) ilimitadas', included: true, highlight: true },
				{ text: 'Exportación completa de álbumes (ZIP/PDF)', included: true, highlight: true },
				{ text: 'Notas de voz de hasta 5 minutos', included: true },
				{ text: 'Calidad original sin compresión visual', included: true },
				{ text: 'Pases de regalo incluidos', included: false }
			]
		},
		{
			id            : 'infinity',
			name          : 'Infinity Memory',
			tagline       : 'Acceso total de por vida. Sin pagos recurrentes.',
			monthlyPrice  : 199,
			yearlyPrice   : 199,
			isLifetime    : true,
			lifetimePrice : 199,
			badge         : 'De Por Vida (Lifetime)',
			maxRelations  : 'Relaciones Ilimitadas',
			maxMembers    : 'Miembros Ilimitados (hasta 50)',
			maxMemories   : 'Memorias Ilimitadas',
			maxMoments    : 'Momentos Ilimitados (hasta 500)',
			audioDuration : 'Hasta 10 min por audio',
			ctaText       : 'Obtener De Por Vida',
			colorTheme    : 'gold',
			features      : [
				{ text: 'Pago único de por vida (sin mensualidades)', included: true, highlight: true },
				{ text: '3 Pases Remember gratis por 2 meses', included: true, highlight: true },
				{ text: 'Insignia oficial de Fundador en perfil', included: true, highlight: true },
				{ text: 'Temas visuales y personalización exclusiva', included: true },
				{ text: 'Exportación completa ilimitada (ZIP/PDF)', included: true },
				{ text: 'Acceso anticipado a todas las novedades', included: true }
			]
		}
	];

	const giftPacks: LegacyGiftPack[] = [
		{
			id          : 'legacy-duo',
			name        : 'Legacy Dúo',
			subtitle    : 'Pack Pareja',
			price       : 19.99,
			badge       : 'Ideal Regalo',
			passesCount : 2,
			planName    : 'Plan Remember',
			duration    : '3 meses c/u',
			description : 'Genera 2 pases canjeables del Plan Remember para disfrutar durante 3 meses completos.',
			icon        : 'couple'
		},
		{
			id          : 'legacy-5-remember',
			name        : 'Legacy 5 Remember',
			subtitle    : 'Pack Grupo o Amigos',
			price       : 34.99,
			badge       : 'Ahorro Especial',
			passesCount : 5,
			planName    : 'Plan Remember',
			duration    : '2 meses c/u',
			description : 'Genera 5 pases canjeables del Plan Remember válidos por 2 meses cada uno para todo tu círculo íntimo.',
			icon        : 'group'
		},
		{
			id          : 'legacy-5-timeless',
			name        : 'Legacy 5 Timeless',
			subtitle    : 'Pack Familia Completa',
			price       : 69.99,
			badge       : 'Pack Premium',
			passesCount : 5,
			planName    : 'Plan Timeless',
			duration    : '2 meses c/u',
			description : 'Genera 5 pases canjeables de máxima categoría (Plan Timeless) por 2 meses con exportaciones incluidas.',
			icon        : 'family'
		}
	];

	const getCtaLink = ( planId: string ): string => {
		if ( planId === 'moment' ) {
			return memoriesStore.currentUser ? `/dashboard/${ firstRelationPath }` : '/login';
		}
		return memoriesStore.currentUser
			? `/dashboard?subscribe=${ planId }&cycle=${ billingCycle }`
			: `/login?plan=${ planId }&cycle=${ billingCycle }`;
	};

	const getPackLink = ( packId: string ): string => {
		return memoriesStore.currentUser
			? `/dashboard?gift_pack=${ packId }`
			: `/login?pack=${ packId }`;
	};
</script>

<section id="planes" class="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28 relative">
	<!-- Luces y Acentos de Fondo -->
	<div class="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
	<div class="absolute bottom-16 right-8 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

	<!-- Encabezado de la Sección -->
	<div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
		<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/25 shadow-xs">
			<Sparkles size={ 13 } class="text-amber-500" />
			<span>Inversión en tus Recuerdos</span>
		</div>

		<h2 class="text-3xl sm:text-5xl font-black tracking-tight text-purple-950 dark:text-white">
			Planes diseñados para atesorar cada historia
		</h2>

		<p class="text-base sm:text-lg text-purple-900/80 dark:text-purple-200">
			Sin algoritmos, sin publicidad invasiva y con absoluta privacidad. Tus momentos más íntimos protegidos para siempre.
		</p>

		<!-- Selector Toggle de Ciclo de Facturación (Mensual / Anual) -->
		<div class="pt-4 flex items-center justify-center">
			<div class="inline-flex items-center p-1.5 rounded-2xl bg-white/80 dark:bg-dark-card border border-purple-200/80 dark:border-purple-500/30 shadow-lg shadow-purple-950/5 backdrop-blur-md">
				<button
					type="button"
					onclick={ () => { billingCycle = 'monthly'; } }
					class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer { billingCycle === 'monthly' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102' : 'text-purple-900/70 dark:text-purple-300 hover:text-purple-950 dark:hover:text-white' }"
				>
					Facturación Mensual
				</button>

				<button
					type="button"
					onclick={ () => { billingCycle = 'yearly'; } }
					class="relative px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 { billingCycle === 'yearly' ? 'bg-linear-to-r from-purple-600 to-amber-500 text-white shadow-md shadow-purple-600/30 scale-102' : 'text-purple-900/70 dark:text-purple-300 hover:text-purple-950 dark:hover:text-white' }"
				>
					<span>Facturación Anual</span>
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-purple-950 shadow-xs animate-pulse">
						<Flame size={ 10 } />
						<span>Ahorra 33%</span>
					</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Grid de los 4 Planes Principales -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-20">
		{#each plans as plan (plan.id)}
			<div
				class="rounded-3xl p-6 sm:p-7 backdrop-blur-xl transition-all duration-500 flex flex-col justify-between relative group { plan.isPopular ? 'bg-white/95 dark:bg-[#190c2e] border-2 border-purple-500/80 dark:border-purple-400 shadow-2xl shadow-purple-600/20 lg:-translate-y-2' : plan.isLifetime ? 'bg-linear-to-b from-amber-500/10 via-purple-900/10 to-purple-950/20 dark:bg-linear-to-b dark:from-[#2a1740] dark:to-[#120722] border-2 border-amber-400/70 dark:border-amber-400/50 shadow-xl shadow-amber-500/10' : 'bg-white/85 dark:bg-dark-card/90 border border-purple-200/70 dark:border-purple-500/25 shadow-lg shadow-purple-950/5 hover:border-purple-400/50' }"
			>
				<!-- Badge Superior Flotante -->
				{#if plan.badge}
					<div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
						<span
							class="px-3.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap { plan.isPopular ? 'bg-linear-to-r from-purple-600 to-amber-500 text-white' : plan.isLifetime ? 'bg-linear-to-r from-amber-400 to-amber-600 text-purple-950' : 'bg-purple-100 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-purple-500/30' }"
						>
							{#if plan.isPopular}
								<Sparkles size={ 11 } />
							{:else if plan.isLifetime}
								<Crown size={ 12 } />
							{/if}
							<span>{ plan.badge }</span>
						</span>
					</div>
				{/if}

				<!-- Encabezado de la Tarjeta -->
				<div>
					<div class="mb-4">
						<h3 class="text-xl sm:text-2xl font-black text-purple-950 dark:text-white">
							{ plan.name }
						</h3>
						<p class="text-xs text-purple-800/70 dark:text-purple-300/70 mt-1 min-h-8">
							{ plan.tagline }
						</p>
					</div>

					<!-- Visualización del Precio -->
					<div class="py-4 border-y border-purple-100 dark:border-purple-500/20 mb-6">
						{#if plan.isLifetime}
							<div class="flex items-baseline gap-1.5">
								<span class="text-4xl sm:text-5xl font-black text-purple-950 dark:text-white tracking-tight">
									${ plan.lifetimePrice }
								</span>
								<span class="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
									USD
								</span>
							</div>
							<p class="text-xs font-bold text-amber-700 dark:text-amber-300/90 mt-1">
								Pago único para toda la vida
							</p>
						{:else if plan.monthlyPrice === 0}
							<div class="flex items-baseline gap-1.5">
								<span class="text-4xl sm:text-5xl font-black text-purple-950 dark:text-white tracking-tight">
									$0
								</span>
								<span class="text-xs font-bold uppercase text-purple-700/70 dark:text-purple-300/70">
									USD
								</span>
							</div>
							<p class="text-xs font-medium text-purple-800/70 dark:text-purple-400 mt-1">
								Gratis para siempre, sin tarjeta
							</p>
						{:else}
							<div class="flex items-baseline gap-1.5">
								<span class="text-4xl sm:text-5xl font-black text-purple-950 dark:text-white tracking-tight">
									${ billingCycle === 'yearly' ? ( plan.yearlyPrice / 12 ).toFixed( 2 ) : plan.monthlyPrice.toFixed( 2 ) }
								</span>
								<span class="text-xs font-bold text-purple-800/70 dark:text-purple-300/70">
									USD / mes
								</span>
							</div>
							<p class="text-xs font-medium text-purple-800/70 dark:text-purple-400 mt-1">
								{#if billingCycle === 'yearly'}
									Facturado anualmente (${ plan.yearlyPrice } USD/año)
								{:else}
									Facturado mensualmente (${ plan.monthlyPrice } USD/mes)
								{/if}
							</p>
						{/if}
					</div>

					<!-- Métricas de Límites Clave -->
					<div class="space-y-2.5 mb-6 text-xs font-semibold text-purple-950 dark:text-purple-100">
						<div class="flex items-center gap-2">
							<Users size={ 14 } class="text-purple-600 dark:text-purple-400 shrink-0" />
							<span>{ plan.maxRelations }</span>
						</div>
						<div class="flex items-center gap-2">
							<Heart size={ 14 } class="text-rose-500 shrink-0" />
							<span>{ plan.maxMembers }</span>
						</div>
						<div class="flex items-center gap-2">
							<FolderHeart size={ 14 } class="text-purple-600 dark:text-purple-400 shrink-0" />
							<span>{ plan.maxMemories }</span>
						</div>
						<div class="flex items-center gap-2">
							<Image size={ 14 } class="text-amber-500 shrink-0" />
							<span>{ plan.maxMoments }</span>
						</div>
						<div class="flex items-center gap-2">
							<Mic size={ 14 } class="text-purple-600 dark:text-purple-400 shrink-0" />
							<span>{ plan.audioDuration }</span>
						</div>
					</div>

					<!-- Lista de Funciones y Beneficios -->
					<div class="space-y-2.5 mb-6 pt-4 border-t border-purple-100 dark:border-purple-500/20">
						<p class="text-[11px] font-black uppercase tracking-wider text-purple-800/60 dark:text-purple-400/60">
							Lo que incluye:
						</p>
						<ul class="space-y-2 text-xs">
							{#each plan.features as feature (feature.text)}
								<li class="flex items-start gap-2">
									{#if feature.included}
										<div class="size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 { feature.highlight ? 'bg-amber-400/25 text-amber-600 dark:text-amber-400' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400' }">
											<Check size={ 11 } strokeWidth={ 3 } />
										</div>
										<span class="{ feature.highlight ? 'font-bold text-purple-950 dark:text-amber-300' : 'text-purple-900/80 dark:text-purple-200' }">
											{ feature.text }
										</span>
									{:else}
										<div class="size-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-stone-200/50 dark:bg-white/5 text-stone-400 dark:text-stone-500">
											<span class="text-[10px] leading-none">✕</span>
										</div>
										<span class="text-purple-900/40 dark:text-purple-400/40 line-through">
											{ feature.text }
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Botón de Llamada a la Acción -->
				<div class="pt-4">
					<a
						href={ getCtaLink( plan.id ) }
						class="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-md { plan.isPopular ? 'bg-linear-to-r from-purple-600 to-amber-500 text-white shadow-purple-600/30 hover:scale-102 hover:shadow-lg' : plan.isLifetime ? 'bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-purple-950 shadow-amber-500/25 hover:scale-102 hover:shadow-lg' : 'bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-950 dark:text-white border border-purple-200 dark:border-purple-500/30' }"
					>
						<span>{ plan.ctaText }</span>
						<ArrowRight size={ 14 } />
					</a>
				</div>
			</div>
		{/each}
	</div>

	<!-- SECCIÓN DE PACKS DE REGALO: LEGACY PACKS -->
	<div class="pt-10 border-t border-purple-200/70 dark:border-purple-500/25">
		<div class="text-center max-w-3xl mx-auto mb-10 space-y-3">
			<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 shadow-xs">
				<Gift size={ 13 } />
				<span>Legacy Packs • Compra Única</span>
			</div>
			<h3 class="text-2xl sm:text-4xl font-black tracking-tight text-purple-950 dark:text-white">
				Regala OurMemories: Pases Canjeables
			</h3>
			<p class="text-sm sm:text-base text-purple-900/80 dark:text-purple-200">
				Paquetes de compra única que generan códigos y enlaces de regalo para obsequiar planes a tu pareja, familia o amigos sin suscripciones recurrentes.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each giftPacks as pack (pack.id)}
				<div class="rounded-3xl p-6 sm:p-7 bg-white/85 dark:bg-dark-card/90 border border-purple-200/70 dark:border-purple-500/25 shadow-lg shadow-purple-950/5 backdrop-blur-xl relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between">
					<!-- Acento superior de color -->
					<div class="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-purple-600 via-amber-400 to-purple-600"></div>

					<div>
						<div class="flex items-center justify-between mb-4">
							<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
								{ pack.badge }
							</span>
							<span class="text-xs font-bold text-purple-700 dark:text-purple-300">
								{ pack.subtitle }
							</span>
						</div>

						<h4 class="text-xl font-black text-purple-950 dark:text-white">
							{ pack.name }
						</h4>

						<div class="my-4 py-3 border-y border-purple-100 dark:border-purple-500/20">
							<div class="flex items-baseline gap-1.5">
								<span class="text-3xl font-black text-purple-950 dark:text-white">
									${ pack.price }
								</span>
								<span class="text-xs font-bold uppercase text-purple-700/70 dark:text-purple-300/70">
									USD pago único
								</span>
							</div>
							<p class="text-xs font-extrabold text-purple-800 dark:text-purple-200 mt-1">
								Incluye { pack.passesCount } pases de { pack.planName } ({ pack.duration })
							</p>
						</div>

						<p class="text-xs text-purple-900/75 dark:text-purple-300/80 leading-relaxed mb-6">
							{ pack.description }
						</p>
					</div>

					<a
						href={ getPackLink( pack.id ) }
						class="w-full py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/70 dark:hover:bg-purple-900 text-purple-950 dark:text-white border border-purple-200 dark:border-purple-500/30 transition-all duration-300 active:scale-95 group-hover:bg-linear-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:text-white group-hover:border-transparent"
					>
						<Gift size={ 14 } />
						<span>Comprar { pack.name }</span>
					</a>
				</div>
			{/each}
		</div>
	</div>

	<!-- GARANTÍAS Y REGLAS CLARAS DE LA PLATAFORMA -->
	<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="p-5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 backdrop-blur-md flex items-start gap-3.5">
			<div class="size-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
				<ShieldCheck size={ 18 } />
			</div>
			<div>
				<h5 class="text-xs font-extrabold text-purple-950 dark:text-white">Degradación No Destructiva</h5>
				<p class="text-[11px] text-purple-900/75 dark:text-purple-300/80 mt-1 leading-relaxed">
					Si una suscripción termina, nunca eliminamos ni bloqueamos tus recuerdos existentes. Siempre podrás verlos y descargarlos.
				</p>
			</div>
		</div>

		<div class="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 backdrop-blur-md flex items-start gap-3.5">
			<div class="size-9 rounded-xl bg-amber-500 text-purple-950 flex items-center justify-center shrink-0 shadow-md">
				<Heart size={ 18 } />
			</div>
			<div>
				<h5 class="text-xs font-extrabold text-purple-950 dark:text-white">Herencia de Beneficios</h5>
				<p class="text-[11px] text-purple-900/75 dark:text-purple-300/80 mt-1 leading-relaxed">
					Tus invitados disfrutan de la capacidad del plan del creador dentro de la relación compartida, sin requerir una cuenta de pago.
				</p>
			</div>
		</div>

		<div class="p-5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 backdrop-blur-md flex items-start gap-3.5">
			<div class="size-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
				<Sparkles size={ 18 } />
			</div>
			<div>
				<h5 class="text-xs font-extrabold text-purple-950 dark:text-white">Chat y Alertas Incluidos</h5>
				<p class="text-[11px] text-purple-900/75 dark:text-purple-300/80 mt-1 leading-relaxed">
					El chat en tiempo real por relación, dedicatorias y notificaciones instantáneas están incluidos en todos los planes sin excepción.
				</p>
			</div>
		</div>
	</div>
</section>