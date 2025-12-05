"use client";

import React, { Suspense } from "react";

function NotFoundContent() {
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

export default function NotFound() {
  return (
    <Suspense fallback={<main className="min-h-dvh flex items-center justify-center p-6"><p className="muted">Loading…</p></main>}>
      <NotFoundContent />
    </Suspense>
  );
}
