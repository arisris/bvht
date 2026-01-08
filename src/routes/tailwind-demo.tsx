import type { PageProps } from "../lib/renderer";

export const meta = {
  title: "Tailwind v4 Demo",
  description: "A demonstration of Tailwind CSS v4 features in this template.",
};

export default function TailwindDemo({ ctx }: PageProps) {
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <header class="text-center space-y-4">
          <h1 class="text-4xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
            Tailwind CSS v4 Demo
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Showcasing the new configuration features and standard utilities.
          </p>
          <div class="flex justify-center gap-4">
            <a href="/" class="text-brand-600 hover:text-brand-500 underline">
              Back to Home
            </a>
            <button
              id="toggle-theme"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Toggle Theme
            </button>
          </div>
        </header>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-gray-200 dark:border-gray-800 pb-2">
            Custom Theme Colors
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            These colors are defined in <code>src/client/tailwind.css</code> using the
            <code>@theme</code> directive.
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div class="p-4 rounded-lg bg-brand-100 text-brand-900 text-center font-medium">
              brand-100
            </div>
            <div class="p-4 rounded-lg bg-brand-300 text-brand-900 text-center font-medium">
              brand-300
            </div>
            <div class="p-4 rounded-lg bg-brand-500 text-white text-center font-medium">
              brand-500
            </div>
            <div class="p-4 rounded-lg bg-brand-700 text-white text-center font-medium">
              brand-700
            </div>
            <div class="p-4 rounded-lg bg-brand-900 text-white text-center font-medium">
              brand-900
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-gray-200 dark:border-gray-800 pb-2">
            Components
          </h2>

          <div class="grid md:grid-cols-2 gap-6">
            {/* Card Example */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              <div class="h-32 bg-gradient-to-r from-brand-400 to-brand-600"></div>
              <div class="p-6 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-1 text-xs font-semibold bg-brand-100 text-brand-700 rounded-full">
                    New
                  </span>
                  <span class="text-sm text-gray-500">Just released</span>
                </div>
                <h3 class="text-xl font-bold">Card Component</h3>
                <p class="text-gray-600 dark:text-gray-300">
                  This card demonstrates standard utility classes for spacing,
                  colors, shadows, and typography.
                </p>
                <button class="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors font-medium">
                  Action
                </button>
              </div>
            </div>

            {/* Grid & Layout Example */}
            <div class="space-y-4">
              <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <h3 class="text-lg font-bold mb-2">Flexbox</h3>
                <div class="flex gap-2 mb-4">
                  <div class="flex-1 h-8 bg-brand-200 rounded"></div>
                  <div class="flex-1 h-8 bg-brand-300 rounded"></div>
                  <div class="flex-1 h-8 bg-brand-400 rounded"></div>
                </div>
                <h3 class="text-lg font-bold mb-2">Grid</h3>
                <div class="grid grid-cols-3 gap-2">
                  <div class="h-8 bg-purple-200 rounded"></div>
                  <div class="h-8 bg-purple-300 rounded"></div>
                  <div class="h-8 bg-purple-400 rounded"></div>
                  <div class="h-8 bg-pink-200 rounded"></div>
                  <div class="h-8 bg-pink-300 rounded"></div>
                  <div class="h-8 bg-pink-400 rounded"></div>
                </div>
              </div>

               <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <h3 class="text-lg font-bold mb-4">Typography</h3>
                <div class="space-y-2">
                   <p class="text-sm">Small text</p>
                   <p class="text-base">Base text</p>
                   <p class="text-lg">Large text</p>
                   <p class="text-xl font-bold text-brand-600">Brand Color Text</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
