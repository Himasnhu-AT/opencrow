import { notFound } from "next/navigation";
import { Mdx } from "@/components/mdx";
import { Metadata } from "next";
import { allDocs } from "contentlayer/generated";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocFromParams(params: { slug: string[] }) {
  const slug = params.slug?.join("/") || "";
  const doc = allDocs.find((doc) => doc.slug === slug);

  if (!doc) {
    return null;
  }

  return doc;
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams);

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
  };
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allDocs.map((doc) => ({
    slug: doc.slug.split("/"),
  }));
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams);

  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2 dark:text-zinc-100">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="text-xl text-zinc-600 dark:text-zinc-400 m-0">
            {doc.description}
          </p>
        )}
      </div>
      <Mdx code={doc.body.code} />
    </article>
  );
}
