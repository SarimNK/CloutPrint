"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Zap, Loader2, ExternalLink, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { 
  publish, 
  subscribe, 
  connect, 
  disconnect, 
  generateRequestId,
  type DropState,
  type Idea,
  type DesignRequestPayload,
  type IdeasGeneratedPayload,
  type ImageRequestPayload,
  type ImageGeneratedPayload,
  type ShopifyProductCreatedPayload,
  type ErrorPayload
} from "@/lib/solace"

const VIBE_OPTIONS = [
  "provocative",
  "hacker", 
  "minimal",
  "retro",
  "gradient"
]

const ITEM_OPTIONS = [
  "tshirt",
  "poster",
  "hoodie",
  "sticker"
]

export default function FromScratchPage() {
  const [state, setState] = useState<DropState>({
    requestId: generateRequestId(),
    mode: "scratch",
    feed: []
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
  const [isRenderingImage, setIsRenderingImage] = useState(false)

  useEffect(() => {
    // Connect to Solace on component mount
    const initConnection = async () => {
      try {
        await connect()
        setIsConnected(true)
        
        // Subscribe to relevant topics
        await subscribe("ai/design/ideas/generated", handleIdeasGenerated)
        await subscribe("ai/image/generated", handleImageGenerated)
        await subscribe("shopify/product/created", handleProductCreated)
        await subscribe("ai/design/error", handleError)
        await subscribe("ai/image/error", handleError)
        await subscribe("shopify/product/error", handleError)
        
        addFeedEvent("Connected to Solace", "system")
      } catch (error) {
        console.error("Failed to connect to Solace:", error)
        addFeedEvent("Failed to connect to Solace", "error")
      }
    }

    initConnection()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [])

  const addFeedEvent = (message: string, type: string) => {
    setState(prev => ({
      ...prev,
      feed: [
        ...prev.feed,
        {
          ts: Date.now(),
          topic: type,
          payload: { message }
        }
      ]
    }))
  }

  const handleIdeasGenerated = (payload: IdeasGeneratedPayload) => {
    if (payload.requestId === state.requestId) {
      setState(prev => ({ ...prev, ideas: payload.ideas }))
      setIsGeneratingIdeas(false)
      addFeedEvent(`Generated ${payload.ideas.length} ideas`, "ai/design/ideas/generated")
    }
  }

  const handleImageGenerated = (payload: ImageGeneratedPayload) => {
    if (payload.requestId === state.requestId) {
      setState(prev => ({
        ...prev,
        assetUrl: payload.assetUrl,
        mockupUrl: payload.mockupUrl
      }))
      setIsRenderingImage(false)
      addFeedEvent("Image rendered successfully", "ai/image/generated")
    }
  }

  const handleProductCreated = (payload: ShopifyProductCreatedPayload) => {
    if (payload.requestId === state.requestId) {
      setState(prev => ({
        ...prev,
        productUrl: payload.productUrl,
        checkoutUrl: payload.checkoutUrl
      }))
      addFeedEvent("Product created on Shopify", "shopify/product/created")
    }
  }

  const handleError = (payload: ErrorPayload) => {
    if (payload.requestId === state.requestId) {
      addFeedEvent(`Error: ${payload.message}`, "error")
      setIsGeneratingIdeas(false)
      setIsRenderingImage(false)
    }
  }

  const handleGenerateIdeas = async () => {
    if (!state.brand || !state.vibe || !state.items?.length) {
      addFeedEvent("Please fill in all required fields", "error")
      return
    }

    setIsGeneratingIdeas(true)
    addFeedEvent("Requesting AI-generated ideas...", "ai/design/requested")

    try {
      const payload: DesignRequestPayload = {
        requestId: state.requestId,
        brand: state.brand,
        vibe: state.vibe,
        items: state.items
      }

      await publish("ai/design/requested", payload)
    } catch (error) {
      console.error("Failed to publish design request:", error)
      addFeedEvent("Failed to send design request", "error")
      setIsGeneratingIdeas(false)
    }
  }

  const handleSelectIdea = (idea: Idea) => {
    setState(prev => ({ ...prev, selectedIdea: idea }))
    addFeedEvent(`Selected idea: ${idea.slogan}`, "user")
  }

  const handleRenderImage = async () => {
    if (!state.selectedIdea) {
      addFeedEvent("Please select an idea first", "error")
      return
    }

    setIsRenderingImage(true)
    addFeedEvent("Requesting image render...", "ai/image/requested")

    try {
      const payload: ImageRequestPayload = {
        requestId: state.requestId,
        idea: state.selectedIdea,
        item: state.items?.[0] || "tshirt",
        output: {
          type: "png",
          transparent: true
        }
      }

      await publish("ai/image/requested", payload)
    } catch (error) {
      console.error("Failed to publish image request:", error)
      addFeedEvent("Failed to send image request", "error")
      setIsRenderingImage(false)
    }
  }

  const handleListOnStore = async () => {
    if (!state.assetUrl) {
      addFeedEvent("No image available to list", "error")
      return
    }

    addFeedEvent("Creating Shopify product...", "shopify/product/requested")
    
    // The backend will handle the Shopify product creation
    // We just need to wait for the shopify/product/created event
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Brand & Vibe Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Brand & Vibe
                </CardTitle>
                <CardDescription>
                  Define your brand identity and aesthetic direction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand Name</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., AcmeAI, DevRebel, CodeCult"
                    value={state.brand || ""}
                    onChange={(e) => setState(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Vibe</Label>
                  <div className="flex flex-wrap gap-2">
                    {VIBE_OPTIONS.map((vibe) => (
                      <Button
                        key={vibe}
                        variant={state.vibe === vibe ? "default" : "outline"}
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, vibe }))}
                      >
                        {vibe}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Items</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ITEM_OPTIONS.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={state.items?.includes(item) || false}
                          onCheckedChange={(checked) => {
                            setState(prev => ({
                              ...prev,
                              items: checked
                                ? [...(prev.items || []), item]
                                : prev.items?.filter(i => i !== item) || []
                            }))
                          }}
                        />
                        <Label htmlFor={item} className="capitalize">{item}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas || !state.brand || !state.vibe || !state.items?.length}
                  className="w-full"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    "Generate Ideas"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Ideas Grid */}
            {state.ideas && state.ideas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Ideas</CardTitle>
                  <CardDescription>
                    Choose the idea that best represents your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {state.ideas.map((idea, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all ${
                          state.selectedIdea?.slug === idea.slug
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleSelectIdea(idea)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-xs">
                              {idea.slug}
                            </Badge>
                            <h3 className="font-semibold text-lg">{idea.slogan}</h3>
                            <p className="text-sm text-muted-foreground">{idea.style}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Render Preview */}
            {state.selectedIdea && (
              <Card>
                <CardHeader>
                  <CardTitle>Render Preview</CardTitle>
                  <CardDescription>
                    Generate a visual preview of your selected idea
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-semibold">{state.selectedIdea.slogan}</h3>
                    <p className="text-sm text-muted-foreground">{state.selectedIdea.style}</p>
                  </div>

                  {state.mockupUrl ? (
                    <div className="space-y-4">
                      <img
                        src={state.mockupUrl}
                        alt="Product mockup"
                        className="w-full max-w-md mx-auto rounded-lg border"
                      />
                      <Button
                        onClick={handleListOnStore}
                        className="w-full"
                        disabled={!state.assetUrl}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        List on Store
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRenderImage}
                      disabled={isRenderingImage}
                      className="w-full"
                    >
                      {isRenderingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rendering Image...
                        </>
                      ) : (
                        "Render Preview"
                      )}
                    </Button>
                  )}

                  {state.productUrl && (
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <a href={state.productUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Product
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <a href={state.checkoutUrl} target="_blank" rel="noopener noreferrer">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Buy Now
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>
                  Real-time updates from the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {state.feed.map((event, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        event.topic === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : event.topic === 'system'
                          ? 'bg-blue-50 border border-blue-200 text-blue-800'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{event.topic}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.ts).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs">
                        {typeof event.payload === 'object' && event.payload !== null
                          ? (event.payload as any).message || JSON.stringify(event.payload)
                          : String(event.payload)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
