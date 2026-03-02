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
  url: z.string().url({ message: "Invalid URL. Include http/https." }),
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
            title: "Alias Restricted",
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
        title: "Link Ready",
        description: "Your link is now active.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to shorten link",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: "Copied",
        description: "Ready to share.",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="glass-morphism-heavy rounded-2xl border-white/[0.05] glow-subtle p-2">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 opacity-60">
                      <Link2 className="w-3.5 h-3.5 text-accent" /> Destination URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/long-url" 
                        {...field} 
                        className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:ring-accent font-medium text-sm placeholder:text-muted-foreground/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customAlias"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 opacity-60">
                        <Hash className="w-3.5 h-3.5 text-accent" /> Alias (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="my-link" 
                          {...field} 
                          className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:ring-accent font-medium text-sm"
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
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 opacity-60">
                        <Clock className="w-3.5 h-3.5 text-accent" /> Expiration
                      </FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-12 bg-white/[0.03] border-white/5 rounded-xl px-4 text-left font-medium text-sm hover:bg-white/[0.05] transition-all",
                                !field.value && "text-muted-foreground/30"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>No Expiration</span>
                              )}
                              <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-40" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-morphism-heavy border-white/10 rounded-2xl mt-2 shadow-2xl" align="start">
                          <div className="p-4 space-y-4">
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
                              className="rounded-xl"
                            />
                            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Set Time</label>
                              <Input 
                                type="time"
                                className="bg-white/5 border-white/5 h-10 rounded-lg [color-scheme:dark] font-bold text-xs"
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
                              className="w-full bg-primary text-primary-foreground font-bold text-xs h-10 rounded-lg hover:opacity-90 transition-opacity"
                              onClick={() => setIsCalendarOpen(false)}
                            >
                              Confirm
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
                className="w-full h-14 bg-primary hover:opacity-90 text-white font-bold text-sm tracking-tight rounded-xl transition-all shadow-lg shadow-primary/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Shortening...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Generate Link <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="animate-fade-in">
          <Card className="glass-morphism rounded-2xl border-accent/20 overflow-hidden shadow-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[9px] text-accent font-bold uppercase tracking-widest mb-0.5 opacity-80">Link Active</p>
                  <p className="text-lg font-bold text-white tracking-tight truncate max-w-[200px] md:max-w-md">
                    {result.replace('https://', '').replace('http://', '')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={copyToClipboard} 
                variant="secondary" 
                className="gap-2 h-11 px-6 rounded-lg bg-white text-black font-bold text-xs hover:bg-white/90 transition-all"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}