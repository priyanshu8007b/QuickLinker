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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b px-8 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-50">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary fill-primary" />
          <span className="text-xl font-bold">QuickLinker</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:text-primary">Home</Link>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">Your Links</h1>
            <p className="text-muted-foreground">Manage and track your active performance redirects.</p>
          </div>
          <Button asChild>
            <Link href="/"><Plus className="w-4 h-4 mr-2" /> Create New</Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by short code or URL..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Sort
          </Button>
        </div>

        {/* Links List */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <Card key={link.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/analytics/${link.shortCode}`} className="text-2xl font-bold hover:text-primary transition-colors">
                          /{link.shortCode}
                        </Link>
                        {link.expireAt && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                            <Clock className="w-3 h-3 mr-1" /> Expiration: {new Date(link.expireAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <p className="truncate">{link.originalUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(link.shortCode)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/analytics/${link.shortCode}`}><BarChart3 className="w-4 h-4" /></Link>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <h3 className="text-xl font-semibold mb-2">No links found</h3>
              <p className="text-muted-foreground mb-6">Create your first link to start tracking performance.</p>
              <Button asChild><Link href="/">Get Started</Link></Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
