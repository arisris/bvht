# Bun + Vite + Tailwind v4 + Hono + Auth

This is a starter template for building high-performance web applications using **Bun**, **Vite**, **Tailwind CSS v4**, **Hono**, and **Auth**.

## Features

- **Bun**: Fast JavaScript runtime, bundler, and package manager.
- **Vite**: Next-generation frontend tooling.
- **Hono**: Ultrafast web framework for the Edge.
- **Tailwind CSS v4**: Utility-first CSS framework (configured with the new v4 engine).
- **Auth**: Flexible authentication using `@auth/core` (via Hono).

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/arisris/bun-sites.git
    cd bun-sites/blogai
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Start the development server:**

    ```bash
    bun dev
    ```

    Open your browser and navigate to `http://localhost:3000`.

4.  **Build for production:**

    ```bash
    bun build
    ```

    This will generate a `dist` directory with the server and client assets. You can then run the built application:

    ```bash
    bun run dist
    ```

## Project Structure

```
├── src/
│   ├── client/           # Client-side assets (CSS, JS)
│   │   ├── main.ts       # Main client-side script
│   │   └── tailwind.css  # Tailwind CSS configuration
│   ├── lib/              # Shared utilities and Hono helpers
│   │   ├── renderer.tsx  # HTML shell and page renderer
│   │   └── util.ts       # Asset helpers
│   ├── routes/           # Route handlers and page components
│   │   ├── app.tsx       # Main route definitions
│   │   └── tailwind-demo.tsx # Example page
│   └── index.tsx         # Server entry point
├── vite.config.ts        # Vite configuration
└── package.json
```

## Usage Guidelines

### Adding New Routes

Routes are defined in `src/routes/app.tsx` using Hono's routing API.

```tsx
// src/routes/app.tsx
import { page } from "../lib/renderer";

// Define a new route
app.get("/my-page", page(import("./my-page")));
```

Create the page component in `src/routes/my-page.tsx`:

```tsx
// src/routes/my-page.tsx
import type { PageProps } from "../lib/renderer";

export const meta = {
  title: "My Page",
};

export default function MyPage({ ctx }: PageProps) {
  return <h1>Hello from My Page!</h1>;
}
```

### Tailwind CSS v4

Tailwind CSS v4 is configured in `src/client/tailwind.css`. The new `@theme` directive allows you to configure theme variables directly in CSS.

```css
/* src/client/tailwind.css */
@import "tailwindcss";

@theme {
  --color-brand-500: #3b82f6;
  --font-display: "Satoshi", "sans-serif";
}
```

You can then use these variables in your markup:

```tsx
<div class="bg-brand-500 font-display">Custom branded content</div>
```

Check `src/routes/tailwind-demo.tsx` for a comprehensive example.

### Client-Side Interactivity

For client-side logic, use `src/client/main.ts`. This script is loaded as a module on every page.

```ts
// src/client/main.ts
console.log("Client-side script loaded");
```

### Authentication

We have included a simple authentication system using the `@auth/core` package. To use it, follow these steps:

**Prerequisites:**
Ensure environment variables are set for `AUTH_USER` and `AUTH_SECRET`.

```bash
export AUTH_USER=admin:password
export AUTH_SECRET=mysecretkey # optional
```

With `@auth/core` You can protect routes using the `onlySignedUser` middleware:

```ts
import { onlySignedUser } from "./lib/auth";

app.get("/protected", onlySignedUser(), (c) => c.text("Protected Content"));
```

This will redirect unauthenticated users to the sign-in page. If the user is authenticated, they will be redirected to the protected route.

You can also use the `getSession` function to retrieve the user's session:

```ts
import { getSession } from "./lib/auth";

const session = await getSession(c);
if (session?.user) {
  // User is authenticated
} else {
  // User is not authenticated
}
```

For more information on `@auth/core`, please refer to the [official documentation](https://authjs.dev/).

## Deployment

To build the application for production:

```bash
bun run build
```

This will generate a `dist` directory with the server and client assets. You can then run the built application:

```bash
bun dist/index.js
```
