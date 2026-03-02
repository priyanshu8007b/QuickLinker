"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link2, Clock, Hash, CheckCircle2, Copy, Loader2, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { moderateCustomAlias } from "@/ai/flows/alias-moderation-flow";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (include http/https)" }),
  customAlias: z.string().optional(),
  expireAt: z.string().optional(),
});

export function ShortenForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
            title: "ALIAS RESTRICTED",
            description: moderation.reason,
          });
          setIsLoading(false);
          return;
        }
      }

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
        expireAt: values.expireAt || null,
        userId: null 
      });

      const shortUrl = `${window.location.origin}/r/${shortCode}`;
      setResult(shortUrl);
      toast({
        title: "LINK DEPLOYED",
        description: "Your short URL is now active on the edge.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "DEPLOYMENT ERROR",
        description: error.message || "Could not finalize link shortening",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: "COPIED TO CLIPS",
        description: "Ready to share.",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10">
      <Card className="glass-morphism rounded-[2.5rem] border-white/10 glow-accent shadow-2xl p-4 overflow-visible">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-accent" /> DESTINATION TARGET
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://your-long-url.com/destination" 
                        {...field} 
                        className="bg-white/5 border-white/10 h-16 rounded-2xl focus:ring-accent font-bold text-lg tracking-tight placeholder:text-muted-foreground/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="customAlias"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Hash className="w-4 h-4 text-accent" /> CUSTOM ALIAS (OPT)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="my-link-id" 
                          {...field} 
                          className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-accent font-bold tracking-tight"
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
                    <FormItem className="flex flex-col space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" /> USABILITY TTL
                      </FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-14 bg-white/5 border-white/10 rounded-2xl pl-4 text-left font-bold hover:bg-white/10 transition-all",
                                !field.value && "text-muted-foreground/30"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>UNSET (FOREVER)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-morphism-heavy border-white/10 rounded-3xl mt-2" align="start">
                          <div className="p-6 space-y-6">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  const current = field.value ? new Date(field.value) : new Date();
                                  date.setHours(current.getHours());
                                  date.setMinutes(current.getMinutes());
                                  field.onChange(date.toISOString());
                                }
                              }}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                              className="rounded-2xl"
                            />
                            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SELECT TIME</label>
                              <Input 
                                type="time"
                                className="bg-white/10 border-white/10 h-12 rounded-xl [color-scheme:dark] font-bold"
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const date = field.value ? new Date(field.value) : new Date();
                                  date.setHours(parseInt(hours));
                                  date.setMinutes(parseInt(minutes));
                                  field.onChange(date.toISOString());
                                }}
                                value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                              />
                            </div>
                            <Button 
                              className="w-full bg-accent text-accent-foreground font-black uppercase tracking-widest h-12 rounded-xl hover:scale-[1.02] transition-transform"
                              onClick={() => setIsCalendarOpen(false)}
                            >
                              LOCK TIME
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl tracking-tighter rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] uppercase"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" /> INITIALIZING DEPLOYMENT...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    GENERATE PERFORMANCE LINK <ArrowRight className="w-6 h-6" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="animate-fade-in animate-float">
          <Card className="border-accent/40 bg-accent/5 overflow-hidden shadow-2xl rounded-[2.5rem] p-1">
            <div className="glass-morphism rounded-[2.2rem] p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mb-1">SYSTEM ONLINE • LIVE LINK</p>
                    <p className="text-3xl font-black text-white tracking-tighter truncate max-w-[300px] md:max-w-xl">
                      {result.replace('https://', '').replace('http://', '')}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={copyToClipboard} 
                  variant="secondary" 
                  className="gap-3 h-16 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  <Copy className="w-5 h-5" /> COPY LINK
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}