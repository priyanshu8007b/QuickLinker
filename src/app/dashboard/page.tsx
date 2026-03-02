"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Zap, Plus, ExternalLink, BarChart3, 
  Copy, Search, Filter, Loader2, ArrowUpRight, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const db = useFirestore();

  const linksQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "public_urls"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: links, isLoading } = useCollection(linksQuery);

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Link copied to clipboard.",
    });
  };

  const filteredLinks = links?.filter(l => 
    l.shortCode.toLowerCase().includes(search.toLowerCase()) || 
    l.originalUrl.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Navigation */}
      <header className="glass-morphism border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent fill-accent" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase">QuickLinker</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[10px] font-bold text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">Home</Link>
          <div className="w-7 h-7 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-muted-foreground font-medium opacity-70">Manage your active redirects and performance.</p>
          </div>
          <Button className="bg-primary hover:opacity-90 text-white font-bold h-10 px-6 rounded-lg text-xs" asChild>
            <Link href="/"><Plus className="w-4 h-4 mr-2" /> New Link</Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
            <Input 
              placeholder="Filter links..." 
              className="pl-10 bg-white/[0.03] border-white/5 h-12 rounded-xl focus:ring-accent font-medium text-sm placeholder:text-muted-foreground/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/5 h-12 px-5 rounded-xl bg-white/[0.03] font-bold text-[10px] tracking-widest uppercase">
            <Filter className="w-3.5 h-3.5 mr-2" /> Sort
          </Button>
        </div>

        {/* Links List */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 text-accent/40 animate-spin" />
            </div>
          ) : filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <Card key={link.id} className="glass-morphism border-white/[0.03] hover:border-white/10 transition-all duration-300 rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/analytics/${link.shortCode}`} className="text-xl font-bold text-white hover:text-accent transition-colors tracking-tight">
                          /{link.shortCode}
                        </Link>
                        {link.expireAt && (
                          <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-amber-500/20 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-md">
                            <Clock className="w-2.5 h-2.5 mr-1 inline" /> {new Date(link.expireAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground opacity-60">
                        <ArrowUpRight className="w-3 h-3" />
                        <p className="text-xs truncate max-w-lg font-medium">
                          {link.originalUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-lg h-9 w-9 text-muted-foreground hover:text-white bg-white/[0.03] hover:bg-white/[0.08]"
                        onClick={() => copyToClipboard(link.shortCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-lg h-9 w-9 text-muted-foreground hover:text-accent bg-white/[0.03] hover:bg-white/[0.08]"
                        asChild
                      >
                        <Link href={`/analytics/${link.shortCode}`}><BarChart3 className="w-4 h-4" /></Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-lg h-9 w-9 text-muted-foreground hover:text-white bg-white/[0.03] hover:bg-white/[0.08]"
                        asChild
                      >
                        <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-24 glass-morphism rounded-3xl border-dashed border-white/5 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center">
                <Zap className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white opacity-80">No links found</h3>
                <p className="text-xs text-muted-foreground opacity-60">Start by creating your first performance redirect.</p>
              </div>
              <Button className="mt-2 bg-primary text-xs rounded-lg px-6 h-9 font-bold" asChild><Link href="/">Get Started</Link></Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}