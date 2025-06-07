import { useState } from "react";

interface GiphySearchProps {
  onSelect: (url: string) => void;
}

export default function GiphySearch({ onSelect }: GiphySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const API_KEY = "TU_API_KEY_GIPHY"; // <-- Aquí pones tu API Key de Giphy

  const searchGifs = async () => {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=8`
    );
    const data = await res.json();
    setResults(data.data.map((gif: any) => gif.images.fixed_height.url));
  };

  return (
    <div className="p-2 bg-white border rounded shadow w-80">
      <input
        className="border p-2 mb-2 w-full rounded"
        placeholder="Buscar GIF..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && searchGifs()}
      />

      <div className="grid grid-cols-4 gap-2">
        {results.map((url) => (
          <img
            key={url}
            src={url}
            className="cursor-pointer rounded"
            onClick={() => onSelect(url)}
          />
        ))}
      </div>
    </div>
  );
}
