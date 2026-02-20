import { defineDocumentType, makeSource } from "contentlayer2/source-files";

export const Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `**/*.md`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the document",
      required: true,
    },
    description: {
      type: "string",
      description: "The description of the document",
      required: true,
    },
    category: {
      type: "enum",
      options: ["user", "developer"],
      description: "The category of the document",
      required: true,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/docs/${doc._raw.flattenedPath}`,
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath,
    },
  },
}));

export default makeSource({
  contentDirPath: "../docs",
  documentTypes: [Doc],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
