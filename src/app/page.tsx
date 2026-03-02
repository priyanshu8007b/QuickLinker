import Link from "next/link";
import { ShortenForm } from "@/components/shorten-form";
import { Zap, BarChart3, ShieldCheck, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-morphism border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-accent fill-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">QuickLinker</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-xs font-bold text-muted-foreground hover:text-white transition-colors tracking-widest">DASHBOARD</Link>
          <Link href="#features" className="text-xs font-bold text-muted-foreground hover:text-white transition-colors tracking-widest">FEATURES</Link>
          <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-xs h-9 px-5" asChild>
            <Link href="/dashboard">SIGN IN</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full -z-10" />
        
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center space-y-10 mb-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-accent/80 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
              </span>
              V2.0 Core Engine
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight text-gradient-subtle">
              High-Performance <br />
              <span className="text-accent/90">Redirect Infrastructure.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed opacity-80">
              Enterprise-grade URL shortening with built-in edge analytics. <br className="hidden md:block" /> Secure, scalable, and optimized for speed.
            </p>
          </div>

          <div className="animate-float-subtle">
            <ShortenForm />
          </div>
          
          <div className="flex items-center justify-center gap-6 pt-2">
            <Button variant="link" className="text-muted-foreground hover:text-white text-xs font-bold tracking-tight gap-2 group transition-opacity opacity-70 hover:opacity-100">
              API Docs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <div className="w-px h-3 bg-white/10" />
            <Button variant="link" className="text-muted-foreground hover:text-white text-xs font-bold tracking-tight gap-2 transition-opacity opacity-70 hover:opacity-100">
              <Github className="w-3.5 h-3.5" /> Source
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase opacity-90">Designed for reliability</h2>
            <p className="text-sm text-muted-foreground font-medium">Global infrastructure for seamless link management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Edge Delivery",
                description: "Low-latency redirection ensuring your links work instantly across the globe.",
                icon: <Zap className="w-6 h-6 text-accent/80" />
              },
              {
                title: "Deep Analytics",
                description: "Real-time insights into geography, devices, and traffic patterns.",
                icon: <BarChart3 className="w-6 h-6 text-accent/80" />
              },
              {
                title: "AI Security",
                description: "Automated content moderation protecting your brand and your users.",
                icon: <ShieldCheck className="w-6 h-6 text-accent/80" />
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl glass-morphism space-y-5 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-accent/5 transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.03] py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2 opacity-60">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className="text-white">QuickLinker</span>
          <span className="mx-2 text-white/10">|</span>
          <span>© 2024</span>
        </div>
        <div className="flex items-center gap-8 opacity-60">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  );
}