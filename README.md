# DesignForge

> **Production-Grade Design Platform & Autonomous AI Agent Studio**  
> *Matching Canva's capabilities with a first-class Model Context Protocol (MCP) agent control layer.*

---

## ⚡ 5-Minute Quickstart

### 1. Install & Build
```bash
git clone https://github.com/your-org/designforge.git
cd designforge

# Install monorepo dependencies
npm install

# Build all core engines & packages
npm run build:packages

# Run the master automated verification suite
npm test
```

### 2. Launch the Application & MCP Server
```bash
# Start Next.js Studio (Port 3000)
npm run dev --workspace=designforge-web

# In a separate terminal, start the MCP SSE Server (Port 4000)
npm run dev:mcp
```
Open **http://localhost:3000** in your browser.

### 3. Run the Autonomous AI Demo
```bash
npm run demo:instagram
```

---

## 🏗️ Architecture & Monorepo Layout

```
designforge/
├── packages/
│   ├── core/              # Scene Graph, Command Pattern, Geometry, Snapping,
│   │                      # SVG/JSON Exporter, Templates, Brand Kits, Magic Resize
│   ├── ai-adapter/        # Provider-Agnostic LLM Adapter (OpenAI, Anthropic,
│   │                      # Gemini, Ollama, OpenRouter, Custom endpoints)
│   ├── mcp-server/        # Standalone MCP Server (@modelcontextprotocol/sdk)
│   │                      # exposing 40+ tools, SSE + Stdio transports
│   └── browser-agent/     # Visual Verification Engine, Self-Healing Loop,
│                          # Autonomous Multi-Step Execution Runner
├── apps/
│   └── web/               # Next.js 14 App Router, Tailwind CSS, Lucide Icons,
│                          # Interactive Canvas Studio, Live Agent View, Modals
├── scripts/
│   ├── demo-instagram-post.js # End-to-end AI agent generation script
│   └── run-e2e-suite.js       # Master automated verification test runner
├── claude_desktop_config.json # Claude Desktop configuration snippet
├── cursor_config.json         # Cursor MCP configuration snippet
├── chatgpt_connector_config.json # ChatGPT connector configuration snippet
├── openapi.json               # OpenAPI 3.1.0 specification
├── docker-compose.yml         # Containerized dev & production setup
└── Dockerfile                 # Production Docker image
```

---

## ✨ Core Platform Capabilities

1. **High-Performance Canvas Engine**:
   - 60fps infinite/paged canvas with zoom, pan, rulers, smart alignment guides, and snap calculations.
   - Text elements with Google Fonts (Inter, Poppins, Montserrat, Playfair Display, Cinzel, Noto Sans Devanagari Hindi, Space Grotesk, Fira Code), drop shadows, neon glow, glitch effects, line-height, letter-spacing, and vertical alignment.
   - Geometric shapes (rectangles, circles, ellipses, triangles, stars, polygons) with linear/radial gradients, strokes, and corner radii.
   - Dynamic charts (bar, column, line, pie), editable tables, QR code generators, and stock image assets.

2. **Reversible Command Layer & History**:
   - Every action executes through a reversible command (`AddElementCommand`, `UpdateElementCommand`, `MoveResizeElementCommand`, `ReorderElementCommand`, `BatchCommand`, `ApplyBrandKitCommand`, `ResizeDesignCommand`).
   - Unlimited undo/redo, action diff tracking, and 1-click **"Revert Entire AI Session"**.

3. **Standalone Model Context Protocol (MCP) Server**:
   - 40+ granular tools with strict Zod schemas for AI agents (`create_design`, `add_text`, `add_shape`, `add_chart`, `add_table`, `add_qrcode`, `update_element`, `move_resize_rotate`, `apply_operations`, `magic_resize`, `apply_brand_kit`, `get_screenshot`, `export_design`).
   - Ready-made MCP Prompts (`create_viral_youtube_thumbnail`, `create_instagram_carousel`, `create_pitch_deck`, `hindi_festive_banner`).
   - MCP Resources (`design://{id}`, `brand://{id}`).

4. **Live "Agent View" & Visual Verification Loop**:
   - Real-time stream of tool calls, latencies, and execution diffs.
   - Automated visual health score (0-100%) checking contrast ratios, canvas overflow, and alignment with self-healing auto-repair.

5. **Magic Resize & Multi-Format Engine**:
   - 1-click instant conversion across 20+ aspect ratios: Instagram Post (1080x1080), Instagram Story (1080x1920), YouTube Thumbnail (1280x720), Twitter Header (1500x500), A4 Document (794x1123), Presentation (1920x1080).

6. **Presentation Mode**:
   - Fullscreen slideshow view with slide transitions, presenter speaker notes, and live timer.

7. **Bulk Create / CSV Data-Merge**:
   - Dynamic placeholder replacement (`{{title}}`, `{{author}}`, `{{discount}}`) from CSV datasets to generate 100+ pages instantly.

8. **Localization (i18n)**:
   - Built-in multi-language switcher supporting **English**, **हिंदी (Hindi / Devanagari)**, **Español (Spanish)**, and **Français (French)**.

---

## 🤖 MCP Configuration Snippets

### Claude Desktop Integration
Add the following to your `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "designforge": {
      "command": "node",
      "args": [
        "/path/to/designforge/packages/mcp-server/dist/cli.js"
      ]
    }
  }
}
```

### Cursor Integration
In Cursor Settings > Features > MCP Servers:
- **Name**: `designforge`
- **Type**: `sse`
- **URL**: `http://localhost:4000/sse`

---

## 🧪 Running Automated Tests

```bash
# Run all unit, integration, and E2E tests across monorepo
npm test

# Run individual test suites
npm run test:core
npm run test:ai
npm run test:mcp
npm run test:agent
npm run test:e2e
```

---

## 📄 License
MIT © 2026 DesignForge Team.
