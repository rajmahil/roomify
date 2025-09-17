export const generateImage = async (
  prompt: string,
  imageUrls: string[],
  original_image: string,
  spaceType: string,
  spaceObjects: string[]
) => {
  const finalPrompt = `
You are staging a real estate photograph. Use the provided image as the fixed base. This is a [SPACE_TYPE]; keep it a [SPACE_TYPE]. Do not reinterpret the room as any other type.

Goal: furnish and style a [SPACE_TYPE] in a [STYLE_NAME] style suitable for MLS.

STRICT CONSTRAINTS — DO NOT VIOLATE:
- Do not move, add, or remove: walls, windows, doors, trim, staircases, fireplaces, ceiling lines, beams, built-ins, cabinetry, appliances, plumbing fixtures, outlets, switch plates.
- Do not change room dimensions, camera position, lens, perspective, or viewpoint.
- Do not add new windows, doors, skylights, mirrors pretending to be windows, or exterior scenery.
- Keep existing flooring type and window views exactly as-is. Floor rugs are allowed on top, but the floor material must remain visible at edges.
- Maintain original lighting direction, intensity, and color temperature; update shadows/reflections accordingly.

ALLOWED EDITS:
- Place and arrange furniture and decor per list below.
- Adjust wall paint color ONLY IF ALLOW_PAINT = true; current value: [ALLOW_PAINT].- Remove small clutter (toys, boxes, personal items) if present.
- Minor brightness/contrast/white-balance tweaks for realistic output are allowed.

RENDERING REQUIREMENTS:
- Photorealistic result that matches original perspective and lens.
- Natural shadows, contact points, occlusion, and reflections consistent with light in the source photo.
- Keep doors/windows exactly where they are and at the same size.
- Maintain visible architectural details (baseboards, casings, vents, radiators).

FURNISHING BRIEF:
- Style: [STYLE_NAME] (e.g., Scandinavian / Modern Farmhouse / Mid-Century / Transitional).
- Palette: [COLOR_PALETTE] (e.g., warm neutrals with black accents).
- Materials: [MATERIALS] (e.g., oak, linen, matte black metal).
- Items to include (scale appropriately to room size; avoid blocking circulation):
  [ITEMS_LIST]  // e.g., "queen bed with upholstered headboard, 2 nightstands with lamps, 6-drawer dresser, 8x10 rug, framed art above bed, light curtains"
- Keep pathways clear from doorways and around primary furniture.

PLACEMENT & CLEARANCE RULES (MUST PASS ALL):
- Doors & paths: keep a continuous 36 in / 90 cm clear path from every door; never place furniture within door swing.
- Windows & HVAC: do not block windows, baseboard heaters, vents, thermostats, or outlets; curtains may frame but not cover glazing.
- Scale & contact: furniture must sit flat on the floor plane with accurate human scale (bed heights 20–28 in, sofa seat ~17–20 in); include contact shadows.
- Rug logic: rugs go under front legs of major seating (living) or centered under table (dining/bedroom), never tight to baseboards or covering thresholds.
- Circulation: keep 18–24 in / 45–60 cm between coffee table and sofa; 36 in / 90 cm walkway around dining table; 24–36 in / 60–90 cm bedside clearances.
- Adjacency: nightstands flank bed; media console aligns with existing outlet/cable wall; desk faces window or blank wall, not floating without purpose.
- Bathrooms (if the source photo is a bathroom): do not move or add plumbing fixtures; styling only (towels, mat, small plant, countertop tray).
- Kitchens: no new cabinets/appliances or relocations; stools only where an existing overhang/peninsula exists.
If any requested item violates these rules, OMIT the item instead of altering the architecture.

WINDOW INVARIANTS — MUST HOLD:
- Preserve every existing window’s position, size, frame, sill, and trim exactly; do not crop or cover glazing.
- Preserve the **exact exterior view** (trees/sky/railings) visible through the window; do not replace with tile, wall, or frosted glass.
- Keep balcony/guard rail geometry visible and unchanged where seen through the window.
- Curtains may frame the opening but must not overlap more than 5% of the glass area; blinds/roman shades are NOT allowed unless already present.
- If any furnishing would occlude a window or require changing its geometry, **omit the furnishing**.

QUALITY BARS:
- No floating furniture; proper scale and contact shadows.
- No geometry warping or duplicated windows.
- No text artifacts or AI smudging.

If any requested item would require moving architecture, OMIT the item instead of changing the room.

RENDER MODE: Using the approved placements, generate ONE photorealistic PNG image.
Keep architecture, perspective, and lighting identical. Do not output any text parts.
    `
    .replace("[SPACE_TYPE]", spaceType)
    .replace("[ITEMS_LIST]", spaceObjects.join(", "))
    .replace("[ALLOW_PAINT]", "false") // For now, always false
    .replace("[STYLE_NAME]", "Modern") // [STYLE_NAME] can be dynamic based on user preference
    .replace("[COLOR_PALETTE]", "neutral tones with blue accents") // [COLOR_PALETTE] can be dynamic
    .replace("[MATERIALS]", "wood, fabric, metal");

  // [STYLE_NAME]`, `[COLOR_PALETTE]`, `[MATERIALS]`,

  const newProjectReq = await fetch("/api/image-to-image", {
    method: "POST",
    body: JSON.stringify({
      prompt:
        "identify all windows in the provided image, outline the windows the a #FF0000 line stroke",
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
