import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage({ params }: { params: { shortCode: string } }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mini Nav */}
      <header className="glass-morphism border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-bold text-sm tracking-tight hidden md:inline">QuickLinker</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <AnalyticsDashboard shortCode={params.shortCode} />
      </main>
    </div>
  );
}