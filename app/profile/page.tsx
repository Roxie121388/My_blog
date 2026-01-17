"use client";
import { useEffect, useState } from "react";
import { useProfile, useUser, useIsAuthenticated } from "@/store/userStore";
import { useRouter } from "next/navigation";
import QiniuUploader from "@/component/QiniuUploader";
import { createClient } from "@/utils/supabase/client";
const ProfilePage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const profile = useProfile();
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (!isAuthenticated && user === null) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  const displayName = profile?.display_name || profile?.username || "用户";
  const vipLevel = profile?.vip_level || 0;
  const userAvatar = profile?.avatar_url;

  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  });
  const tabs = [
    { id: "favorites", label: "题目收藏" },
    { id: "answers", label: "回答收藏" },
    { id: "records", label: "刷题记录" },
    { id: "my-answers", label: "我的回答" },
    { id: "created", label: "创建题目" },
  ];

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleOpenEditDialog = () => {
    // 填充当前的 profile 数据到表单
    setFormData({
      username: profile?.username || "",
      display_name: profile?.display_name || "",
      bio: profile?.bio || "",
      avatar_url: profile?.avatar_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = async (e: any) => {
    e.preventDefault();
    if (!user?.id) {
      console.error("用户 ID 不存在");
      return;
    }
    setIsSubmitting(true);
    await supabase
      .from("user_profiles")
      .update({
        username: formData.username,
        display_name: formData.display_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      })
      .eq("id", user.id);
    setIsSubmitting(false);
    // 刷新 profile 数据
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧个人信息卡片 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 个人信息卡 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">个人信息</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenEditDialog}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="编辑资料"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="设置"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 头像 */}
              <div className="flex flex-col items-center mb-6">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-blue-500 flex items-center justify-center border-4 border-gray-100 mb-4">
                    <span className="text-white text-3xl">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {displayName}
                </h3>

                {/* VIP 等级 */}
                <div
                  className={`px-4 py-1 rounded-full text-sm font-bold ${
                    vipLevel > 0
                      ? "bg-linear-to-r from-blue-400 to-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {vipLevel > 0 ? `VIP ${vipLevel}` : "LV 0"}
                </div>
              </div>

              {/* 社交链接 */}
              <div className="flex justify-center gap-3 mb-6">
                <a
                  href={`https://github.com/${profile?.username || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  title="GitHub"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <button
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                  title="网站"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </button>
              </div>

              {/* 个人简介 */}
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-500">
                  {profile?.bio || "暂无个人简介"}
                </p>
              </div>

              {/* 用户 ID */}
              <div className="text-center text-xs text-gray-400 mb-6 flex items-center justify-center gap-2">
                <span>ID: {user?.id?.substring(0, 18)}...</span>
                <button
                  onClick={handleCopyId}
                  className="text-blue-500 hover:text-blue-600"
                  title={copiedId ? "已复制!" : "复制ID"}
                >
                  {copiedId ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* VIP 开通卡片 */}
            {vipLevel === 0 && (
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold mb-2">未开通永久会员</h3>
                  <p className="text-sm text-gray-300">畅刷 9000+ 高频面试题</p>
                </div>
                <button className="w-full bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  立即开通
                </button>
              </div>
            )}
          </div>

          {/* 右侧主内容区 */}
          <div className="lg:col-span-9 space-y-6">
            {/* 会员等级卡片 */}
            <div className="bg-linear-to-r from-blue-400 to-blue-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <svg viewBox="0 0 100 100" fill="white">
                  <polygon points="50,10 61,35 90,35 67,53 77,78 50,60 23,78 33,53 10,35 39,35" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs opacity-80 mb-1">当前等级</div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold">
                        {vipLevel > 0 ? `VIP ${vipLevel}` : "LV 0"}
                      </span>
                      <span className="text-sm opacity-80">排名 -</span>
                      <span className="text-sm opacity-80">
                        经验 {vipLevel * 100}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                      经验值明细
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 text-xs">
                  <span className="opacity-80">还需 0 经验升级</span>
                  <span className="opacity-80">
                    还需 {100 - ((vipLevel * 100) % 100)} 经验升级
                  </span>
                  <span className="opacity-80">可申请进入专属群</span>
                </div>
              </div>
            </div>

            {/* 活跃度日历 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    2025 年共发布题解 <span className="text-blue-600">0</span>{" "}
                    次，累计天数：<span className="text-blue-600">0</span> 天
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>不活跃</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-blue-400 rounded-sm"
                        style={{ opacity: i * 0.25 }}
                      />
                    ))}
                  </div>
                  <span>活跃</span>
                </div>
              </div>

              {/* 简化的日历热力图 */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  "1月",
                  "2月",
                  "3月",
                  "4月",
                  "5月",
                  "6月",
                  "7月",
                  "8月",
                  "9月",
                  "10月",
                  "11月",
                  "12月",
                ].map((month) => (
                  <div key={month} className="shrink-0">
                    <div className="text-xs text-gray-400 mb-2">{month}</div>
                    <div className="grid grid-rows-7 gap-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-gray-100 rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab 切换和内容区域 */}
            <div className="bg-white rounded-2xl shadow-sm">
              {/* Tab 导航 */}
              <div className="border-b border-gray-200">
                <nav className="flex gap-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 筛选区域 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex gap-4 items-center flex-wrap">
                  <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>搜索题目</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>标记</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option>会员专属</option>
                  </select>
                  <input
                    type="text"
                    placeholder="可选 10 个标签，支持搜索"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-20">📝</div>
                <p className="text-gray-400 text-sm">
                  暂无收藏列表，快去收藏吧~
                </p>
              </div>

              {/* 分页 */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">总共 0 条</div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    &lt;
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">1</span>
                  <button
                    className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    &gt;
                  </button>
                  <select className="ml-2 px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500">
                    <option>20 条/页</option>
                    <option>50 条/页</option>
                    <option>100 条/页</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑资料对话框 */}
      {isEditDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsEditDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog 头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">编辑个人资料</h2>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Dialog 内容 */}
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
              {/* 头像和基本信息布局 */}
              <div className="flex gap-6">
                {/* 左侧：头像上传 */}
                <div className="shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    头像
                  </label>
                  <QiniuUploader
                    maxSize={1}
                    accept="image/*"
                    onSuccess={(response) => {
                      setFormData({ ...formData, avatar_url: response.url });
                    }}
                    onError={(error) => {
                      alert(`上传失败: ${error.message}`);
                    }}
                  >
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all group">
                      {formData.avatar_url ? (
                        <>
                          <img
                            src={formData.avatar_url}
                            alt="头像"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-500 flex flex-col items-center justify-center text-white group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                          <svg
                            className="w-10 h-10 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="text-sm font-medium">上传头像</span>
                        </div>
                      )}
                    </div>
                  </QiniuUploader>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    点击上传
                    <br />
                    最大 1MB
                  </p>
                </div>

                {/* 右侧：用户名和显示名称 */}
                <div className="flex-1 space-y-4">
                  {/* 用户名 */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      用户名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入用户名"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">用于登录和显示</p>
                  </div>

                  {/* 显示名称 */}
                  <div>
                    <label
                      htmlFor="display_name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      显示名称
                    </label>
                    <input
                      type="text"
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入显示名称"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      在主页和评论中展示
                    </p>
                  </div>
                </div>
              </div>

              {/* 个人简介 */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  个人简介
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="介绍一下自己..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  简要介绍你的背景、兴趣或专业领域
                </p>
              </div>

              {/* 手动输入URL（备用选项，折叠状态） */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span>或手动输入头像链接</span>
                </summary>
                <div className="mt-3 pl-6">
                  <input
                    type="url"
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar_url: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </details>

              {/* 按钮组 */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
