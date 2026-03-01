"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Users, Smartphone, Globe, 
  ArrowUpRight, BrainCircuit, Share2, ExternalLink, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAnalytics, Link as LinkType } from "@/lib/db";
import { linkPerformanceInsight, LinkPerformanceInsightOutput } from "@/ai/flows/link-performance-insight-flow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#42E1FF', '#1F5C99', '#2E3D48', '#3B82F6'];

export function AnalyticsDashboard({ shortCode }: { shortCode: string }) {
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<LinkPerformanceInsightOutput | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    const analytics = getAnalytics(shortCode);
    setData(analytics);
  }, [shortCode]);

  const generateInsights = async () => {
    if (!data) return;
    setIsGeneratingInsights(true);
    try {
      const result = await linkPerformanceInsight({
        linkTitle: data.link.shortCode,
        shortCode: data.link.shortCode,
        originalUrl: data.link.originalUrl,
        totalClicks: data.totalClicks,
        dailyClicks: data.dailyClicks,
        referrers: data.referrers,
        deviceTypes: data.deviceTypes
      });
      setInsights(result);
    } catch (error) {
      console.error("Failed to generate insights", error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5">Analytics Dashboard</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            /{shortCode} <Share2 className="w-5 h-5 text-muted-foreground" />
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Targeting <span className="text-accent underline underline-offset-4 truncate max-w-md">{data.link.originalUrl}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10" onClick={() => window.open(data.link.originalUrl, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" /> Visit Original
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={generateInsights} disabled={isGeneratingInsights}>
            {isGeneratingInsights ? "Processing..." : (
              <><BrainCircuit className="w-4 h-4 mr-2" /> AI Insights</>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-morphism border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
              <Users className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-bold text-white">{data.totalClicks}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" /> All time
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Since</p>
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <p className="text-lg font-bold text-white">
              {new Date(data.link.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1 tracking-tight italic">
              Created {new Date(data.link.createdAt).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Top Referrer</p>
              <Globe className="w-4 h-4 text-accent" />
            </div>
            <p className="text-lg font-bold text-white truncate">
              {data.referrers[0]?.name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.referrers[0]?.count || 0} clicks
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Primary Device</p>
              <Smartphone className="w-4 h-4 text-accent" />
            </div>
            <p className="text-lg font-bold text-white">
              {data.deviceTypes[0]?.name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((data.deviceTypes[0]?.count / data.totalClicks) * 100) || 0}% share
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Click Breakdown Area Chart */}
        <Card className="lg:col-span-2 glass-morphism border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" /> Click Performance
            </CardTitle>
            <CardDescription>Daily traffic breakdown for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyClicks}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#42E1FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#42E1FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#42E1FF' }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#42E1FF" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution Pie Chart */}
        <Card className="glass-morphism border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Device Distribution</CardTitle>
            <CardDescription>Clicks by platform type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.deviceTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.deviceTypes.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {data.deviceTypes.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      {insights && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BrainCircuit className="w-6 h-6 text-accent" /> AI Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Summary</h4>
              <p className="text-muted-foreground leading-relaxed">{insights.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Key Trends</h4>
                <ul className="space-y-2">
                  {insights.keyInsights.map((insight, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Recommendations</h4>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrers List */}
      <Card className="glass-morphism border-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.referrers.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-white">{r.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{r.count}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
              </div>
            ))}
            {data.referrers.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No traffic sources recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}