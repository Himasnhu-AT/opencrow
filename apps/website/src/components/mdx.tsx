import { useMDXComponent } from "next-contentlayer2/hooks";
import Image from "next/image";

const components = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={`mt-2 scroll-m-20 text-4xl font-bold tracking-tight mb-4 ${className}`}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={`mt-10 scroll-m-20 border-b border-gray-200 dark:border-white/10 pb-1 text-2xl font-semibold tracking-tight first:mt-0 ${className}`}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={`mt-8 scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={`leading-7 [&:not(:first-child)]:mt-6 text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={`my-6 ml-6 list-decimal [&>li]:mt-2 ${className}`}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      className={`mt-2 text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={`mt-6 border-l-2 border-gray-300 dark:border-gray-700 pl-6 italic text-gray-800 dark:text-gray-200 ${className}`}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={`relative rounded bg-gray-100 dark:bg-white/10 px-[0.3rem] py-[0.2rem] font-mono text-sm dark:text-gray-200 ${className}`}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={`mb-4 mt-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black p-4 ${className}`}
      {...props}
    />
  ),
};

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code);

  return (
    <div className="mdx">
      <Component components={components} />
    </div>
  );
}
