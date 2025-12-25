import type { Response } from "express";

export type UpdateType = 
  | "news"
  | "videos"
  | "banners"
  | "partners"
  | "useful-phones"
  | "businesses"
  | "accommodations"
  | "static-pages"
  | "notifications";

interface SSEClient {
  id: string;
  res: Response;
}

class UpdatesHub {
  private clients: Map<string, SSEClient> = new Map();

  addClient(clientId: string, res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: "connected", clientId })}\n\n`);

    this.clients.set(clientId, { id: clientId, res });

    res.on("close", () => {
      this.clients.delete(clientId);
    });
  }

  broadcast(updateType: UpdateType, data?: Record<string, unknown>): void {
    const message = JSON.stringify({
      type: updateType,
      timestamp: Date.now(),
      ...data,
    });

    this.clients.forEach((client) => {
      try {
        client.res.write(`data: ${message}\n\n`);
      } catch (error) {
        this.clients.delete(client.id);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const updatesHub = new UpdatesHub();
