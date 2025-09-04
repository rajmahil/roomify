import { supabase } from "@/supabase";
import { createClient } from "../server";

export const signInAnon = async (): Promise<User | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.signInAnonymously();

  return user;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const anonUser = await signInAnon();

    return anonUser;
  }

  return user;
};
