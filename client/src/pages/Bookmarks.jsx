import { useEffect, useState } from "react";
import api from "../lib/api";
import SchemeCard from "../components/SchemeCard";
export default function Bookmarks() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/bookmarks").then((r) => setItems(r.data.items));
  useEffect(() => {
    load();
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-black">Bookmarks</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((x) => (
          <SchemeCard key={x._id} scheme={x.scheme} />
        ))}
      </div>
      {!items.length && (
        <div className="card mt-6 p-8 text-center text-slate-500">
          No bookmarked schemes yet.
        </div>
      )}
    </div>
  );
}
