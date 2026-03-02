
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Zap, Plus, ExternalLink, BarChart3, 
  Copy, Search, Filter, Loader2
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
      title: "Copied!",
      description: "URL copied to clipboard.",
    });
  };

  const filteredLinks = links?.filter(l => 
    l.shortCode.toLowerCase().includes(search.toLowerCase()) || 
    l.originalUrl.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="glass-morphism border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent fill-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">QuickLinker</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-white" asChild>
            <Link href="/">Create New</Link>
          </Button>
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Links</h1>
            <p className="text-muted-foreground">Manage and monitor your shortened URLs.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/"><Plus className="w-4 h-4 mr-2" /> Shorten New Link</Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search links..." 
              className="pl-10 bg-white/5 border-white/10 h-11 focus:ring-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10 h-11">
            <Filter className="w-4 h-4 mr-2" /> Sort: Newest
          </Button>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <Card key={link.id} className="glass-morphism border-white/5 hover:border-white/10 transition-all overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <Link href={`/analytics/${link.shortCode}`} className="text-lg font-bold text-white hover:text-accent transition-colors">
                          /{link.shortCode}
                        </Link>
                        {link.expireAt && (
                          <Badge variant="outline" className="text-[10px] uppercase border-amber-500/30 text-amber-500 bg-amber-500/5">
                            Link usable till: {new Date(link.expireAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-xl">
                        {link.originalUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-muted-foreground hover:text-white"
                          onClick={() => copyToClipboard(link.shortCode)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-muted-foreground hover:text-accent"
                          asChild
                        >
                          <Link href={`/analytics/${link.shortCode}`}><BarChart3 className="w-4 h-4" /></Link>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-muted-foreground hover:text-white"
                          asChild
                        >
                          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 glass-morphism rounded-2xl border-dashed border-white/10">
              <Zap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No links found</h3>
              <p className="text-muted-foreground">Start by shortening your first long URL.</p>
              <Button className="mt-6 bg-primary" asChild><Link href="/">Shorten Link</Link></Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
