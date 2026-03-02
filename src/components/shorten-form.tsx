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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="border-2">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-primary" /> Destination URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/very-long-url" {...field} className="h-12" />
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
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary" /> Alias (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="my-custom-link" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expireAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" /> Link usable till
                      </FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-12 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP p")
                              ) : (
                                <span>No Expiration</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-4 space-y-4 bg-card border rounded-lg shadow-xl">
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
                            />
                            <div className="flex flex-col gap-2 pt-2 border-t">
                              <label className="text-xs font-semibold text-muted-foreground">Set Time</label>
                              <Input 
                                type="time"
                                className="h-10 [color-scheme:dark]"
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
                              className="w-full mt-2"
                              onClick={() => setIsCalendarOpen(false)}
                            >
                              Done
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Shortening...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Shorten Link <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Success! Link Ready:</p>
                <p className="text-xl font-bold truncate max-w-[200px] md:max-w-md">{result}</p>
              </div>
            </div>
            <Button onClick={copyToClipboard} variant="secondary" className="gap-2">
              <Copy className="w-4 h-4" /> Copy Link
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
