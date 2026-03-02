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
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Zap className="w-6 h-6 text-accent fill-accent" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">QUICKLINKER</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors">DASHBOARD</Link>
          <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors">FEATURES</Link>
          <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold px-6" asChild>
            <Link href="/dashboard">SIGN IN</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10" />
        
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center space-y-12 mb-32">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              V2.0 RELEASED • PERFORMANCE ENGINE
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-gradient">
              THE WORLD'S FASTEST <br />
              <span className="text-accent italic">REDIRECT ENGINE.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Deploy shortened links that redirect in under 100ms. Integrated with high-fidelity analytics and AI-driven growth insights.
            </p>
          </div>

          <div className="animate-float">
            <ShortenForm />
          </div>
          
          <div className="flex items-center justify-center gap-6 pt-4">
            <Button variant="link" className="text-muted-foreground hover:text-white font-bold tracking-tight gap-2 group">
              View API Documentation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="w-px h-4 bg-white/10" />
            <Button variant="link" className="text-muted-foreground hover:text-white font-bold tracking-tight gap-2">
              <Github className="w-4 h-4" /> Open Source
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter text-white">BUILT FOR MODERN TEAMS</h2>
            <p className="text-muted-foreground font-medium">Everything you need to manage links at global scale.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Edge Delivery",
                description: "Global low-latency redirection infrastructure ensures your links work instantly, everywhere.",
                icon: <Zap className="w-8 h-8 text-accent" />
              },
              {
                title: "Rich Analytics",
                description: "Deep dive into geography, devices, and referrers with beautiful, real-time dashboards.",
                icon: <BarChart3 className="w-8 h-8 text-accent" />
              },
              {
                title: "AI Moderation",
                description: "Our neural engine automatically filters offensive content and protects your brand equity.",
                icon: <ShieldCheck className="w-8 h-8 text-accent" />
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] glass-morphism space-y-6 hover:bg-white/[0.03] hover:border-accent/20 transition-all duration-500 group border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-500 shadow-inner">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-muted-foreground font-medium">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-bold text-white tracking-tight">QUICKLINKER PRO</span>
          <span className="mx-2 text-white/10">|</span>
          <span>© 2024</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">System Status</Link>
        </div>
      </footer>
    </div>
  );
}