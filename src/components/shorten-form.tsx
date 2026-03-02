
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link2, Clock, Hash, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { moderateCustomAlias } from "@/ai/flows/alias-moderation-flow";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (include http/https)" }),
  customAlias: z.string().optional(),
  expireAt: z.string().optional(),
});

export function ShortenForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      customAlias: "",
      expireAt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      let shortCode = values.customAlias || Math.random().toString(36).substring(2, 8);
      
      if (values.customAlias) {
        const moderation = await moderateCustomAlias({ alias: values.customAlias });
        if (moderation.isModerated) {
          toast({
            variant: "destructive",
            title: "Alias Flagged",
            description: moderation.reason,
          });
          setIsLoading(false);
          return;
        }
      }

      // Canonicalize URL
      let targetUrl = values.url;
      if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
      }

      const linkRef = doc(db, "public_urls", shortCode);
      
      await setDoc(linkRef, {
        id: shortCode,
        shortCode: shortCode,
        originalUrl: targetUrl,
        createdAt: serverTimestamp(),
        expireAt: values.expireAt ? new Date(values.expireAt).toISOString() : null,
        userId: null // Public link
      });

      const shortUrl = `${window.location.origin}/r/${shortCode}`;
      setResult(shortUrl);
      toast({
        title: "Success!",
        description: "Your short URL is ready.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to shorten URL",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard.",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="glass-morphism overflow-hidden">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground flex items-center gap-2">
                      <Link2 className="w-4 h-4" /> Destination URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/very-long-url-path" 
                        {...field} 
                        className="bg-background/50 border-white/10 h-12 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customAlias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-2">
                        <Hash className="w-4 h-4" /> Custom Alias (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="my-cool-link" 
                          {...field} 
                          className="bg-background/50 border-white/10 h-12 focus:ring-accent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expireAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Link usable till (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          className="bg-background/50 border-white/10 h-12 focus:ring-accent [color-scheme:dark]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Shortening...
                  </span>
                ) : "Shorten URL"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="animate-fade-in">
          <Card className="border-accent/30 bg-accent/5 overflow-hidden glow-accent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Short Link</p>
                    <p className="text-lg font-bold text-accent truncate max-w-[300px] md:max-w-md">
                      {result}
                    </p>
                  </div>
                </div>
                <Button onClick={copyToClipboard} variant="secondary" className="gap-2 border-white/10">
                  <Copy className="w-4 h-4" /> Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
