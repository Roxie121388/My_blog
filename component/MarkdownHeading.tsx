interface HeadingProps {
  level: number;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function MarkdownHeading({
  level,
  children,
  ...props
}: HeadingProps) {
  // 从子节点中提取文本
  //children是一个React节点数组，每个节点可以是字符串、React元素或其他节点数组
  //这里使用递归的方式提取所有字符串子节点，并将它们连接起来
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children
          .map((child) =>
            typeof child === "string"
              ? child
              : MarkdownHeading({ level, children: child })
          )
          .join("")
      : "";

  // 生成唯一的 id
  const id = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);

  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  return (
    <Tag id={id} className="scroll-mt-20" {...props}>
      {children}
    </Tag>
  );
}
