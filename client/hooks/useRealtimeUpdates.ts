import { useEffect, useRef } from "react";
import { queryClient, getApiUrl } from "@/lib/query-client";

type UpdateType = 
  | "news"
  | "videos"
  | "banners"
  | "partners"
  | "useful-phones"
  | "businesses"
  | "accommodations"
  | "static-pages"
  | "notifications";

const updateTypeToQueryKey: Record<UpdateType, string[]> = {
  "news": ["/api/news"],
  "videos": ["/api/videos"],
  "banners": ["/api/banners"],
  "partners": ["/api/partners"],
  "useful-phones": ["/api/useful-phones"],
  "businesses": ["/api/businesses"],
  "accommodations": ["/api/accommodations"],
  "static-pages": ["/api/static-pages"],
  "notifications": ["/api/notifications"],
};

export function useRealtimeUpdates() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      try {
        const baseUrl = getApiUrl();
        const streamUrl = new URL("/api/updates/stream", baseUrl).href;
        
        const eventSource = new EventSource(streamUrl);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const eventType = data.type as string;
            
            if (eventType === "connected") {
              return;
            }

            const queryKeys = updateTypeToQueryKey[eventType as UpdateType];
            if (queryKeys) {
              queryClient.invalidateQueries({ queryKey: queryKeys });
              
              if (eventType === "static-pages") {
                queryClient.invalidateQueries({ queryKey: ["/api/static-pages/home"] });
                queryClient.invalidateQueries({ queryKey: ["/api/static-pages/info"] });
              }
            }
          } catch (error) {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;
          
          if (isMounted) {
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
          }
        };
      } catch (error) {
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);
}
