import React from "react";

// Ensure this page is dynamically rendered to avoid static prerender issues
export const dynamic = "force-dynamic";

// PUBLIC_INTERFACE
export default function NotFound() {
  /** 404 page rendered dynamically at runtime. */
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <section className="card p-6 max-w-lg w-full text-center" role="alert" aria-live="assertive">
        <h1 className="text-2xl font-semibold text-gray-800">404 – Page Not Found</h1>
        <p className="mt-2 muted">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
      </section>
    </main>
  );
}
