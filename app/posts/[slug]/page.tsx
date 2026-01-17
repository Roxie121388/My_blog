import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/formatDate";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/component/CodeBlock";
import MarkdownHeading from "@/component/MarkdownHeading";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const PostPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const supabase = await createClient();

  // 获取文章详情
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:user_profiles!fk_user_profiles_posts (
        username,
        display_name,
        avatar_url,
        bio
      )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .eq("is_public", true)
    .single();

  if (error || !post) {
    notFound();
  }
  //类型断言
  const postData = post as any;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 文章目录导航 */}
      {/* <ArticleToc content={postData.content} /> */}

      <article className="max-w-4xl mx-auto">
        {/* 文章头部 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{postData.title}</h1>

          <div className="flex items-center justify-between flex-wrap gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-3">
              {postData.author?.avatar_url && (
                <img
                  src={postData.author.avatar_url}
                  alt={postData.author.display_name || postData.author.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {postData.author?.display_name ||
                    postData.author?.username ||
                    "匿名"}
                </p>
                {postData.created_at && (
                  //time 标签是 HTML 中的时间标签，用于表示时间或日期。
                  <time dateTime={postData.created_at} className="text-sm">
                    {/* formatDate 格式为 2023-10-10 10:10:10 转换为 2023-10-10 */}
                    {formatDate(postData.created_at)}
                  </time>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 文章内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12 overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]} // 启用 GitHub Flavored Markdown 插件，adds support for footnotes, strikethrough, tables, tasklists and URLs directly
            components={{
              code: CodeBlock as any,
              h1: (props) => <MarkdownHeading level={1} {...props} />,
              h2: (props) => <MarkdownHeading level={2} {...props} />,
              h3: (props) => <MarkdownHeading level={3} {...props} />,
              h4: (props) => <MarkdownHeading level={4} {...props} />,
              h5: (props) => <MarkdownHeading level={5} {...props} />,
              h6: (props) => <MarkdownHeading level={6} {...props} />,
            }}
          >
            {postData.content}
          </ReactMarkdown>
        </div>

        {/* 作者信息 */}
        {postData.author?.bio && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-2">关于作者</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {postData.author.bio}
            </p>
          </div>
        )}
      </article>
    </div>
  );
};

export default PostPage;
