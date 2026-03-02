import Link from "next/link";
import { ShortenForm } from "@/components/shorten-form";
import { Zap, BarChart3, ShieldCheck, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary fill-primary" />
          <span className="text-xl font-bold tracking-tight">QuickLinker</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 px-6 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Shorten links. <br />
              <span className="text-primary">Track performance.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade URL shortening with built-in analytics. 
              Fast, secure, and reliable redirection for every link you share.
            </p>
          </div>

          <ShortenForm />
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto space-y-12">
          <h2 className="text-3xl font-bold text-center">Built for reliability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Redirection",
                description: "Optimized routing ensuring your users get to their destination instantly.",
                icon: <Zap className="w-8 h-8 text-primary" />
              },
              {
                title: "Real-time Analytics",
                description: "Monitor clicks, device types, and traffic patterns as they happen.",
                icon: <BarChart3 className="w-8 h-8 text-primary" />
              },
              {
                title: "Smart Security",
                description: "Built-in content moderation and expiration controls for safer sharing.",
                icon: <ShieldCheck className="w-8 h-8 text-primary" />
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border bg-card space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold">QuickLinker</span>
            <span className="text-muted-foreground text-sm">© 2024</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Terms</Link>
            <Link href="https://github.com" className="flex items-center gap-2 hover:text-primary">
              <Github className="w-4 h-4" /> Github
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
