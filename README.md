# VaultROI — Calculadora de Retorno Completo

VaultROI es una aplicación web moderna orientada a la simulación y análisis de arbitraje financiero para transacciones en Venezuela. Permite a los usuarios ingresar montos en USD y calcular de forma secuencial todas las comisiones asociadas en el flujo de divisas hasta la obtención final de USDT, comparándolo con las tasas oficiales de referencia y el mercado P2P.

## Características Principales

*   **Entrada Dinámica**: Ingreso del monto base en dólares (USD) con botones de selección rápida ($100, $500, $1000).
*   **Tasas en Vivo y Modificación Manual**: Visualización del valor del dólar oficial (BCV) y USDT P2P (Binance), con la posibilidad de modificar cualquiera de estas tasas manualmente para simulaciones de escenarios.
*   **Flujo de Comisiones Secuencial y Fijo**:
    *   Comisión por compra en BDV (0.5% sobre el equivalente en Bolívares).
    *   Comisión de Tarjeta (2.5% sobre dólares).
    *   Comisión por transferencia con BPay (3.6% sobre dólares).
    *   Comisión por conversión a USDT (0% predeterminado).
*   **Análisis de Punto de Equilibrio (Breakeven)**:
    *   Cálculo de la tasa mínima de venta USDT/VES necesaria para que la operación no genere pérdidas.
    *   Advertencias visuales si la tasa actual P2P está por debajo del punto de equilibrio.
*   **Visualización de Equivalencias**: Muestra los montos resultantes en Bolívares (VES) y su correspondiente conversión a dólares oficiales en la sección de totales.
*   **Estética Premium**: Diseño minimalista optimizado para pantallas oscuras ("Obsidian Flux") usando la tipografía moderna *Outfit*.

## Arquitectura y Tecnologías

*   **Frontend**: [React](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
*   **Pruebas**: [Vitest](https://vitest.dev/) para tests unitarios y de integración de componentes.
*   **Serverless API**: Funciones en la nube de Vercel (`api/`) para consultar y almacenar en caché las tasas sin exponer credenciales directamente en el cliente.

---

## Configuración y Desarrollo Local

### Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### Instalar Dependencias

Clona el repositorio e instala los paquetes necesarios:

```bash
npm install
```

### Ejecutar Servidor de Desarrollo

Inicia el entorno de desarrollo local (Vite):

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:5173/`.

### Ejecutar Pruebas Automatizadas

Para validar los cálculos del pipeline financiero y el renderizado de los componentes:

```bash
npm run test
```

### Compilar para Producción

Genera el paquete optimizado y listo para ser alojado en cualquier plataforma web:

```bash
npm run build
```

---

## Despliegue

### 1. GitHub

Inicializa y sube el código a tu propio repositorio:

```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### 2. Vercel

Despliega el proyecto usando el CLI de Vercel:

```bash
vercel
```

**Importante**: Recuerda configurar la variable de entorno `DOLARVZLA_KEY` en los ajustes de tu proyecto en Vercel antes de desplegar la versión de producción (`vercel --prod`).
