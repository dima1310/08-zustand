import type { Metadata } from "next";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = slug?.[0] || "All";

  // Формуємо назву та опис на основі обраного тегу
  let title: string;
  let description: string;

  if (tag === "All") {
    title = "Всі заміток - NoteHub";
    description =
      "Переглядайте всі ваші заміток в одному місці. Знайдіть потрібні нотатки швидко та ефективно.";
  } else {
    // Капіталізуємо перший символ тегу для красивого відображення
    const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
    title = `Заміток з тегом "${formattedTag}" - NoteHub`;
    description = `Переглядайте всі заміток з тегом "${formattedTag}". Організовані нотатки для швидкого пошуку по темі.`;
  }

  // Формуємо URL
  const url = `https://notehub.com/notes/filter/${slug.join("/")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt:
            tag === "All"
              ? "Всі заміток - NoteHub"
              : `Заміток з тегом ${tag} - NoteHub`,
        },
      ],
    },
  };
}

export default async function FilterPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const tag = slug?.[0] || "All";

  const queryClient = new QueryClient();

  // Передвибираємо дані нотаток
  const initialData = await queryClient.fetchQuery({
    queryKey: ["notes", 1, "", tag],
    queryFn: () =>
      fetchNotes({
        page: 1,
        search: "",
        tag: tag === "All" ? undefined : tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} initialData={initialData} />
    </HydrationBoundary>
  );
}
