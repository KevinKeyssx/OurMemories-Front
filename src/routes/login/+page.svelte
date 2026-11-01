<script lang="ts">
	import { goto } from '$app/navigation';
	import { memoriesStore } from '$lib/store.svelte';
	import { Sparkles, ArrowLeft, KeyRound } from '@lucide/svelte';

	let email = $state<string>( '' );
	let password = $state<string>( '' );

	function handleLogin( e: SubmitEvent ): void {
		e.preventDefault();
		memoriesStore.login();
		const targetPath = memoriesStore.groups[0]?.path_name || 'pareja';
		goto( `/dashboard/${targetPath}` );
	}
</script>

<svelte:head>
	<title>Iniciar Sesión - OurMemories</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-md bg-white dark:bg-dark-card border border-stone-200/70 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative">
		<a
			href="/"
			class="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-accent transition-colors mb-6 font-medium"
		>
			<ArrowLeft size={14} />
			<span>Volver al inicio</span>
		</a>

		<div class="flex items-center gap-3 mb-6">
			<div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-accent to-pink-500 flex items-center justify-center text-white shadow-lg shadow-brand-accent/25">
				<Sparkles size={24} />
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Acceso Privado</h1>
				<p class="text-xs text-stone-500">Inicia sesión para proteger tus recuerdos</p>
			</div>
		</div>

		<form onsubmit={handleLogin} class="space-y-4">
			<div>
				<label for="email" class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Correo</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="tu@email.com"
					required
					class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 text-sm font-medium"
				/>
			</div>

			<div>
				<label for="password" class="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Contraseña</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					required
					class="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 text-sm font-medium"
				/>
			</div>

			<button
				type="submit"
				class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-accent to-purple-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 active:scale-[0.98] transition-all"
			>
				<KeyRound size={18} />
				<span>Acceder</span>
			</button>
		</form>
	</div>
</div>
