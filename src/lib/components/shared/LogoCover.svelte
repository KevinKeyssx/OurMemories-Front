<!-- LogoCover Component: Interactive 3D Holographic Chip for OurMemories -->
<button class="m6-chip select-none" type="button" aria-label="OurMemories Logo">
	<span class="m6-chip__tilt">
		<span class="m6-chip__face">
			<span class="m6-chip__die"></span>
			<span class="m6-chip__mark">
				<img
					src="/logo.avif"
					alt="OurMemories Logo"
					class="m6-chip__logo-img"
				/>
			</span>
			<span class="m6-chip__glare"></span>
		</span>
		<span class="m6-chip__spark"></span>
		<span class="m6-chip__spark"></span>
	</span>
	<span class="m6-chip__zones">
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
		<span class="m6-chip__zone"></span>
	</span>
	<svg class="m6-chip__defs" aria-hidden="true">
		<filter id="m6-chip-grain" x="0" y="0" width="100%" height="100%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.8"
				numOctaves="2"
				seed="7"
				result="noise"
			></feTurbulence>
			<feColorMatrix
				in="noise"
				type="saturate"
				values="0"
				result="mono"
			></feColorMatrix>
			<feComposite
				in="SourceGraphic"
				in2="mono"
				operator="arithmetic"
				k2="1"
				k3="0.62"
				k4="-0.31"
				result="speck"
			></feComposite>
			<feComposite in="speck" in2="SourceGraphic" operator="in"></feComposite>
		</filter>
	</svg>
</button>

<style>
.m6-chip {
	--x: 2;
	--y: 2;
	position: relative;
	display: inline-block;
	width: 16em;
	height: 16em;
	padding: 0;
	border: 0;
	border-radius: 1.5em;
	background: none;
	cursor: pointer;
	perspective: 42em;
}

.m6-chip__tilt {
	position: relative;
	display: block;
	width: 100%;
	height: 100%;
	padding: 0.18em;
	box-sizing: border-box;
	overflow: hidden;
	border-radius: 1.5em;
	background: radial-gradient(35% 35% at 100% 0%, #fde047, #fde04700),
		linear-gradient(
			45deg,
			#fef08a 0%,
			#fbbf24 25%,
			#f59e0b 50%,
			#c026d3 75%,
			#7c3aed 100%
		);
	box-shadow:
		inset 0 0 0 0.035em #ffffffb3,
		0 0.3em 0.8em -0.6em rgba(0, 0, 0, 0.4),
		0 0 0 0 rgba(251, 191, 36, 0);
	transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1);
	transition:
		transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
		box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1),
		filter 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.m6-chip__tilt::after {
	content: "";
	position: absolute;
	inset: 0;
	z-index: 2;
	background: linear-gradient(
		115deg,
		rgba(255, 255, 255, 0) 38%,
		rgba(255, 255, 255, 0.15) 50%,
		rgba(255, 255, 255, 0) 62%
	);
	transform: translate3d(-110%, 0, 0);
	transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
	pointer-events: none;
}

.m6-chip__face {
	position: relative;
	display: grid;
	place-items: center;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 1.35em;
	background: #0d051a;
	box-shadow: 0 0 0 0.03em rgba(255, 255, 255, 0.22);
}

