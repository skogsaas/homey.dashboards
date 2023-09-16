import { dev, version } from "$app/environment";
import * as Sentry from "@sentry/svelte";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(), 
    new Sentry.Replay({
      maxReplayDuration: 60000,
      beforeAddRecordingEvent: (event) => {
        if (
          event.data.tag === "performanceSpan" && 
          (
            event.data.payload.op === "resource.fetch" || 
            event.data.payload.op === "resource.xhr" || 
            event.data.payload.op === "resource.img"
          ) &&
          event.data.payload.data?.statusCode < 400
        ) {
          return null;
        }
    
        return event;
      },
    }),
  ],

  release: version,
  environment: dev ? 'development' : 'production',

  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost"],
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
});