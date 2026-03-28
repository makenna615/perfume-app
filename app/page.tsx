import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "🔍 Discover Similar Perfumes",
      description: "Find your next favorite fragrance based on scent notes or perfume names",
      href: "/discover",
      icon: "✨",
    },
    {
      title: "🧪 DIY Perfume Builder",
      description: "Create custom formulas from your ingredients or inspired by a vibe",
      href: "/builder",
      icon: "🧬",
    },
    {
      title: "🧬 Ingredient Intelligence",
      description: "Master fragrance science with detailed ingredient profiles",
      href: "/ingredients",
      icon: "🔬",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-perfume-bg via-perfume-bg to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="text-7xl inline-block animate-pulse">🧴</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pale-blue via-perfume-accent to-pale-purple mb-4 animate-fade-in">
            Welcome to Scent Lab
          </h1>
          <p className="text-xl text-pale-purple/80 max-w-2xl mx-auto animate-fade-in-up">
            Discover, create, and master the art of perfume with AI-powered fragrance science
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group bg-slate-800/40 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-slate-700 hover:border-perfume-accent/50 hover:bg-slate-800/60"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-pale-blue mb-3 group-hover:text-pale-purple transition-colors">
                {feature.title}
              </h3>
              <p className="text-pale-purple/70 mb-6 text-base leading-relaxed">
                {feature.description}
              </p>
              <span className="text-perfume-accent font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                Explore
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Quick Start Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg shadow-lg p-12 border border-slate-700">
          <h2 className="text-3xl font-bold text-pale-blue mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-perfume-accent/20 border border-perfume-accent/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-bold text-pale-blue mb-2">Choose a Feature</h3>
              <p className="text-pale-purple/70 text-sm">
                Pick from discover, builder, or ingredients
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pale-purple/20 border border-pale-purple/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-bold text-pale-blue mb-2">Enter Your Input</h3>
              <p className="text-pale-purple/70 text-sm">
                Search a perfume, describe a vibe, or select ingredients
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pale-blue/20 border border-pale-blue/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-bold text-pale-blue mb-2">Get AI Results</h3>
              <p className="text-pale-purple/70 text-sm">
                Discover recommendations or generate custom formulas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}