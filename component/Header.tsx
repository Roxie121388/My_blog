import Link from "next/link";
import React from "react";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const linkClass = "text-blue-500 hover:text-blue-600 transition-colors";

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
            <UserAvatar />
            {/* {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : (
              <UserAvatar isHero={isHero} />
            )} */}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
