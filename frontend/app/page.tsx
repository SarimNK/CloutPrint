"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Target, Rocket, Users, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "AI-Powered Merch",
      description: "Generate provocative designs that actually sell. No more boring developer t-shirts.",
      stat: "10x",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Clone Viral Strategies",
      description: "Reverse-engineer successful brands like Cluely. Learn from the best, then do it better.",
      stat: "500+",
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Ship & Scale Fast",
      description: "From idea to Shopify store in minutes. Stop overthinking, start shipping.",
      stat: "< 5min",
    },
  ]

  const testimonials = [
    {
      quote: "Went from unknown dev to 50K Twitter followers. CloutPrint taught me marketing is code.",
      author: "@builderjane",
      role: "Full-stack Dev → Brand Builder",
    },
    {
      quote: "My 'Code or Die' hoodie made $10K in the first week. Now VCs slide into MY DMs.",
      author: "@hackermike",
      role: "Ex-FAANG → Indie Hacker",
    },
    {
      quote: "Finally, a tool that gets it. Being technical isn't enough anymore.",
      author: "@devrebel",
      role: "Senior Engineer → Thought Leader",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-8 border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              The Anti-VC Playbook
            </Badge>

            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              <span className="text-balance">Marketing is the</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">New Moat</span>
              <br />
              <span className="text-balance">for Your Product</span>
            </h1>

            <div className="mt-8 text-xl text-muted-foreground sm:text-2xl">
              <p className="text-balance leading-relaxed">
                Stop being a sh*tty developer who can't market.
                <br />
                Build your brand <em>alongside</em> your tech.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="group h-14 px-8 text-lg font-semibold"
                onClick={() => document.getElementById("modes")?.scrollIntoView({ behavior: "smooth" })}
              >
                Start Your Rebellion
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                See the Proof
              </Button>
            </div>

            <div className="mt-16 text-sm text-muted-foreground">
              <p>{"Who needs VC funding when you've got viral marketing?"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Why Should Only the Big Dogs Get to Have Fun?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Break out of the code monkey box. Marketing and tech aren't enemies—they're your competitive advantage.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {feature.stat}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>

                  {hoveredFeature === index && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selection */}
      <section id="modes" className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Choose Your Weapon</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Two paths to building your empire. Pick your poison.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
            {/* From Scratch Mode */}
            <Card className="group relative overflow-hidden border-2 border-primary/20 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black">From Scratch</CardTitle>
                    <CardDescription className="text-base">Pure AI-powered creation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Start with your brand vision. Our AI generates provocative designs that actually convert. No
                  templates, no limits—just pure creative rebellion.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    AI-generated slogans & designs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Instant mockups & previews
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Direct Shopify integration
                  </li>
                </ul>
                <Button asChild className="w-full mt-6 h-12 text-base font-semibold group">
                  <Link href="/from-scratch">
                    Create New Merch
                    <Rocket className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Template Mode */}
            <Card className="group relative overflow-hidden border-2 border-secondary/20 bg-card transition-all duration-300 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black">Clone & Adapt</CardTitle>
                    <CardDescription className="text-base">Reverse-engineer success</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Study viral brands like Cluely, then create your own version. Learn from the best, adapt their
                  strategies, dominate your niche.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Brand strategy analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Competitive intelligence
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Adapted designs & messaging
                  </li>
                </ul>
                <Button asChild variant="secondary" className="w-full mt-6 h-12 text-base font-semibold group">
                  <Link href="/template">
                    Clone a Viral Strategy
                    <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              From Code Monkeys to Marketing Legends
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Real developers who stopped putting themselves in boxes.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <blockquote className="text-foreground">
                    <p className="text-lg font-medium leading-relaxed">"{testimonial.quote}"</p>
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            <span className="text-balance">Don't Put Yourself in a Box.</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Grow Your Brand With Your Tech.
            </span>
          </h2>

          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            The tech world is becoming vapid and hype-based.
            <br />
            We're here to help you take advantage of it.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold group">
              Start Building Your Empire
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Join 10K+ rebel developers</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Launch in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
              <span className="text-xl font-black text-foreground">CloutPrint</span>
            </div>
            <p className="text-sm text-muted-foreground">Built for developers who refuse to stay in their lane.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
