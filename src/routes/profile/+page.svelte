<script lang="ts">
    import { scale } from 'svelte/transition';

    import {
        ArrowLeft,
		User as UserIcon,
		Mail,
		Phone,
		Calendar,
		Sparkles,
		ShieldCheck,
		Save,
		Check
	} from '@lucide/svelte';

	import Select, {
        type SelectItem
    }                           from '$lib/components/shared/inputs/Select.svelte';
	import type { Sex }         from '$lib/types';
	import { memoriesStore }    from '$lib/store.svelte';
	import { INITIAL_SEXES }    from '$lib/data';


    const currentUser = $derived( memoriesStore.currentUser );

	let name         = $state<string>( memoriesStore.currentUser.name );
	let lastName     = $state<string>( memoriesStore.currentUser.last_name );
	let email        = $state<string>( memoriesStore.currentUser.email );
	let phone        = $state<string>( memoriesStore.currentUser.phone );
	let birthdate    = $state<string>( memoriesStore.currentUser.birthdate );
	let sexId        = $state<string>( memoriesStore.currentUser.sex_id );
	let savedSuccess = $state<boolean>( false );

    const userPoints           = $derived<number>( currentUser.points || 0 );
	const userLevel            = $derived<number>( Math.floor( userPoints / 100 ) + 1 );
	const currentLevelProgress = $derived<number>( userPoints % 100 );


	const sexes: Sex[] = INITIAL_SEXES;

	const sexItems = $derived<SelectItem[]>(
		sexes.map( ( s: Sex ) => ({
			value       : s.id,
			label       : s.name,
			description : `Abreviatura: ${ s.short_name }`
		}) )
	);


    function handleSubmit( e: SubmitEvent ): void {
		e.preventDefault();

        memoriesStore.updateUser( {
			name,
			last_name : lastName,
			email,
			phone,
			birthdate,
			sex_id    : sexId
		} );

		savedSuccess = true;

        setTimeout( () => {
			savedSuccess = false;
		}, 3000 );
	}
</script>

<svelte:head>
	<title>Perfil de Usuario - OurMemories</title>
</svelte:head>

<div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
	<!-- Botón Volver al Dashboard -->
	<div class="mb-8 flex items-center justify-between">
		<a
			href="/dashboard/pareja"
			class="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-brand-accent transition-colors"
		>
			<ArrowLeft size={16} />
			<span>Volver al Dashboard</span>
		</a>

		<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold">
			<ShieldCheck size={14} />
			<span>Cuenta Activa</span>
		</div>
	</div>

	<!-- Tarjeta Principal del Perfil -->
	<div class="bg-white/80 dark:bg-dark-card/80 border border-stone-200/60 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
		<!-- Cabecera de Usuario con Avatar y Nivel -->
		<div class="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-stone-100 dark:border-white/5">
			<div class="w-20 h-20 rounded-3xl bg-linear-to-tr from-brand-accent via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-brand-accent/25">
				{currentUser.name.charAt( 0 )}{currentUser.last_name.charAt( 0 )}
			</div>

			<div class="text-center sm:text-left flex-1">
				<div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
					<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
						{currentUser.name} {currentUser.last_name}
					</h1>
					<span class="px-2.5 py-0.5 rounded-full bg-brand-accent text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
						Nivel {userLevel}
					</span>
				</div>
				<p class="text-xs text-stone-400 font-medium">{currentUser.email}</p>

				<!-- Barra de Puntos Globales del Usuario -->
				<div class="mt-4 max-w-md">
					<div class="flex items-center justify-between text-xs font-bold mb-1.5">
						<span class="text-stone-500 flex items-center gap-1">
							<Sparkles size={13} class="text-brand-secondary" />
							Puntos de Usuario: {userPoints} pts
						</span>
						<span class="text-stone-400 text-[11px] font-semibold">{currentLevelProgress} / 100 pts para Nivel {userLevel + 1}</span>
					</div>

					<div class="w-full h-2.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
						<div
							class="h-full rounded-full bg-linear-to-r from-brand-accent to-pink-500 transition-all duration-700"
							style="width: {currentLevelProgress}%;"
						></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Formulario de Edición de Datos -->
		<form onsubmit={handleSubmit} class="pt-8 space-y-6">
			<h2 class="text-lg font-bold tracking-tight">Información Personal</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="name" class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre</label>
					<div class="relative">
						<input
							type="text"
							id="name"
							bind:value={name}
							required
							class="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
						/>
						<UserIcon size={16} class="absolute left-4 top-3.5 text-stone-400" />
					</div>
				</div>

				<div>
					<label for="last-name" class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Apellidos</label>
					<div class="relative">
						<input
							type="text"
							id="last-name"
							bind:value={lastName}
							required
							class="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
						/>
						<UserIcon size={16} class="absolute left-4 top-3.5 text-stone-400" />
					</div>
				</div>

				<div>
					<label for="email" class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
					<div class="relative">
						<input
							type="email"
							id="email"
							bind:value={email}
							required
							class="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
						/>
						<Mail size={16} class="absolute left-4 top-3.5 text-stone-400" />
					</div>
				</div>

				<div>
					<label for="phone" class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Teléfono</label>
					<div class="relative">
						<input
							type="tel"
							id="phone"
							bind:value={phone}
							class="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
						/>
						<Phone size={16} class="absolute left-4 top-3.5 text-stone-400" />
					</div>
				</div>

				<div>
					<label for="birthdate" class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Fecha de Nacimiento</label>
					<div class="relative">
						<input
							type="date"
							id="birthdate"
							bind:value={birthdate}
							class="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
						/>
						<Calendar size={16} class="absolute left-4 top-3.5 text-stone-400" />
					</div>
				</div>

				<div>
					<Select
						id="sex"
						label="Sexo"
						bind:value={sexId}
						items={sexItems}
						placeholder="Selecciona tu sexo"
						class="bg-stone-50! dark:bg-white/5!"
					/>
				</div>
			</div>

			<!-- Botón Guardar Cambios -->
			<div class="pt-4 flex items-center justify-between">
				<div>
					{#if savedSuccess}
						<span
							transition:scale
							class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500"
						>
							<Check size={16} />
							<span>Información actualizada correctamente</span>
						</span>
					{/if}
				</div>

				<button
					type="submit"
					class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-linear-to-r from-brand-accent to-purple-600 text-white font-semibold text-sm shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 active:scale-95 transition-all"
				>
					<Save size={16} />
					<span>Guardar Perfil</span>
				</button>
			</div>
		</form>
	</div>
</div>
