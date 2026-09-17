export default function Loading() {
  return (
    <main className="flex h-screen items-center justify-center bg-[#0d0b14]">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-900 border-t-transparent" />
        <p className="text-sm font-medium text-white/80">
          Loading workspace...
        </p>
      </div>
    </main>
  );
}
