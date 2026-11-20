<script lang="ts">
	interface Props {
		right          ?: boolean;
		color          ?: string;
		highlightColor ?: string;
		onclick        ?: () => void;
		href           ?: string;
		title          ?: string;
		class          ?: string;
	}

	let {
		right          = true,
		color          = '#c084fc',
		highlightColor = '#fbbf24',
		onclick,
		href,
		title          = right ? 'Siguiente' : 'Volver',
		class          : className = ''
	}: Props = $props();
</script>

<!-- From Uiverse.io by Nawsome - Customized for OurMemories -->
{#if href}
	<a
		{ href }
		class="btn-arrow-container { className }"
		aria-label={ title }
		style="--arrow-color: { color }; --arrow-highlight: { highlightColor };"
	>
		<span class="arrow" class:is-left={ !right }>
			<span class="arrow-top"></span>
			<span class="arrow-bottom"></span>
		</span>
	</a>
{:else}
	<button
		type="button"
		{ onclick }
		class="btn-arrow-container { className }"
		aria-label={ title }
		style="--arrow-color: { color }; --arrow-highlight: { highlightColor };"
	>
		<span class="arrow" class:is-left={ !right }>
			<span class="arrow-top"></span>
			<span class="arrow-bottom"></span>
		</span>
	</button>
{/if}

<style>
/* From Uiverse.io by Nawsome */
.btn-arrow-container {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 12px;
	background-color: rgba(0, 0, 0, 0.35);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
	cursor: pointer;
	text-decoration: none;
	user-select: none;
	transition:
		transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
		background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
		border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-arrow-container:hover {
	transform: scale(1.08);
	background-color: rgba(0, 0, 0, 0.55);
	border-color: rgba(255, 255, 255, 0.45);
	box-shadow:
		0 6px 14px rgba(0, 0, 0, 0.3),
		0 0 12px rgba(192, 132, 252, 0.35);
}

.btn-arrow-container:active {
	transform: scale(0.94);
}

.arrow {
	position: relative;
	width: 8px;
	height: 14px;
	display: block;
	transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.arrow.is-left {
	transform: scaleX(-1);
}

.arrow-top,
.arrow-bottom {
	background-color: var(--arrow-color, #c084fc);
	height: 2.5px;
	position: absolute;
	right: 1px;
	width: 8.5px;
	border-radius: 2px;
	overflow: hidden;
}

.arrow-top:after,
.arrow-bottom:after {
	background-color: var(--arrow-highlight, #fbbf24);
	content: "";
	height: 100%;
	position: absolute;
	top: 0;
	border-radius: 2px;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.arrow-top {
	bottom: 50%;
	transform: rotate(45deg);
	transform-origin: bottom right;
}

.arrow-top:after {
	left: 100%;
	right: 0;
	transition-delay: 0s;
}

.arrow-bottom {
	top: 50%;
	transform: rotate(-45deg);
	transform-origin: top right;
}

.arrow-bottom:after {
	left: 0;
	right: 100%;
	transition-delay: 0.15s;
}

.btn-arrow-container:hover .arrow-top:after {
	left: 0;
	transition-delay: 0.15s;
}

.btn-arrow-container:hover .arrow-bottom:after {
	right: 0;
	transition-delay: 0s;
}
</style>
