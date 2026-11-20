<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto( '/dashboard/logros' );
	});
</script>

<div class="min-h-screen flex items-center justify-center text-zinc-400 text-sm">
	Redirigiendo a Álbum de Logros...
</div>
