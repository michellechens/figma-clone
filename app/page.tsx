"use client"

import dynamic from "next/dynamic";

/**
 * Disable ssr to avoid pre-rendering issues of Next.js
 * We're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */
const NoSSR = dynamic(() => import("./App"), { ssr: false });

export default function Page() {
  return (
    <div>
      <NoSSR />
    </div>
  );
}