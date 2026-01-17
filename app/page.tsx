import { createClient } from "@/utils/supabase/server";
import PostCard from "@/component/PostCard";
import ThreeBackground from "@/component/ThreeBackground";

export const revalidate = 60; // 每60秒重新验证

export default async function Home() {
  const supabase = await createClient();

  // 获取已发布的文章
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:user_profiles!fk_user_profiles_posts (
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("published", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="min-h-screen relative">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 主内容区 */}
        <div className="flex-1">
          {error ? (
            <div className="text-center py-12 bg-red-500/10 rounded-lg">
              <p className="text-red-500">加载文章失败</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts && posts.length > 0 ? (
                (posts as any[]).map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-lg backdrop-blur-sm">
                  <p className="text-gray-400">暂无文章</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <aside className="lg:w-80">
          <div className="bg-black/30 backdrop-blur-sm border-white/10 border rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">关于</h2>
            <p className="text-gray-300">
              这是一个使用 Next.js 和 Supabase 构建的现代博客系统。
            </p>
          </div>
        </aside>
      </div>
      <ThreeBackground />
    </div>
  );
}
