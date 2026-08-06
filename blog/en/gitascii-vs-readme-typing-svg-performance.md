---
title: 'GitAscii vs readme-typing-svg: Analyzing Latency and Overhead in the GitHub Camo Proxy'
slug: 'gitascii-vs-readme-typing-svg-performance'
published: false
description: 'Traditional dynamic SVGs perform synchronous image generation on every request. Learn how offloading heavy canvas processing to the client and deploying to Vercel Edge Runtime prevents GitHub Camo proxy timeouts.'
tags: ['performance', 'nextjs', 'edge-computing', 'svg']
cover_image: 'assets/latency-comparison.jpg'
---

Classic profile customization badges, such as `readme-typing-svg`, popularized dynamic widgets in repository READMEs by serving remote, dynamically generated SVGs. However, the hidden cost of this synchronous generation pattern is degraded performance. Occasional server cold starts, latency spikes, and strict timeouts inside the GitHub Camo proxy often leave profiles with broken image placeholders.

In this post, we analyze the bottleneck of synchronous SVG generation, examine the mechanics of the GitHub Camo proxy, and look at how GitAscii achieves sub-80ms response times by shifting heavy layout computing to the browser's Canvas API.

![Latency comparison at the edge](assets/latency-comparison.jpg)

---

### Understanding the GitHub Camo Proxy

Before analyzing latency, we must understand how GitHub serves images in your repositories. When you load a repository page or a profile README, GitHub does not let your browser fetch images directly from third-party servers. This is done to protect user privacy (masking IP addresses and preventing tracking pixels) and prevent mixed-content warnings.

Instead, GitHub rewrites all image URLs to point to its own caching proxy, **Camo**:

```markdown
<!-- Original Markdown link -->

![My Badges](https://my-slow-server.com/badge.svg)

<!-- What GitHub renders in the DOM -->
<img src="https://camo.githubusercontent.com/a9c12b.../68747470733a2f2f6d792d736c6f772d7365727665722e636f6d2f62616467652e737667" alt="My Badges">
```

While Camo protects privacy, it introduces a strict execution constraint:

> [!IMPORTANT]
> GitHub Camo has a strict connection timeout (typically between **4 to 10 seconds**). If the target server hosting the dynamic SVG fails to respond within this window—due to cold starts on free hosting tiers (like Render, Fly.io, or Heroku), heavy database queries, or server load—Camo aborts the request and serves a broken image icon.

---

### The Bottleneck of Synchronous Server-Side SVG Rendering

Legacy profile badges perform intensive layout and rendering operations synchronously during the HTTP `GET` request:

```
[User Browser] ──> [GitHub Camo Proxy] ──(Sync HTTP Get)──> [Dynamic SVG Server]
                                                                  │
                                                        1. Parse URL Query String
                                                        2. Load Custom Web Fonts
                                                        3. Compute text widths & bounding boxes
                                                        4. Construct complex XML/SVG tree
                                                        5. Send large SVG payload
```

If your badge needs to render complex layout structures, measure multiple lines of text, or translate raster images into ASCII art, the CPU demand on the backend spikes. Under high traffic, this synchronous pipeline fails, causing timeouts.

---

### Shifting Processing: Client-Side Pre-processing in GitAscii

When designing **GitAscii**, we implemented an architecture that splits the processing load: **heavy computational tasks run in the developer's browser, while lightweight assembly runs on the Edge**.

Instead of uploading a raster image (like your avatar) and forcing our servers to parse and convert it into ASCII characters on every request, we perform the pixel processing inside the visual editor using the browser’s native `Canvas API`.

```javascript
/**
 * Client-Side ASCII Conversion Engine
 * Process pixels locally on the developer's GPU/CPU thread before saving.
 */
export function convertImageToAscii(
  imgElement: HTMLImageElement,
  width: number,
  height: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(imgElement, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);
  const asciiChars = ' .:-=+*#%@';
  let asciiArt = '';

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      // Calculate luminance using standard weights (ITU-R BT.601)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const charIndex = Math.floor((luminance / 255) * (asciiChars.length - 1));
      asciiArt += asciiChars[charIndex];
    }
    asciiArt += '\n';
  }

  return asciiArt;
}
```

> [!TIP]
> By processing the ASCII conversion client-side, we store only the lightweight text representation of the ASCII art in our database. The Edge server never has to read pixel buffers or execute image libraries like `sharp` or `canvas` during runtime rendering.

---

### Lightweight Edge Assembly

Because layout schemas are pre-computed, the Next.js Edge Runtime simply acts as a fast compiler. It pulls the configuration from the database, fetches basic numeric statistics from GitHub in parallel, and merges them into a raw XML string template.

```typescript
// GitAscii Edge Renderer route: /api/render/[username]
export const runtime = 'edge'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    // 1. Concurrent fetching
    const [profileConfig, liveStats] = await Promise.all([
      db.getProfileConfig(username),
      github.fetchLiveStats(username),
    ])

    // 2. Simple XML String Template Concatenation (extremely low CPU usage)
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <style>
          .ascii-art { font-family: monospace; font-size: 8px; fill: #58a6ff; }
          .stats-label { font-family: system-ui, sans-serif; fill: #ffffff; }
        </style>
        <text class="stats-label" x="20" y="40">Commits: ${liveStats.commitCount}</text>
        <text class="stats-label" x="20" y="70">PRs: ${liveStats.prCount}</text>
        <text class="ascii-art" x="300" y="40" xml:space="preserve">${profileConfig.asciiArt}</text>
      </svg>
    `

    const executionTime = Date.now() - startTime

    return new Response(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'X-Response-Time': `${executionTime}ms`,
        // Cache policies: Serve cache, update background async
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    return new Response('<svg><!-- Error rendering SVG --></svg>', {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}
```

---

### Comparison of Caching and Latency Patterns

```
┌─────────────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Performance Metric              │ Traditional Sync Server  │ GitAscii Edge Pipeline   │
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┤
│ average TTFB (Camo cache miss)  │ 800ms - 3500ms           │ 50ms - 120ms             │
│ Cold Start Overhead             │ Yes (up to 10s timeout)  │ No (Vercel Edge Global)  │
│ Database Operations             │ Heavy relational queries │ Simple KV/Cache reads    │
│ Client-side CPU Impact          │ None                     │ Minimal (one-time edit)  │
│ Response Type                   │ Raw dynamic compilation  │ Cacheable static XML     │
└─────────────────────────────────┴──────────────────────────┴──────────────────────────┘
```

### Caching Strategy: Stale-While-Revalidate

We configured GitAscii to leverage the `stale-while-revalidate` caching directive. When a user requests your profile README:

1. **First Visit**: GitHub Camo requests the SVG from GitAscii's Edge. The Edge compiles it in ~80ms. Camo caches the image and serves it to the browser.
2. **Subsequent Visits (within `s-maxage`)**: Camo instantly returns the cached image from its CDN edges.
3. **Stale Period (between `s-maxage` and `stale-while-revalidate`)**: Camo serves the cached (stale) version immediately to ensure zero latency, while asynchronously sending a background request to GitAscii's Edge to fetch updated stats and refresh the cache.

### Conclusion

By shifting CPU-intensive image-to-ASCII conversions to the client-side editor and serving static, edge-concatenated XML templates, GitAscii completely avoids the performance pitfalls of legacy systems. The result is a profile page that loads instantly, without timeouts or broken image links.
