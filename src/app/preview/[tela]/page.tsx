import { FigmaPreview } from "@/components/preview/figma-preview";

export default async function PreviewTelaPage({
  params,
}: {
  params: Promise<{ tela: string }>;
}) {
  const { tela } = await params;
  return <FigmaPreview tela={tela} />;
}
