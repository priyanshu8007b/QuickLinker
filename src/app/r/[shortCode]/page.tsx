
"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RedirectPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = use(params);
  const router = useRouter();
  const db = useFirestore();

  const publicLinkRef = useMemoFirebase(() => {
    if (!db || !shortCode) return null;
    return doc(db, "public_urls", shortCode);
  }, [db, shortCode]);

  const { data: link, isLoading, error } = useDoc(publicLinkRef);

  useEffect(() => {
    if (link && link.originalUrl && db && shortCode) {
      // Record click (non-blocking)
      const clicksRef = collection(db, "public_urls", shortCode, "clicks");
      addDoc(clicksRef, {
        urlId: shortCode,
        clickedAt: serverTimestamp(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
        ipHash: 'anonymous',
      }).catch(err => {
        // Silently fail click recording to prioritize redirection speed
      });

      // Perform the redirect using location.replace to keep browser history clean
      window.location.replace(link.originalUrl);
    }
  }, [link, db, shortCode]);

  // Show loading if:
  // 1. Explicitly loading
  // 2. We have a reference but no data/error yet (initial state before hook effect runs)
  // 3. We are still waiting for the params or db to initialize
  const isActuallyLoading = isLoading || (publicLinkRef && !link && !error) || !publicLinkRef;

  if (isActuallyLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <h1 className="text-xl font-bold text-white">Redirecting you...</h1>
        <p className="text-muted-foreground">Hang tight, we're getting you there fast.</p>
      </div>
    );
  }

  // Only show "Link Not Found" if we have finished loading and the link definitively doesn't exist
  if (error || (!link && !isLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Link Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The short link you followed doesn't exist, has expired, or was removed.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">Back to QuickLinker</Link>
        </Button>
      </div>
    );
  }

  return null;
}
