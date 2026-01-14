"use client";
import { useUser, useIsAuthenticated } from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import TurndownService from "turndown";

// 动态引入 RichEditor 组件
const RichEditor = dynamic(() => import("@/component/Editor"), { ssr: false });

const CreatePostPage = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      setError("请先登录");
      router.push("/login");
    }
  }, [isAuthenticated]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleEditorChange = (html: string) => {
    setContent(html);
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish?: boolean) => {
    e.preventDefault();
    setError("");

    // 确定发布状态
    const willPublish = shouldPublish !== undefined ? shouldPublish : published;

    if (!title.trim()) {
      setError("请输入文章标题");
      return;
    }

    if (!slug.trim()) {
      setError("请输入文章别名");
      return;
    }

    if (!user) {
      setError("用户未登录");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // // 检查 slug 是否已存在
      // const { data: existingPost } = await supabase
      //   .from("posts")
      //   .select("id")
      //   .eq("slug", slug)
      //   .single();

      // if (existingPost) {
      //   setError("文章别名已存在，请使用其他别名");
      //   setIsSubmitting(false);
      //   return;
      // }

      var turndownService = new TurndownService();
      var markdown = turndownService.turndown(content);

      // 创建文章
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          content: markdown, // 存储 Markdown
          excerpt: excerpt.trim() || null,
          author_id: user.id,
          published: willPublish,
          is_public: isPublic,
        } as any)
        .select()
        .single();

      if (postError) throw postError;
      if (!postData) throw new Error("创建文章失败");

      const post = postData as any;

      // 跳转到文章详情页
      router.push(`/posts/${post.slug}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "发布失败，请重试");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">创建新文章</h1>
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← 返回
          </Link>
        </div>

        {/* 表单 */}
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          {/* 标题 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              文章标题 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="输入文章标题"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              文章别名 (URL) <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="article-slug"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              将作为文章的 URL 路径，例如：/posts/{slug || "article-slug"}
            </p>
          </div>

          {/* 摘要 */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              文章摘要
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="简短描述文章内容（可选）"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* 内容编辑器 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              文章内容 <span className="text-red-500">*</span>
            </label>
            <RichEditor
              value={content}
              onChange={handleEditorChange}
              placeholder="开始撰写你的文章..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              编辑器内容将自动转换为 Markdown 格式存储
            </p>
          </div>

          {/* 发布选项 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="published" className="text-sm font-medium">
                发布文章（取消勾选则保存为草稿）
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="is_public" className="text-sm font-medium">
                公开文章（所有人可见）
              </label>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any, true);
              }}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isSubmitting ? "发布中..." : "发布文章"}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any, false);
              }}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isSubmitting ? "保存中..." : "保存草稿"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
