import { createClient } from "@/utils/supabase/server";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  let session:any
  if (code) {
    const supabase = await createClient();
    const {data: _session, error: sessionError} = await supabase.auth.exchangeCodeForSession(code);
    session = _session;
    if (sessionError) throw sessionError;


    // 检查用户是否存在于user_profiles表中
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", session?.user?.id)
      .single();

    if (!userProfile) {
      // 如果用户不存在，创建一个新的用户配置文件
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: session?.user?.id,
            username: session?.user?.email?.split("@")[0],
            // 其他默认值...
          },
        ]);
      if (insertError) throw insertError;
    }
  }

  const origin = new URL(request.url).origin;
  console.log(session);

  return NextResponse.redirect(`${origin}${next}?token=${session.session?.access_token}&refresh_token=${session.session?.refresh_token}`);
}