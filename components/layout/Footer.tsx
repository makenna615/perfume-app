export default function Footer() {
  return (
    <footer className="bg-perfume-darker border-t border-slate-700/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-perfume-accent to-pale-blue bg-clip-text text-transparent mb-2">Scent Lab</h3>
            <p className="text-sm text-pale-purple/70">
              AI-powered perfume discovery and creation
            </p>
          </div>
          <p className="text-sm text-pale-purple/60">
            © 2026 Scent Lab. Powered by AI fragrance science.
          </p>
        </div>
      </div>
    </footer>
  );
}
