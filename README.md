# OurMemories

<p align="center">
	<strong>Un espacio privado y elegante para atesorar, compartir y revivir momentos especiales con las personas que más quieres.</strong>
</p>

<p align="center">
	<img src="https://img.shields.io/badge/Svelte-5.57-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5" />
	<img src="https://img.shields.io/badge/SvelteKit-2.70-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit 2" />
	<img src="https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
	<img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
	<img src="https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
	<img src="https://img.shields.io/badge/pnpm-ready-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
</p>

---

## 📖 Descripción

**OurMemories** es una aplicación web interactiva desarrollada con **Svelte 5** y **SvelteKit**, diseñada para registrar, organizar y revivir los momentos más significativos de tus relaciones ( Pareja, Familia, Amigos, Mascota ).

Cada relación cuenta con su propio espacio visual dentro del dashboard, permitiendo categorizar fotos, frases memorables, relatos de texto, videos y anécdotas en una interfaz moderna con animaciones cuidadas y soporte para modo claro y oscuro.

---

## ✨ Características Principales

- **Gestión Integral de Relaciones:**
  - Espacios dinámicos organizados por tipo de vínculo ( Pareja, Familia, Amigos, Mascota ).
  - Configuración de nombre, ruta personalizada ( `/dashboard/[ relation ]` ), avatar representativo y color temático.
  - Seguimiento de puntos y momentos especiales compartidos.

- **Diversos Formatos de Memorias ( Moments ):**
  - **Fotografías e Imágenes:** Registro visual con descripciones y etiquetas.
  - **Frases y Citas Célebres:** Espacio para frases inolvidables y dedicatorias.
  - **Notas y Relatos:** Textos descriptivos de experiencias vividas.
  - **Videos y Multimedia:** Atesora clips y recuerdos en movimiento.
  - **Memes y Anécdotas:** Registro de momentos divertidos y complicidad diaria.

- **Experiencia de Usuario ( UX/UI ):**
  - Sistema de cambio instantáneo entre tema **Claro** y **Oscuro**.
  - Componentes accesibles construidos con **Bits UI** e iconografía de **Lucide Svelte**.
  - Estilos modernos optimizados con **Tailwind CSS v4**.
  - Reactividad de última generación utilizando las nuevas **Runes de Svelte 5** ( `$state`, `$derived`, `$effect` ).
  - Persistencia de datos en el cliente mediante `localStorage` para navegación inmediata.

---

## 🛠️ Stack Tecnológico

| Herramienta | Versión | Propósito |
| :--- | :--- | :--- |
| **Svelte** | `^5.57.3` | Biblioteca reactiva principal con Runes |
| **SvelteKit** | `^2.70.3` | Enrutamiento de páginas, layouts y servidor Vite |
| **TypeScript** | `~5.8.3` | Tipado estático estricto y modelos de dominio |
| **Tailwind CSS** | `^4.3.3` | Framework de diseño basado en utilidades con `@tailwindcss/vite` |
| **Bits UI** | `^2.20.2` | Primitivas headless accesibles para Svelte |
| **TanStack Svelte Query** | `^6.3.6` | Gestión y cacheo de consultas asíncronas |
| **Lucide Svelte** | `^1.66.0` | Catálogo de iconos vectoriales |
| **Vite** | `^6.4.5` | Bundler y servidor de desarrollo |
| **pnpm** | `>=9.0.0` | Gestor de paquetes obligatorio |

---

## 📋 Requisitos Previos

- **Node.js**: Versión `18.x` o superior ( recomendado: Node `20 LTS` o `22 LTS` ).
- **pnpm**: Gestor de paquetes oficial del proyecto. Si no lo tienes instalado de forma global, puedes activarlo mediante Corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 🚀 Instalación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/OurMemories-Front.git
   cd OurMemories-Front
   ```

2. **Instalar dependencias con pnpm:**
   ```bash
   pnpm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```
   La aplicación se ejecutará en: [ http://localhost:3000 ]( http://localhost:3000 )

---

## 📜 Scripts del Proyecto

Los siguientes comandos deben ejecutarse siempre utilizando **pnpm**:

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo en el puerto `3000` con acceso local y de red ( `--port=3000 --host=0.0.0.0` ) |
| `pnpm build` | Genera la versión optimizada de producción |
| `pnpm preview` | Permite previsualizar localmente el paquete de producción generado |
| `pnpm lint` | Valida el tipado de TypeScript en todo el proyecto sin generar archivos ( `tsc --noEmit` ) |
| `pnpm clean` | Elimina el directorio de compilación `dist` |

---

## 📁 Estructura del Código

```text
OurMemories-Front/
├── src/
│   ├── app.d.ts                 # Declaraciones globales de tipos de SvelteKit
│   ├── app.html                 # Plantilla base HTML
│   ├── hooks.server.ts          # Hooks de ciclo de vida del servidor SvelteKit
│   ├── index.css                # Estilos globales y directivas de Tailwind CSS v4
│   ├── lib/
│   │   ├── components/          # Componentes de interfaz de usuario
│   │   │   ├── shared/          # Elementos compartidos ( componentes Select e inputs )
│   │   │   ├── DashboardHeader.svelte
│   │   │   ├── GroupEditor.svelte
│   │   │   ├── MemoryCard.svelte
│   │   │   ├── RelationshipsSidebar.svelte
│   │   │   └── UploadModal.svelte
│   │   ├── data.ts              # Semillas de datos iniciales ( usuarios, relaciones, momentos )
│   │   ├── store.svelte.ts      # Store global reactivo implementado con Runes de Svelte 5
│   │   └── types.ts             # Definición de tipos e interfaces del dominio
│   └── routes/                  # Enrutamiento basado en archivos de SvelteKit
│       ├── +layout.svelte       # Layout raíz ( proveedor de temas e inicialización )
│       ├── +page.svelte         # Portada y página de bienvenida ( Landing Page )
│       ├── login/               # Pantalla de acceso e inicio de sesión
│       ├── profile/             # Perfil y configuración de usuario
│       └── dashboard/           # Panel principal de memorias
│           ├── +layout.svelte   # Layout del panel ( barra lateral y cabecera )
│           └── [ relation ]/    # Vista dinámica de memorias según la relación activa
├── package.json                 # Dependencias y scripts del proyecto
├── pnpm-lock.yaml               # Archivo de bloqueo de dependencias de pnpm
├── svelte.config.js             # Configuración del compilador Svelte
├── tsconfig.json                # Configuración de compilación de TypeScript
└── vite.config.ts               # Configuración de Vite con plugins de Svelte y Tailwind
```

---

## 🎨 Convenciones del Proyecto

- **Gestión de Paquetes:** Utilizar exclusivamente `pnpm` ( prohibido `npm` ).
- **Espaciado en Delimitadores:** Todo contenedor `( )`, `{ }`, `[ ]` con contenido interno debe incluir un espacio en blanco después de la apertura y antes del cierre ( por ejemplo: `[ 1, 2, 3 ]`, `if ( condicion ) { ... }` ).
- **Alineación de Propiedades:** Las propiedades en interfaces y objetos se alinean verticalmente con tabulaciones y dos puntos `:` alineados.
- **Tipado Estricto:** Tipado completo de modelos con interfaces TypeScript y tipado explícito de retornos.
- **Líneas Vacías:** Líneas en blanco sin espacios ni tabulaciones ( 0 caracteres ).

---

## 📄 Licencia

Distribuido bajo la licencia [ Apache-2.0 ]( LICENSE ).
