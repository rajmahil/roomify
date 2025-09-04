import UploadDashboard from "@/components/dashboard";
import React from "react";
import { getCurrentUser } from "../../../utils/supabase/auth/get-user";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <UploadDashboard />;
}
