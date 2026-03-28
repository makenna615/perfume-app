export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">
        Perfume AI App
      </h1>

      <input
        type="text"
        placeholder="Enter a perfume name..."
        className="border p-2 rounded w-80 mb-4"
      />

      <button className="bg-black text-white px-4 py-2 rounded">
        Find Similar
      </button>
    </main>
  );
}