.m6-chip__face::before {
	content: "";
	position: absolute;
	inset: -20%;
	background:
		radial-gradient(ellipse 65% 55% at 25% 75%, rgba(245, 158, 11, 0.22) 0%, transparent 60%),
		radial-gradient(ellipse 65% 55% at 75% 25%, rgba(192, 38, 211, 0.25) 0%, transparent 60%),
		radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.28) 0%, transparent 70%),
		linear-gradient(
			135deg,
			rgba(251, 191, 36, 0.15) 0%,
			rgba(244, 63, 94, 0.16) 35%,
			rgba(124, 58, 237, 0.22) 70%,
			rgba(22, 11, 41, 0.4) 100%
		);
	transform: translate3d(0, 0, 0);
	transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.m6-chip__face::after {
	content: "";
	position: absolute;
	inset: 0;
	background:
		radial-gradient(35% 35% at 0% 0%, rgba(254, 240, 138, 0.25), transparent 70%),
		radial-gradient(35% 35% at 100% 0%, rgba(192, 38, 211, 0.28), transparent 70%),
		radial-gradient(35% 35% at 0% 100%, rgba(245, 158, 11, 0.22), transparent 70%),
		radial-gradient(35% 35% at 100% 100%, rgba(124, 58, 237, 0.32), transparent 70%);
	box-shadow: inset 0 0 0.35em 0.02em rgba(251, 191, 36, 0.25);
	pointer-events: none;
}

.m6-chip__die {
	position: absolute;
	inset: 0;
	background:
		repeating-linear-gradient(
			90deg,
			rgba(251, 191, 36, 0.15) 0 0.03em,
			rgba(251, 191, 36, 0) 0.03em 0.62em
		),
		repeating-linear-gradient(
			0deg,
			rgba(251, 191, 36, 0.15) 0 0.03em,
			rgba(251, 191, 36, 0) 0.03em 0.62em
		),
		linear-gradient(rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.12)) 0.9em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.12)) 3.6em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.12)) 6.3em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.12)) 9em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.15)) 11.9em 0.9em / 1.4em 1.45em no-repeat,
		linear-gradient(rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.15)) 13.5em 0.9em / 1.3em 1.45em no-repeat,
		linear-gradient(rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.15)) 11.9em 2.55em / 1.4em 1.45em no-repeat,
		linear-gradient(rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.15)) 13.5em 2.55em / 1.3em 1.45em no-repeat,
		linear-gradient(rgba(192, 38, 211, 0.12), rgba(192, 38, 211, 0.12)) 0.9em 4.4em / 13.9em 0.9em no-repeat,
		linear-gradient(rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.15)) 0.9em 10.6em / 4.3em 4.2em no-repeat,
		linear-gradient(rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.15)) 5.5em 10.6em / 4.3em 4.2em no-repeat,
		linear-gradient(rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.15)) 10.1em 10.6em / 2.4em 4.2em no-repeat,
		linear-gradient(rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.15)) 12.8em 10.6em / 2em 4.2em no-repeat;
	mask: radial-gradient(
			circle at 50% 50%,
			#000 0,
			#000000b3 2.6em,
			#00000000 5.6em
		)
		calc(100% - var(--x) * 25%) calc(100% - var(--y) * 25%) / 200% 200%
		no-repeat;
	opacity: 0;
	transition:
		opacity 0.6s ease,
		mask-position 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	pointer-events: none;
}

.m6-chip__mark {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 68%;
	height: 68%;
	filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.35));
	transition:
		transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
		filter 0.4s ease;
}

.m6-chip__logo-img {
	width: 100%;
	height: 100%;
	object-fit: contain;
	user-select: none;
	pointer-events: none;
}

.m6-chip__glare {
	position: absolute;
	inset: 0;
	z-index: 1;
	background: radial-gradient(
			circle at 50% 50%,
			rgba(255, 255, 255, 0.38) 0,
			rgba(251, 191, 36, 0.15) 3.6em,
			rgba(255, 255, 255, 0) 8.5em
		)
		calc(100% - var(--x) * 25%) calc(100% - var(--y) * 25%) / 200% 200%
		no-repeat;
	mix-blend-mode: screen;
	opacity: 0;
	transition:
		opacity 0.6s ease,
		background-position 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	pointer-events: none;
}

