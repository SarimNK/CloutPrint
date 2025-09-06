"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Target, Loader2, ExternalLink, ShoppingCart, Plus, X } from "lucide-react"
import Link from "next/link"
import { 
  publish, 
  subscribe, 
  connect, 
  disconnect, 
  generateRequestId,
  type DropState,
  type Idea,
  type TemplateSeedRequestPayload,
  type TemplateSeedGeneratedPayload,
  type DesignFromTemplateRequestPayload,
  type IdeasGeneratedPayload,
  type ImageRequestPayload,
  type ImageGeneratedPayload,
  type ShopifyProductCreatedPayload,
  type ErrorPayload
} from "@/lib/solace"

const TEMPLATE_BRANDS = [
  "Cluely",
  "Supreme",
  "Off-White",
  "Balenciaga",
  "Vetements"
]

const ITEM_OPTIONS = [
  "tshirt",
  "poster",
  "hoodie",
  "sticker"
]

export default function TemplatePage() {
  const [state, setState] = useState<DropState>({
    requestId: generateRequestId(),
    mode: "template",
    feed: [],
    template: {
      handles: [""]
    }
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isFetchingStrategy, setIsFetchingStrategy] = useState(false)
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
  const [isRenderingImage, setIsRenderingImage] = useState(false)

  useEffect(() => {
    // Connect to Solace on component mount
    const initConnection = async () => {
      try {
        await connect()
        setIsConnected(true)
        
        // Subscribe to relevant topics
        await subscribe("intel/template/seed/generated", handleTemplateSeedGenerated)
        await subscribe("ai/design/ideas/generated", handleIdeasGenerated)
        await subscribe("ai/image/generated", handleImageGenerated)
        await subscribe("shopify/product/created", handleProductCreated)
        await subscribe("intel/template/error", handleError)
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

  const handleTemplateSeedGenerated = (payload: TemplateSeedGeneratedPayload) => {
    if (payload.requestId === state.requestId) {
      setState(prev => ({
        ...prev,
        template: {
          ...prev.template,
          summary: payload.summary,
          referenceAssets: payload.referenceAssets,
          strategyBrief: payload.strategyBrief
        }
      }))
      setIsFetchingStrategy(false)
      addFeedEvent("Strategy analysis completed", "intel/template/seed/generated")
    }
  }

  const handleIdeasGenerated = (payload: IdeasGeneratedPayload) => {
    if (payload.requestId === state.requestId) {
      setState(prev => ({ ...prev, ideas: payload.ideas }))
      setIsGeneratingIdeas(false)
      addFeedEvent(`Generated ${payload.ideas.length} ideas from template`, "ai/design/ideas/generated")
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
      setIsFetchingStrategy(false)
      setIsGeneratingIdeas(false)
      setIsRenderingImage(false)
    }
  }

  const handleFetchStrategy = async () => {
    if (!state.template?.templateBrand || !state.template?.handles?.some(h => h.trim())) {
      addFeedEvent("Please provide template brand and at least one handle", "error")
      return
    }

    setIsFetchingStrategy(true)
    addFeedEvent("Analyzing template brand strategy...", "intel/template/seed/requested")

    try {
      const payload: TemplateSeedRequestPayload = {
        requestId: state.requestId,
        templateBrand: state.template.templateBrand,
        handles: state.template.handles.filter(h => h.trim()),
        items: state.items || []
      }

      await publish("intel/template/seed/requested", payload)
    } catch (error) {
      console.error("Failed to publish template seed request:", error)
      addFeedEvent("Failed to send template analysis request", "error")
      setIsFetchingStrategy(false)
    }
  }

  const handleGenerateIdeasFromTemplate = async () => {
    if (!state.template?.strategyBrief) {
      addFeedEvent("Please fetch strategy first", "error")
      return
    }

    setIsGeneratingIdeas(true)
    addFeedEvent("Generating ideas from template strategy...", "ai/design/from-template/requested")

    try {
      const payload: DesignFromTemplateRequestPayload = {
        requestId: state.requestId,
        templateBrand: state.template.templateBrand || "",
        strategyBrief: state.template.strategyBrief,
        adaptationNotes: state.template.adaptationNotes || "",
        items: state.items || []
      }

      await publish("ai/design/from-template/requested", payload)
    } catch (error) {
      console.error("Failed to publish design from template request:", error)
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
  }

  const addHandle = () => {
    setState(prev => ({
      ...prev,
      template: {
        ...prev.template,
        handles: [...(prev.template?.handles || []), ""]
      }
    }))
  }

  const removeHandle = (index: number) => {
    setState(prev => ({
      ...prev,
      template: {
        ...prev.template,
        handles: prev.template?.handles?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const updateHandle = (index: number, value: string) => {
    setState(prev => ({
      ...prev,
      template: {
        ...prev.template,
        handles: prev.template?.handles?.map((h, i) => i === index ? value : h) || []
      }
    }))
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
            {/* Template Source Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Template Source
                </CardTitle>
                <CardDescription>
                  Choose a brand to analyze and reverse-engineer their strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="templateBrand">Template Brand</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {TEMPLATE_BRANDS.map((brand) => (
                      <Button
                        key={brand}
                        variant={state.template?.templateBrand === brand ? "default" : "outline"}
                        size="sm"
                        onClick={() => setState(prev => ({
                          ...prev,
                          template: { ...prev.template, templateBrand: brand }
                        }))}
                      >
                        {brand}
                      </Button>
                    ))}
                  </div>
                  <Input
                    id="templateBrand"
                    placeholder="Or enter custom brand name"
                    value={state.template?.templateBrand || ""}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      template: { ...prev.template, templateBrand: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Social Media Handles</Label>
                  {state.template?.handles?.map((handle, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="https://twitter.com/username or https://instagram.com/username"
                        value={handle}
                        onChange={(e) => updateHandle(index, e.target.value)}
                      />
                      {state.template?.handles && state.template.handles.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeHandle(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addHandle}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Handle
                  </Button>
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
                  onClick={handleFetchStrategy}
                  disabled={isFetchingStrategy || !state.template?.templateBrand || !state.template?.handles?.some(h => h.trim())}
                  className="w-full"
                >
                  {isFetchingStrategy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Strategy...
                    </>
                  ) : (
                    "Fetch Strategy"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Insights Panel */}
            {state.template?.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Insights</CardTitle>
                  <CardDescription>
                    Analysis of {state.template.templateBrand}'s approach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Summary</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {state.template.summary}
                    </p>
                  </div>

                  {state.template.strategyBrief && (
                    <div>
                      <Label className="text-sm font-medium">Strategy Brief</Label>
                      <div className="mt-2 space-y-2">
                        {Object.entries(state.template.strategyBrief).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">{key}:</span>{" "}
                            <span className="text-muted-foreground">
                              {Array.isArray(value) ? value.join(", ") : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.template.referenceAssets && state.template.referenceAssets.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Reference Assets</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {state.template.referenceAssets.map((asset, index) => (
                          <div key={index} className="text-xs p-2 border rounded">
                            <div className="font-medium">{asset.type}</div>
                            <a 
                              href={asset.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate block"
                            >
                              {asset.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Adaptation Controls */}
            {state.template?.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Adaptation Controls</CardTitle>
                  <CardDescription>
                    Customize the strategy for your brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adaptationNotes">Adaptation Notes</Label>
                    <Textarea
                      id="adaptationNotes"
                      placeholder="e.g., Keep the contrast, but make slogans more playful and less aggressive"
                      value={state.template?.adaptationNotes || ""}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        template: { ...prev.template, adaptationNotes: e.target.value }
                      }))}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateIdeasFromTemplate}
                    disabled={isGeneratingIdeas}
                    className="w-full"
                  >
                    {isGeneratingIdeas ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      "Generate Ideas From Template"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ideas Grid */}
            {state.ideas && state.ideas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Ideas</CardTitle>
                  <CardDescription>
                    Choose the idea that best represents your adapted strategy
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
