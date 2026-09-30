export function listMCPPrompts() {
  return [
    {
      name: 'create_viral_youtube_thumbnail',
      description: 'Creates a high-CTR YouTube thumbnail layout (1280x720) with high contrast typography and gradient backdrop.',
      arguments: [
        { name: 'topic', description: 'The video topic or title', required: true },
        { name: 'brandKitId', description: 'Brand kit ID to style with', required: false },
      ],
    },
    {
      name: 'create_instagram_carousel',
      description: 'Builds a multi-page Instagram educational carousel with cover, problem, breakdown, and CTA.',
      arguments: [
        { name: 'topic', description: 'Subject matter for carousel', required: true },
        { name: 'numPages', description: 'Number of carousel slides (3-7)', required: false },
      ],
    },
    {
      name: 'create_pitch_deck',
      description: 'Generates a multi-slide investor pitch deck with cover, problem, solution, traction chart, and team slides.',
      arguments: [
        { name: 'companyName', description: 'Startup name', required: true },
        { name: 'oneLiner', description: 'One-sentence pitch', required: true },
      ],
    },
    {
      name: 'hindi_festive_banner',
      description: 'Generates a vibrant Hindi/Devanagari festival promotional banner with discount codes and QR code.',
      arguments: [
        { name: 'festivalName', description: 'Festival or occasion name in Hindi', required: true },
        { name: 'discountPercent', description: 'Discount percentage (e.g. 50%)', required: true },
      ],
    },
  ];
}

export function getMCPPrompt(name: string, args: Record<string, string>) {
  if (name === 'create_viral_youtube_thumbnail') {
    return {
      description: 'Workflow to build a viral YouTube thumbnail',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please build a high-contrast YouTube thumbnail for the topic: "${args.topic}". 
1. Call 'create_design' with preset 'youtube_thumbnail' (1280x720).
2. Call 'add_shape' to add dark gradient backdrop.
3. Call 'add_text' with bold 80px+ typography with outline/shadow for high visibility.
4. Call 'add_shape' for attention-grabbing badge pill.
5. Export SVG screenshot using 'get_screenshot' to verify.`,
          },
        },
      ],
    };
  }

  if (name === 'create_instagram_carousel') {
    return {
      description: 'Workflow to build Instagram carousel',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please build an Instagram carousel on "${args.topic}".
1. Call 'create_design' with preset 'instagram_post' (1080x1080).
2. Add ${args.numPages || 3} pages using 'add_page'.
3. For each page, add slide numbers, header, body bullet points, and CTA at the end.`,
          },
        },
      ],
    };
  }

  return {
    description: `Workflow for ${name}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Execute workflow ${name} with arguments ${JSON.stringify(args)}`,
        },
      },
    ],
  };
}
