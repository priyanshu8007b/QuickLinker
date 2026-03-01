import Link from "next/link";
import { ShortenForm } from "@/components/shorten-form";
import { Zap, BarChart3, ShieldCheck, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-morphism border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent fill-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">QuickLinker</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Dashboard</Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Features</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-32 pb-16 px-6">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center space-y-8 mb-20">
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
              Performance First Architecture
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Shorten Links. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Analyze Everything.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The high-performance URL shortener built for scale. Real-time analytics, AI-powered insights, and lightning-fast redirects.
            </p>
          </div>

          <ShortenForm />
        </div>

        {/* Features Grid */}
        <section id="features" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "Low Latency",
              description: "Redirection latency stays under 100ms even during peak traffic spikes.",
              icon: <Zap className="w-6 h-6 text-accent" />
            },
            {
              title: "Deep Insights",
              description: "Track every click with detailed geography, device, and referrer data.",
              icon: <BarChart3 className="w-6 h-6 text-accent" />
            },
            {
              title: "AI Moderation",
              description: "Automatic flagging of offensive or trademarked custom aliases.",
              icon: <ShieldCheck className="w-6 h-6 text-accent" />
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl glass-morphism space-y-4 hover:border-accent/30 transition-all cursor-default group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </section>

        {/* Stats / Social Proof */}
        <section className="max-w-4xl mx-auto border-y border-white/5 py-12 flex flex-wrap items-center justify-around gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">99.9%</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">&lt;100ms</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Latency</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">100M+</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Links Created</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2024 QuickLinker Pro. Built for the modern web.</p>
      </footer>
    </div>
  );
}