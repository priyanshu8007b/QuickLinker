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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format, setMonth, setDate, setYear, setHours, setMinutes, getYear, getMonth, getDate, getHours, getMinutes } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  url: z.string().url({ message: "Invalid URL. Include http/https." }),
  customAlias: z.string().optional(),
  expireAt: z.string().optional(),
});

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = getYear(new Date());
const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

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

  const handleDateChange = (type: 'month' | 'day' | 'year' | 'hour' | 'minute', value: string, currentValue: string | undefined, onChange: (val: string) => void) => {
    let date = currentValue ? new Date(currentValue) : new Date();
    
    switch (type) {
      case 'month':
        date = setMonth(date, parseInt(value));
        break;
      case 'day':
        date = setDate(date, parseInt(value));
        break;
      case 'year':
        date = setYear(date, parseInt(value));
        break;
      case 'hour':
        date = setHours(date, parseInt(value));
        break;
      case 'minute':
        date = setMinutes(date, parseInt(value));
        break;
    }
    
    onChange(date.toISOString());
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
                        <PopoverContent className="w-[320px] p-0" align="start">
                          <div className="p-4 space-y-4 bg-card border rounded-lg shadow-xl">
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Date</label>
                              <div className="grid grid-cols-1 gap-2">
                                <Select 
                                  value={field.value ? getMonth(new Date(field.value)).toString() : ""} 
                                  onValueChange={(v) => handleDateChange('month', v, field.value, field.onChange)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Month" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {months.map((m, i) => (
                                      <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="grid grid-cols-2 gap-2">
                                  <Select 
                                    value={field.value ? getDate(new Date(field.value)).toString() : ""} 
                                    onValueChange={(v) => handleDateChange('day', v, field.value, field.onChange)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {days.map((d) => (
                                        <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Select 
                                    value={field.value ? getYear(new Date(field.value)).toString() : ""} 
                                    onValueChange={(v) => handleDateChange('year', v, field.value, field.onChange)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Time</label>
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={field.value ? getHours(new Date(field.value)).toString() : ""} 
                                  onValueChange={(v) => handleDateChange('hour', v, field.value, field.onChange)}
                                >
                                  <SelectTrigger className="h-9 flex-1">
                                    <SelectValue placeholder="Hour" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hours.map((h) => (
                                      <SelectItem key={h} value={parseInt(h).toString()}>{h}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-muted-foreground">:</span>
                                <Select 
                                  value={field.value ? getMinutes(new Date(field.value)).toString() : ""} 
                                  onValueChange={(v) => handleDateChange('minute', v, field.value, field.onChange)}
                                >
                                  <SelectTrigger className="h-9 flex-1">
                                    <SelectValue placeholder="Min" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {minutes.map((m) => (
                                      <SelectItem key={m} value={parseInt(m).toString()}>{m}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                              <Button 
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  field.onChange("");
                                  setIsCalendarOpen(false);
                                }}
                              >
                                Clear
                              </Button>
                              <Button 
                                className="flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsCalendarOpen(false);
                                }}
                              >
                                Done
                              </Button>
                            </div>
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
