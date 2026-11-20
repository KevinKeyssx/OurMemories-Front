<script lang="ts">
	interface Props {
		onclick ?: () => void;
		color   ?: string;
	}

	let {
		onclick,
		color = '#a855f7'
	}: Props = $props();
</script>

<button
	type="button"
	class="setting-btn"
	{onclick}
	aria-label="Configurar Modo Cine"
	style="--accent-color: { color };"
>
	<span class="bar bar1"></span>
	<span class="bar bar2"></span>
	<span class="bar bar1"></span>
</button>

<style>
.setting-btn {
	width: 44px;
	height: 44px;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 5px;
	background-color: rgba(16, 8, 28, 0.65);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border-radius: 16px;
	cursor: pointer;
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow:
		inset 0px 1px 1px rgba(255, 255, 255, 0.25),
		0px 8px 20px -4px rgba(0, 0, 0, 0.4);
	transition:
		transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
		border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
		background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.setting-btn:hover {
	transform: scale(1.06);
	border-color: rgba(255, 255, 255, 0.4);
	/* box-shadow:
		inset 0px 1px 1px rgba(255, 255, 255, 0.35),
		0 10px 25px -4px var(--accent-color, rgba(168, 85, 247, 0.45)),
		0 0 15px var(--accent-color, rgba(168, 85, 247, 0.3)); */
}

.setting-btn:active {
	transform: scale(0.95);
}

.bar {
	width: 20px;
	height: 2px;
	background-color: rgba(255, 255, 255, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	border-radius: 2px;
	transition: background-color 0.3s;
}

.setting-btn:hover .bar {
	background-color: rgba(255, 255, 255, 0.6);
}

.bar::before {
	content: "";
	width: 5px;
	height: 5px;
	background-color: var(--accent-color, #a855f7);
	position: absolute;
	border-radius: 50%;
	border: 1.5px solid #ffffff;
	transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0px 0px 8px var(--accent-color, #a855f7);
}

.bar1::before {
	transform: translateX(-5px);
}

.bar2::before {
	transform: translateX(5px);
}

.setting-btn:hover .bar1::before {
	transform: translateX(5px);
}

.setting-btn:hover .bar2::before {
	transform: translateX(-5px);
}
</style>
