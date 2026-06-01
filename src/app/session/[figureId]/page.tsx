import { notFound } from "next/navigation";
import { FIGURES, getFigure } from "@/lib/figures";
import TutorClient from "@/components/TutorClient";

export function generateStaticParams() {
  return FIGURES.map((f) => ({ figureId: f.id }));
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ figureId: string }>;
}) {
  const { figureId } = await params;
  const figure = getFigure(figureId);
  if (!figure) notFound();
  return <TutorClient figure={figure} />;
}
