"use client";

import { lastTrace } from "@/lib/api";

export default function JsonDebug() {
  return (
    <details style={{marginTop: "20px"}}>
      <summary>Last API Trace</summary>
      <pre>{JSON.stringify(lastTrace, null, 2)}</pre>
    </details>
  );
}
