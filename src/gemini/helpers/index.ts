export const generateImage = async (
  prompt: string,
  imageUrls: string[],
  original_image: string,
  spaceType: string,
  spaceObjects: string[],
  spaceStyle: string,
  member_id: string
) => {
  const structuredImage = await generateImageStructure(
    imageUrls,
    original_image
  );

  const finalImageUrls = [
    `${process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL}${member_id}/${structuredImage[0]}`,
    ...imageUrls,
  ];

  const finalPrompt = getPromptTemplate("furnishRoom")
    .replaceAll("[SPACE_TYPE]", spaceType)
    .replaceAll("[ITEMS_LIST]", spaceObjects.join(", "))
    .replaceAll("[ALLOW_PAINT]", "false")
    .replaceAll("[STYLE_NAME]", spaceStyle)
    .replaceAll("[USER_PROMPT]", prompt || "No additional preferences.")
    .replaceAll("[COLOR_PALETTE]", "neutral tones with blue accents")
    .replaceAll("[MATERIALS]", "wood, fabric, metal");

  const newProjectReq = await fetch("/api/image-to-image", {
    method: "POST",
    body: JSON.stringify({
      prompt: finalPrompt,
      imageUrls: finalImageUrls,
      original_image,
    }),
  });

  if (!newProjectReq.ok) {
    throw new Error("Failed to create project");
  }

  const data = await newProjectReq.json();

  return data;
};

export const generateImageStructure = async (
  imageUrls: string[],
  original_image: string
) => {
  const structure = getPromptTemplate(`structure`);

  const generateImageStructureReq = await fetch("/api/image-to-image", {
    method: "POST",
    body: JSON.stringify({
      prompt: structure,
      imageUrls,
      original_image,
    }),
  });

  if (!generateImageStructureReq.ok) {
    throw new Error("Failed to create structure image");
  }

  const structuredImage = (await generateImageStructureReq.json()) as string[];

  return structuredImage;
};

export const generateImageDefurnish = async (
  imageUrls: string[],
  original_image: string,
  member_id: string,
  removeAll: boolean
) => {
  const defurnishPrompt = getPromptTemplate("defurnish");

  const newProjectReq = await fetch("/api/image-to-image", {
    method: "POST",
    body: JSON.stringify({
      prompt: defurnishPrompt,
      imageUrls,
      original_image,
    }),
  });

  if (!newProjectReq.ok) {
    throw new Error("Failed to create project");
  }

  const data = await newProjectReq.json();

  return data;
};

export const generateImageRefine = async (
  prompt: string,
  original_image: string,
  imageUrls: string[]
) => {
  const refineTextPrompt = getPromptTemplate("refineText");
  const improveUserPromptReq = await fetch("/api/text-to-text", {
    method: "POST",
    body: JSON.stringify({
      prompt: refineTextPrompt.replaceAll("[USER_PROMPT]", prompt),
    }),
  });

  if (!improveUserPromptReq.ok) {
    throw new Error("Failed to improve user prompt");
  }
  const improvedPrompt = await improveUserPromptReq.text();

  console.log({ improvedPrompt }, "Improved Prompt");

  const refinePrompt = getPromptTemplate("refine");
  const refinePromptFinal = refinePrompt.replaceAll(
    "[USER_PROMPT]",
    improvedPrompt
  );

  const newProjectReq = await fetch("/api/image-to-image", {
    method: "POST",
    body: JSON.stringify({
      prompt: refinePromptFinal,
      imageUrls,
      original_image,
    }),
  });

  if (!newProjectReq.ok) {
    throw new Error("Failed to create project");
  }

  const data = await newProjectReq.json();

  return data;
};