.m6-chip__spark {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 3;
	width: 4.2em;
	height: 0.18em;
	border-radius: 0.1em;
	background: linear-gradient(90deg, rgba(251, 191, 36, 0), #fbbf24 60%, #ffffff);
	box-shadow:
		0 0 0.35em 0.08em #fbbf24,
		0 0 1.2em 0.35em rgba(244, 63, 94, 0.5),
		0 0 1.8em 0.4em rgba(124, 58, 237, 0.6);
	offset-path: inset(0.09em round 1.5em);
	offset-rotate: auto;
	offset-distance: 0%;
	opacity: 0;
	transition: opacity 0.5s ease;
	animation: m6-chip-run 3.2s linear infinite paused;
	pointer-events: none;
}

.m6-chip__spark + .m6-chip__spark {
	animation-delay: -1.6s;
}

.m6-chip__zones {
	position: absolute;
	inset: -0.4em;
	z-index: 4;
	display: grid;
	grid-template: repeat(5, 1fr) / repeat(5, 1fr);
}

.m6-chip__defs {
	position: absolute;
	width: 0;
	height: 0;
}

.m6-chip:has(.m6-chip__zone:nth-child(5n + 1):hover) {
	--x: 0;
}
.m6-chip:has(.m6-chip__zone:nth-child(5n + 2):hover) {
	--x: 1;
}
.m6-chip:has(.m6-chip__zone:nth-child(5n + 4):hover) {
	--x: 3;
}
.m6-chip:has(.m6-chip__zone:nth-child(5n + 5):hover) {
	--x: 4;
}
.m6-chip:has(.m6-chip__zone:nth-child(-n + 5):hover) {
	--y: 0;
}
.m6-chip:has(.m6-chip__zone:nth-child(n + 6):nth-child(-n + 10):hover) {
	--y: 1;
}
.m6-chip:has(.m6-chip__zone:nth-child(n + 16):nth-child(-n + 20):hover) {
	--y: 3;
}
.m6-chip:has(.m6-chip__zone:nth-child(n + 21):hover) {
	--y: 4;
}

.m6-chip:hover .m6-chip__tilt {
	transform: translate3d(0, -0.3em, 0) rotateX(calc((2 - var(--y)) * 4.5deg))
		rotateY(calc((var(--x) - 2) * 4.5deg)) scale(1);
	box-shadow:
		inset 0 0 0 0.035em rgba(255, 255, 255, 0.9),
		calc((2 - var(--x)) * 0.35em) calc(1.2em + (2 - var(--y)) * 0.35em) 2.4em -0.6em
			rgba(0, 0, 0, 0.7),
		0 0 2.8em -0.2em rgba(251, 191, 36, 0.5),
		0 0 4em 0.2em rgba(124, 58, 237, 0.35);
	filter: brightness(1.05);
}

.m6-chip:hover .m6-chip__tilt::after {
	transform: translate3d(110%, 0, 0);
}

.m6-chip:hover .m6-chip__face::before {
	transform: translate3d(
		calc(2% + var(--x) * 1%),
		calc(-6% + var(--y) * 1%),
		0
	);
}

.m6-chip:hover .m6-chip__die,
.m6-chip:hover .m6-chip__glare,
.m6-chip:hover .m6-chip__spark {
	opacity: 1;
}

.m6-chip:hover .m6-chip__spark {
	animation-play-state: running;
}

.m6-chip:hover .m6-chip__mark {
	transform: translate3d(
			calc((var(--x) - 2) * -0.08em),
			calc((var(--y) - 2) * -0.08em),
			0
		)
		scale(1.03);
	filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 25px rgba(251, 191, 36, 0.55));
}

.m6-chip:focus-visible {
	outline: 0.12em solid #fbbf24;
	outline-offset: 0.3em;
}

.m6-chip:focus-visible .m6-chip__spark {
	opacity: 1;
	animation-play-state: running;
}

.m6-chip:active .m6-chip__tilt {
	transform: translate3d(0, -0.05em, 0) rotateX(calc((2 - var(--y)) * 6deg))
		rotateY(calc((var(--x) - 2) * 6deg)) scale(0.975);
	box-shadow:
		inset 0 0 0 0.035em #ffffff,
		0 0.4em 0.9em -0.4em rgba(0, 0, 0, 0.7),
		0 0 3.2em -0.2em rgba(251, 191, 36, 0.7);
	filter: brightness(1.1);
	transition-duration: 0.18s;
}

