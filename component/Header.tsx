"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import UserAvatar from "./UserAvatar";
import { useIsLoading } from "@/store/userStore";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/userStore";

const Header = () => {
  const linkClass = "text-blue-500 hover:text-blue-600 transition-colors";
  const isLoading = useIsLoading();

  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    const supabase = createClient();
    if (token) {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: url.searchParams.get("refresh_token") || "",
      });
      // 从URL中删除token和refresh_token参数
      url.searchParams.delete("token");
      url.searchParams.delete("refresh_token");
      window.history.replaceState({}, document.title, url.toString());
    }
    initialize();

    // // 从Supabase获取用户信息
    // supabase.auth
    //   .getUser()
    //   .then((res) => {
    //     setUser(res.data.user);
    //     supabase
    //       .from("user_profiles")
    //       .select("*")
    //       .eq("id", res.data.user?.id)
    //       .single()
    //       .then((res) => {
    //         setProfile(res.data);
    //       });
    //     return res.data.user;
    //   })
    //   .catch((error) => {
    //     // TODO: 处理Token过期的情况
    //     console.error("获取用户信息失败:", error);
    //   });
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-black/0 backdrop-blur-md border-b border-white/10 text-blue-500`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-500">
            小破站
          </Link>

          {/* 桌面端菜单 */}
          <div className="hidden md:flex items-center gap-6">
            {/* <Link href="/" className={linkClass}>
              首页
            </Link> */}
            <Link href="/interview" className={linkClass}>
              面试题库
            </Link>
            <Link href="/faucet" className={linkClass}>
              领SepoliaETH
            </Link>

            {/* 用户信息或登录按钮 */}
            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : (
              <UserAvatar />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
