"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SparklesIcon, BeakerIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import PerfumeLogoIcon from "@/components/ui/PerfumeLogoIcon";

export default function Home() {
  const features = [
    {
      title: "Discover Similar Perfumes",
      description: "Find your next favorite fragrance based on scent profiles, notes, or perfume names",
      href: "/discover",
      icon: SparklesIcon,
      color: "from-pale-blue to-cyan-400",
      ctaGradient: "from-[#6c7ee7] via-[#4f9dd8] to-cyan-400",
      delay: 0,
    },
    {
      title: "DIY Perfume Builder",
      description: "Create custom formulas with optimization modes, volume scaling, and cost estimation",
      href: "/builder",
      icon: BeakerIcon,
      color: "from-perfume-accent to-purple-400",
      ctaGradient: "from-[#b148ff] via-[#9650ff] to-[#7a64ff]",
      delay: 0.1,
    },
    {
      title: "Ingredient Intelligence",
      description: "Master fragrance science with detailed profiles, suppliers, and substitutes",
      href: "/ingredients",
      icon: AdjustmentsHorizontalIcon,
      color: "from-pale-green to-emerald-400",
      ctaGradient: "from-[#46a1a3] via-pale-green to-emerald-400",
      delay: 0.2,
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-20">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-perfume-accent/30 rounded-full blur-3xl animate-pulse" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 will-change-transform"
          >
            <span className="inline-flex rounded-3xl p-4 bg-gradient-to-br from-perfume-accent/25 to-pale-green/20 border border-perfume-accent/20">
              <PerfumeLogoIcon className="w-14 h-14 md:w-16 md:h-16" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-5xl md:text-7xl font-playfair font-bold text-gradient-luxury mb-6 will-change-transform"
          >
            Welcome to Memories Into Perfumes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg md:text-2xl text-pale-purple/80 max-w-3xl mx-auto font-inter leading-relaxed will-change-transform"
          >
            Discover, create, and master the art of perfume with AI-powered fragrance science.
            Explore premium ingredients, build custom formulas, and find your next signature scent.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: feature.delay * 0.5 }}
                className="will-change-transform"
              >
                <Link href={feature.href}>
                  <div className="card-luxury group h-full p-8 md:p-10 flex flex-col hover:border-perfume-accent/50 hover:shadow-luxury cursor-pointer transition-all duration-200">
                    <div className={`mb-6 inline-flex w-fit p-4 rounded-2xl bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity`}>
                      <Icon className="w-8 h-8 md:w-10 md:h-10" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-playfair font-bold text-pale-blue mb-4 group-hover:text-gradient transition-all">
                      {feature.title}
                    </h3>

                    <p className="text-slate-300 mb-8 flex-grow font-inter text-base md:text-lg leading-relaxed">
                      {feature.description}
                    </p>

                    <div
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white font-semibold shadow-premium group-hover:gap-3 group-hover:shadow-luxury transition-all bg-gradient-to-r ${feature.ctaGradient}`}
                    >
                      <span>Explore</span>
                      <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="card-luxury p-12 md:p-16 mb-20">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gradient-luxury mb-4 text-center">
            How It Works
          </h2>
          <p className="text-pale-purple/80 text-center mb-12 max-w-2xl mx-auto font-inter text-lg">
            Get perfume recommendations and create custom formulas in three simple steps
          </p>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                step: "01",
                title: "Choose Your Path",
                description: "Select from three powerful features: discover similar perfumes, build custom formulas, or explore ingredients",
                icon: "Select",
              },
              {
                step: "02",
                title: "Provide Your Input",
                description: "Search a perfume, describe a mood, select ingredients, or define optimization preferences",
                icon: "Describe",
              },
              {
                step: "03",
                title: "Get AI Results",
                description: "Instantly receive AI-generated recommendations, formulas, or detailed ingredient intelligence",
                icon: "Create",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative min-h-[220px]"
              >
                <div className="absolute -top-6 -left-3 text-5xl md:text-6xl font-playfair font-bold text-perfume-accent/10 leading-none">
                  {item.step}
                </div>

                <div className="relative pt-12">
                  <div className="text-xs md:text-sm font-semibold uppercase tracking-[0.14em] text-pale-green mb-5">{item.icon}</div>
                  <h3 className="text-xl font-playfair font-bold text-pale-blue mb-3">{item.title}</h3>
                  <p className="text-slate-300 font-inter leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-pale-blue mb-6">
            Ready to Explore?
          </h2>
          <p className="text-pale-purple/80 mb-8 max-w-xl mx-auto font-inter text-lg">
            Start your fragrance journey now. All features are powered by cutting-edge AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/discover"
              className="px-8 py-4 rounded-2xl border-0 bg-gradient-to-r from-[#5f7de5] via-[#4f9dd8] to-cyan-400 font-semibold text-white shadow-[0_10px_30px_rgba(79,157,216,0.35)] hover:shadow-[0_14px_34px_rgba(79,157,216,0.45)] hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200 text-center"
            >
              Start Discovering
            </Link>
            <Link
              href="/builder"
              className="px-8 py-4 rounded-2xl border-0 bg-gradient-to-r from-[#b148ff] via-[#9650ff] to-[#7a64ff] text-white font-semibold shadow-[0_10px_30px_rgba(177,72,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(177,72,255,0.46)] hover:brightness-110 transition-all duration-200 text-center"
            >
              Build Your Formula
            </Link>
            <Link
              href="/ingredients"
              className="px-8 py-4 rounded-2xl border-0 bg-gradient-to-r from-[#46a1a3] via-pale-green to-emerald-400 font-semibold text-white shadow-[0_10px_30px_rgba(70,161,163,0.35)] hover:shadow-[0_14px_34px_rgba(70,161,163,0.45)] hover:-translate-y-0.5 hover:brightness-110 transition-all duration-200 text-center"
            >
              Search Ingredients
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
