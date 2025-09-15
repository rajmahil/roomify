import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import { randomInt8 } from "@/lib/randomInt8";
import { DateTime } from "luxon";

const dt = DateTime.local(2025, 9, 21, 0, 25);
const formatted = dt.toFormat("MMM d, yyyy h:mma").toLowerCase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { images, name, id } = body;

    const { data, error } = await supabase
      .from("projects")
      .upsert({
        id: id || Number(randomInt8()),
        ...((!id || name) && { name: name || `Project - ${formatted}` }),
        ...(images && { images }),
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