.m6-chip:active .m6-chip__die {
	mask: none;
}

.m6-chip:active .m6-chip__mark {
	transform: scale(0.99);
	transition-duration: 0.18s;
}

.m6-chip:active .m6-chip__face::before {
	transform: translate3d(8%, -8%, 0);
	transition-duration: 0.3s;
}

@keyframes m6-chip-run {
	to {
		offset-distance: 100%;
	}
}

@media (prefers-reduced-motion: reduce) {
	.m6-chip__tilt,
	.m6-chip:hover .m6-chip__tilt,
	.m6-chip:active .m6-chip__tilt {
		transform: none;
	}

	.m6-chip__spark {
		display: none;
	}
}

/* --- Estilos Light Mode: Porcelana Perla & Oro Noble --- */
:global(.light) .m6-chip__tilt {
	background: radial-gradient(35% 35% at 100% 0%, rgba(251, 191, 36, 0.4), transparent),
		linear-gradient(
			45deg,
			#fffbeb 0%,
			#fef08a 25%,
			#fbbf24 50%,
			#f59e0b 75%,
			#d97706 100%
		);
	box-shadow:
		inset 0 0 0 0.035em #ffffff,
		0 0.4em 1.2em -0.4em rgba(124, 58, 237, 0.12),
		0 0.8em 2em -0.6em rgba(251, 191, 36, 0.18);
}

:global(.light) .m6-chip__face {
	background: #ffffff;
	box-shadow:
		0 0 0 0.03em rgba(251, 191, 36, 0.35),
		inset 0 0 1.5em rgba(245, 158, 11, 0.06);
}

:global(.light) .m6-chip__face::before {
	background:
		radial-gradient(ellipse 65% 55% at 20% 80%, rgba(254, 240, 138, 0.4) 0%, transparent 60%),
		radial-gradient(ellipse 65% 55% at 80% 20%, rgba(253, 164, 175, 0.35) 0%, transparent 60%),
		radial-gradient(circle at 50% 50%, rgba(243, 232, 255, 0.5) 0%, transparent 70%),
		linear-gradient(
			135deg,
			rgba(255, 251, 235, 0.85) 0%,
			rgba(255, 241, 242, 0.75) 35%,
			rgba(245, 243, 255, 0.85) 70%,
			rgba(255, 255, 255, 0.95) 100%
		);
}

:global(.light) .m6-chip__face::after {
	background:
		radial-gradient(35% 35% at 0% 0%, rgba(251, 191, 36, 0.28), transparent 70%),
		radial-gradient(35% 35% at 100% 0%, rgba(244, 63, 94, 0.2), transparent 70%),
		radial-gradient(35% 35% at 0% 100%, rgba(245, 158, 11, 0.22), transparent 70%),
		radial-gradient(35% 35% at 100% 100%, rgba(168, 85, 247, 0.25), transparent 70%);
	box-shadow: inset 0 0 0.35em 0.02em rgba(251, 191, 36, 0.25);
}

