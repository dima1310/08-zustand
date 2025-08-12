import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import NotePreviewModal from "./NotePreview.client";

export default async function NoteModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["note", id],
      queryFn: () => fetchNoteById(id),
    });
  } catch (error) {
    // Handle error - note not found
    console.error("Note not found:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotePreviewModal noteId={id} />
    </HydrationBoundary>
  );
}