export const getPromptTemplate = (type: string) => {
  const templates: Record<string, any> = {
    furnishRoom: `
You are editing user-owned photos. Two images are provided:
• Image[0] = constraints image with CHROMA-KEY overlays (guide only).
• Image[1] = clean base photo (no overlays) — render on this.

CHROMA-KEY definitions (from Image[0]):
• KEY-LINE: #FF00FF (magenta) lines outlining fixed architecture.
• KEY-MASK: #39FF14 (neon green) fills marking WINDOWS and DOORS as protected.

USER PROMPT (HIGHEST PRIORITY OVER PRESETS)
- Verbatim note: “[USER_PROMPT]”
- Treat this as the primary guidance for style, palette, materials, layout, and item placement.
- It supersedes defaults like [STYLE_NAME], [COLOR_PALETTE], [MATERIALS], and suggested layouts.

NON-OVERRIDABLE CONSTRAINTS (ALWAYS WIN)
- Protected regions from Image[0] (KEY-LINE #FF00FF, KEY-MASK #39FF14) and all architectural invariants.
- Inventory lock: add **only** items in [ITEMS_LIST]; no extras/substitutes unless quantity is explicitly given.
- Output/format requirements.

CONFLICT RESOLUTION
- If any part of [USER_PROMPT] conflicts with NON-OVERRIDABLE CONSTRAINTS, ignore only that conflicting part and follow the rest of [USER_PROMPT].

Non-negotiable rules:
• Treat KEY-LINE and KEY-MASK pixels in Image[0] as a **do-not-edit mask**.
• WINDOWS/DOORS are structural; do not remove, resize, relocate, or cover them.
• Do not change walls, trim, staircases, fireplaces, ceiling lines, beams, built-ins, cabinetry, appliances, plumbing, outlets, or switch plates.
• No changes to camera/lens/perspective; no new windows/doors/skylights; preserve exterior views through windows.

Task:
Stage a [SPACE_TYPE] in a [STYLE_NAME] style, placing furniture/decor **only in non-masked areas**.

Rendering requirements:
• **Render from Image[1]** (the clean base).  
• The final image must contain **zero visible KEY colors**. Remove all instances of:
  — #FF00FF and any pixels within a small tolerance (≈ ΔE ≤ 3 or HSV distance ≤ 0.03).
  — #39FF14 and the same tolerance.
• Where key colors existed in Image[0], reveal/preserve the underlying appearance from Image[1] (no blur, no repaint).
• Photorealism: correct scale, contact shadows, occlusion, reflections per scene lighting.

ALLOWED EDITS (STRICT INVENTORY MODE):
- Place and arrange **only** items listed in [ITEMS_LIST], guided by “[USER_PROMPT]”.
- Do **not** add any other objects, substitutes, or duplicates unless quantity is explicitly given
  (e.g., "2x nightstands", "pair of lamps"). Default quantity = 1.
- Do **not** auto-add styling props: no artwork, plants, books, throw pillows/blankets, trays,
  candles, vases, rugs, curtains, or lighting **unless explicitly listed**.
- If an item would violate any rule or cover a protected region, **omit that item** rather than
  changing the architecture or adding alternatives.
- Essential components integral to a listed item are allowed only when necessary for realism:
  e.g., a "bed" may include a mattress and plain neutral bedding; a "lamp" includes a shade/bulb.
  Do not add extra décor beyond those essentials.

Not allowed:
• Any modification to protected regions; any obstruction of windows/doors; geometry warps; relighting that hides protected details.

Furnishing brief:
• Style: [STYLE_NAME]
• Palette: [COLOR_PALETTE]
• Materials: [MATERIALS]
• Items to include (and only these): [ITEMS_LIST]
• If any item would violate a rule or cover a protected region, **omit the item**.

Window invariants:
• Preserve each window’s position, size, frame, sill, trim, and exterior view.
• Curtains may frame but not cover more than ~5% of glazing; no new blinds/shades unless already present.

Quality bars:
• No floating furniture; no warping; no duplicated windows; no AI smudging.

COLOR & TONE OPTIMIZATION (GLOBAL ONLY):
- Apply a subtle, camera-like grade to enhance realism for interior design photography.
- White balance: neutralize color casts to match scene lighting (daylight ~4800–6500K; keep warm tungsten if present but remove green/magenta casts).
- Exposure: correct midtones; avoid clipping. If needed, adjust ±0.5 EV; recover highlights near windows without hazing the view.
- Contrast: gentle S-curve; black point ~2–4%, whites ~96–98% (no crushed blacks or blown whites).
- Color: Vibrance +5 to +15; Saturation 0 to +5. Keep whites actually white; maintain realistic wood/stone/fabric tones.
- Sharpening: natural, no halos; NO heavy filters (no HDR, bloom, vignette, split-toning, “cinematic” looks).
- GLOBAL adjustments only. Do not apply local color edits inside protected regions (windows/doors) and do not alter their appearance.
- Do not introduce or retain any chroma-key colors; the final image must contain **zero** pixels of #FF00FF or #39FF14 (± small tolerance).


Output:
• Return **one PNG** rendered from Image[1] with furnishing edits applied and **no #FF00FF or #39FF14 pixels anywhere** in the result.
`,
    structure: `
This is an image edit. I own the photo and authorize editing.

Create CHROMA-KEY overlays (to be used as a mask later):
• Draw solid **KEY-LINE** strokes in **#FF00FF** (pure magenta), width 8–12 px,
  tracing: floor edges, wall corners, ceiling edges, window/door frames, trim.
• Fill all windows and doors with **KEY-MASK** color **#39FF14** (neon green), **100% opacity**.
• IMPORTANT: overlays must be **pure flat color**—no gradients, blur, feathering, or anti-aliasing.

Do not alter any other pixels (no relighting, recolor, or perspective change).

Output: a PNG of the original photo with these overlays applied.
`,

    defurnish: `

Task: Edit the provided real estate photograph. Use the image as the fixed base.  

Goal: Remove all furniture and décor (e.g., desk, chair, bookshelf, rug, lamp, accessories), leaving the room completely empty, while preserving realism.  

STRICT CONSTRAINTS — DO NOT CHANGE OR REMOVE:  
- Walls, windows, trim, curtains, ceiling, floor, baseboards, outlets, vents  
- Room dimensions, perspective, camera angle, or lighting conditions  
- Color balance of structural elements  

Editing Requirements:  
1. Remove all existing furniture and decorative objects.  
2. Reconstruct any flooring, wall, or background areas revealed after removal.  
3. Ensure surfaces look natural and consistent (no blurring, artifacts, or gaps).  
4. Maintain original lighting and shadows so the room appears realistic.  

Output Format:  
- Deliver a clean, unfurnished version of the room.  
- No added elements, no watermarks, no text overlays.  
- Return only the edited image.  

`,

    refine: `
You are editing a real estate photograph. Use the provided image as the fixed base.  

User Instruction: [USER_PROMPT]  

STRICT CONSTRAINTS — DO NOT CHANGE OR REMOVE:  
- Walls, windows, trim, ceiling, floor, baseboards, outlets, vents  
- Room dimensions, perspective, camera angle, or lighting conditions  
- Color balance of structural elements  

STYLE & CONSISTENCY REQUIREMENTS:  
1. Any additions or replacements must **match the existing room aesthetic** in material, color palette, texture, and design style.  
   - For furniture: ensure similar wood tone, finish, and construction style as existing pieces.  
   - For decor: ensure scale, perspective, and lighting integrate seamlessly.  
2. Additions should look like they were **always part of the room** (no visual mismatch or new design style).  
3. Preserve existing shadows, reflections, and natural lighting conditions.  

EDITING REQUIREMENTS:  
1. Follow the user’s instruction ([USER_PROMPT]) with highest priority.  
2. If a visual cue is provided (a red 6–8px line), apply the edit specifically to that region.  
3. Reconstruct any flooring, walls, or background revealed after edits so the image looks natural and consistent.  

OUTPUT FORMAT:  
- Deliver the edited room photo with the user’s requested change(s).  
- Do not add unrelated objects or modify other parts of the room.  
- No watermarks, no text, no overlays. Return only the edited image.
`,

    refineText: `

You are an AI assistant that rewrites user instructions into a precise, model-ready prompt for **localized image editing**.

STRICT CONSTRAINTS:
- The provided photo is the fixed base. Do not crop, resize, rotate, or alter the global perspective, camera angle, or room dimensions.
- **Edit only inside the user-painted region (EDIT_MASK).**
- Do not modify or restyle anything outside the mask (walls, windows, doors, trim, ceiling, floors, furniture, lighting, reflections, shadows).
- Preserve original lighting, colors, and materials everywhere outside the mask.
- If the user request cannot be achieved without breaking these rules, omit that part and refine what is possible.

REFINEMENT TASK:
- Expand the user input into a clear, descriptive, professional edit instruction for the masked region.
- Use concrete details (materials, finish, color, style, texture, lighting) **only for the masked item(s)**.
- Do not add new objects or styling outside the scope of the user’s request.

User input: [USER_PROMPT]

Improved localized image-editing prompt:
`,
  };

  return templates[type] || templates["FurnishRoom"];
};
