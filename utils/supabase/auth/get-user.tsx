import { supabase } from "@/supabase";
import { createClient } from "../server";
import { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const signInAnon = async (): Promise<User | null> => {
  const supabase = await createClient();

  const { data } = await supabase.auth.signInAnonymously();

  return data?.user;
};

export const getCurrSession = async (): Promise<Session | null> => {
  const { data: anonData, error: anonError } = await supabase.auth.getSession();

  return anonData?.session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};
