import { SolclientFactory, SolclientFactoryProperties, Session, Message, Destination, SessionEventCode } from 'solclientjs';
import { v4 as uuidv4 } from 'uuid';

// Types for our event system
export type Idea = {
  slug: string;
  slogan: string;
  style: string;
};

export type FeedEvent = {
  ts: number;
  topic: string;
  payload: unknown;
};

export type DropState = {
  requestId: string;
  brand?: string;
  vibe?: string;
  items?: string[];
  ideas?: Idea[];
  selectedIdea?: Idea | null;
  assetUrl?: string;
  mockupUrl?: string;
  productUrl?: string;
  checkoutUrl?: string;
  feed: FeedEvent[];
  mode: "scratch" | "template";
  template?: {
    templateBrand?: string;
    handles?: string[];
    summary?: string;
    strategyBrief?: Record<string, unknown>;
    referenceAssets?: { type: string; url: string }[];
    adaptationNotes?: string;
  };
};

// Event payload types
export type DesignRequestPayload = {
  requestId: string;
  brand: string;
  vibe: string;
  items: string[];
};

export type IdeasGeneratedPayload = {
  requestId: string;
  ideas: Idea[];
};

export type ImageRequestPayload = {
  requestId: string;
  idea: Idea;
  item: string;
  output: {
    type: string;
    transparent: boolean;
  };
};

export type ImageGeneratedPayload = {
  requestId: string;
  assetUrl: string;
  mockupUrl: string;
};

export type ShopifyProductCreatedPayload = {
  requestId: string;
  productId: string;
  productUrl: string;
  checkoutUrl: string;
};

export type TemplateSeedRequestPayload = {
  requestId: string;
  templateBrand: string;
  handles: string[];
  items: string[];
};

export type TemplateSeedGeneratedPayload = {
  requestId: string;
  summary: string;
  referenceAssets: { type: string; url: string }[];
  strategyBrief: {
    positioning: string;
    palette: string[];
  };
};

export type DesignFromTemplateRequestPayload = {
  requestId: string;
  templateBrand: string;
  strategyBrief: Record<string, unknown>;
  adaptationNotes: string;
  items: string[];
};

export type ErrorPayload = {
  requestId: string;
  message: string;
  detail?: string;
};

class SolaceClient {
  private session: Session | null = null;
  private isConnected = false;
  private subscribers: Map<string, ((message: any) => void)[]> = new Map();

  constructor() {
    // Initialize Solace client factory
    const factoryProps = new SolclientFactoryProperties();
    factoryProps.profile = SolclientFactoryProperties.PROFILE_DEFAULT;
    SolclientFactory.init(factoryProps);
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      try {
        this.session = SolclientFactory.createSession({
          url: process.env.NEXT_PUBLIC_SOLACE_HOST || 'ws://localhost:8080',
          vpnName: process.env.NEXT_PUBLIC_SOLACE_VPN || 'default',
          userName: process.env.NEXT_PUBLIC_SOLACE_USERNAME || 'default',
          password: process.env.NEXT_PUBLIC_SOLACE_PASSWORD || 'default',
        });

        this.session.on(SessionEventCode.UP_NOTICE, () => {
          console.log('Connected to Solace');
          this.isConnected = true;
          resolve();
        });

        this.session.on(SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
          console.error('Connection failed:', sessionEvent);
          reject(new Error('Failed to connect to Solace'));
        });

        this.session.on(SessionEventCode.DISCONNECTED, () => {
          console.log('Disconnected from Solace');
          this.isConnected = false;
        });

        this.session.connect();
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.session && this.isConnected) {
      this.session.disconnect();
      this.isConnected = false;
    }
  }

  async publish(topic: string, payload: object): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Solace');
    }

    const message = SolclientFactory.createMessage();
    message.setDestination(SolclientFactory.createTopicDestination(topic));
    message.setBinaryAttachment(JSON.stringify(payload));
    message.setDeliveryMode(Message.DeliveryModeType.DIRECT);

    this.session.send(message);
  }

  async subscribe(topicFilter: string, callback: (message: any) => void): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Solace');
    }

    // Store callback for this topic
    if (!this.subscribers.has(topicFilter)) {
      this.subscribers.set(topicFilter, []);
    }
    this.subscribers.get(topicFilter)!.push(callback);

    // Create subscription
    const topic = SolclientFactory.createTopic(topicFilter);
    this.session.subscribe(topic, true);

    // Set up message handler
    this.session.on(SessionEventCode.MESSAGE, (sessionEvent) => {
      const message = sessionEvent.getMessage();
      const topicName = message.getDestination().getName();
      
      // Check if this message matches our topic filter
      if (this.matchesTopicFilter(topicName, topicFilter)) {
        const payload = JSON.parse(message.getBinaryAttachment() || '{}');
        const callbacks = this.subscribers.get(topicFilter) || [];
        callbacks.forEach(cb => cb(payload));
      }
    });
  }

  private matchesTopicFilter(topicName: string, topicFilter: string): boolean {
    // Simple wildcard matching - in production you'd want more sophisticated matching
    if (topicFilter.includes('*')) {
      const pattern = topicFilter.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(topicName);
    }
    return topicName === topicFilter;
  }

  generateRequestId(): string {
    return `req_${uuidv4()}`;
  }
}

// Singleton instance
const solaceClient = new SolaceClient();

// Export convenience functions
export const publish = async (topic: string, payload: object): Promise<void> => {
  await solaceClient.publish(topic, payload);
};

export const subscribe = async (topicFilter: string, callback: (message: any) => void): Promise<void> => {
  await solaceClient.subscribe(topicFilter, callback);
};

export const connect = async (): Promise<void> => {
  await solaceClient.connect();
};

export const disconnect = async (): Promise<void> => {
  await solaceClient.disconnect();
};

export const generateRequestId = (): string => {
  return solaceClient.generateRequestId();
};

// Export the client instance for advanced usage
export { solaceClient };
