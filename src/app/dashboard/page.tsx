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
      title: "COPIED TO CLIPS",
      description: "Short link ready for sharing.",
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
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-accent fill-accent" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">QuickLinker</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">Home</Link>
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-black text-accent shadow-glow shadow-accent/5">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Dashboard</h1>
            <p className="text-muted-foreground font-medium">Real-time status of your redirection infrastructure.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-primary/20" asChild>
            <Link href="/"><Plus className="w-5 h-5 mr-2" /> CREATE NEW LINK</Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH BY ALIAS OR TARGET URL..." 
              className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-accent font-bold text-sm tracking-tight placeholder:text-muted-foreground/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10 h-14 px-6 rounded-2xl bg-white/5 font-bold text-xs tracking-widest uppercase">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Links List */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
          ) : filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <Card key={link.id} className="glass-morphism border-white/5 hover:border-accent/20 transition-all duration-300 overflow-hidden group rounded-3xl">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-8 gap-8">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-4">
                        <Link href={`/analytics/${link.shortCode}`} className="text-3xl font-black text-white hover:text-accent transition-colors tracking-tighter uppercase">
                          /{link.shortCode}
                        </Link>
                        {link.expireAt && (
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.15em] border-amber-500/30 text-amber-500 bg-amber-500/5 px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3 mr-1.5 inline" /> Exp: {new Date(link.expireAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <ArrowUpRight className="w-3 h-3" />
                        <p className="text-sm truncate max-w-xl hover:text-white transition-colors cursor-default">
                          {link.originalUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button 
                        size="lg" 
                        variant="ghost" 
                        className="rounded-2xl h-12 w-12 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                        onClick={() => copyToClipboard(link.shortCode)}
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="ghost" 
                        className="rounded-2xl h-12 w-12 text-muted-foreground hover:text-accent bg-white/5 hover:bg-white/10 transition-all"
                        asChild
                      >
                        <Link href={`/analytics/${link.shortCode}`}><BarChart3 className="w-5 h-5" /></Link>
                      </Button>
                      <Button 
                        size="lg" 
                        variant="ghost" 
                        className="rounded-2xl h-12 w-12 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                        asChild
                      >
                        <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-5 h-5" /></a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-32 glass-morphism rounded-[3rem] border-dashed border-white/10 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
                <Zap className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Active Links</h3>
                <p className="text-muted-foreground font-medium">You haven't generated any performance links yet.</p>
              </div>
              <Button className="mt-4 bg-primary rounded-full px-10 h-12 font-bold" asChild><Link href="/">GET STARTED</Link></Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}