:global(.light) .m6-chip__die {
	background:
		repeating-linear-gradient(
			90deg,
			rgba(217, 119, 6, 0.12) 0 0.03em,
			rgba(217, 119, 6, 0) 0.03em 0.62em
		),
		repeating-linear-gradient(
			0deg,
			rgba(217, 119, 6, 0.12) 0 0.03em,
			rgba(217, 119, 6, 0) 0.03em 0.62em
		),
		linear-gradient(rgba(244, 63, 94, 0.07), rgba(244, 63, 94, 0.07)) 0.9em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(244, 63, 94, 0.07), rgba(244, 63, 94, 0.07)) 3.6em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(244, 63, 94, 0.07), rgba(244, 63, 94, 0.07)) 6.3em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(244, 63, 94, 0.07), rgba(244, 63, 94, 0.07)) 9em 0.9em / 2.4em 3.1em no-repeat,
		linear-gradient(rgba(217, 119, 6, 0.09), rgba(217, 119, 6, 0.09)) 11.9em 0.9em / 1.4em 1.45em no-repeat,
		linear-gradient(rgba(217, 119, 6, 0.09), rgba(217, 119, 6, 0.09)) 13.5em 0.9em / 1.3em 1.45em no-repeat,
		linear-gradient(rgba(217, 119, 6, 0.09), rgba(217, 119, 6, 0.09)) 11.9em 2.55em / 1.4em 1.45em no-repeat,
		linear-gradient(rgba(217, 119, 6, 0.09), rgba(217, 119, 6, 0.09)) 13.5em 2.55em / 1.3em 1.45em no-repeat,
		linear-gradient(rgba(192, 38, 211, 0.07), rgba(192, 38, 211, 0.07)) 0.9em 4.4em / 13.9em 0.9em no-repeat,
		linear-gradient(rgba(124, 58, 237, 0.08), rgba(124, 58, 237, 0.08)) 0.9em 10.6em / 4.3em 4.2em no-repeat,
		linear-gradient(rgba(124, 58, 237, 0.08), rgba(124, 58, 237, 0.08)) 5.5em 10.6em / 4.3em 4.2em no-repeat,
		linear-gradient(rgba(124, 58, 237, 0.08), rgba(124, 58, 237, 0.08)) 10.1em 10.6em / 2.4em 4.2em no-repeat,
		linear-gradient(rgba(217, 119, 6, 0.09), rgba(217, 119, 6, 0.09)) 12.8em 10.6em / 2em 4.2em no-repeat;
}

:global(.light) .m6-chip__mark {
	filter: drop-shadow(0 8px 16px rgba(124, 58, 237, 0.18)) drop-shadow(0 0 16px rgba(251, 191, 36, 0.35));
}

:global(.light) .m6-chip__spark {
	background: linear-gradient(90deg, rgba(245, 158, 11, 0), #f59e0b 60%, #ffffff);
	box-shadow:
		0 0 0.35em 0.08em #f59e0b,
		0 0 1em 0.3em rgba(244, 63, 94, 0.35),
		0 0 1.5em 0.35em rgba(124, 58, 237, 0.3);
}

:global(.light) .m6-chip__glare {
	mix-blend-mode: overlay;
	background: radial-gradient(
			circle at 50% 50%,
			rgba(255, 255, 255, 0.6) 0,
			rgba(254, 240, 138, 0.25) 3.6em,
			rgba(255, 255, 255, 0) 8.5em
		)
		calc(100% - var(--x) * 25%) calc(100% - var(--y) * 25%) / 200% 200%
		no-repeat;
}

:global(.light) .m6-chip:hover .m6-chip__tilt {
	box-shadow:
		inset 0 0 0 0.035em #ffffff,
		calc((2 - var(--x)) * 0.35em) calc(1.2em + (2 - var(--y)) * 0.35em) 2.4em -0.6em
			rgba(124, 58, 237, 0.15),
		0 0 2.5em -0.2em rgba(251, 191, 36, 0.45),
		0 0 3.5em 0.2em rgba(124, 58, 237, 0.2);
}

:global(.light) .m6-chip:hover .m6-chip__mark {
	filter: drop-shadow(0 12px 22px rgba(124, 58, 237, 0.22)) drop-shadow(0 0 22px rgba(251, 191, 36, 0.5));
}

:global(.light) .m6-chip:active .m6-chip__tilt {
	box-shadow:
		inset 0 0 0 0.035em #ffffff,
		0 0.4em 1em -0.4em rgba(124, 58, 237, 0.2),
		0 0 2.8em -0.2em rgba(251, 191, 36, 0.5);
}
</style>
