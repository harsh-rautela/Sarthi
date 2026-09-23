import { useEffect, useState } from "react";
import api from "../lib/api";
import SchemeCard from "../components/SchemeCard";
export default function Schemes() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    api
      .get("/schemes", {
        params: {
          q: q || undefined,
          category: category || undefined,
          limit: 50,
        },
      })
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Explore schemes</h1>
        <p className="mt-1 text-slate-500">
          Search centralized scheme records and open the official source when
          ready.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="card mb-6 grid gap-3 p-4 md:grid-cols-[1fr_220px_auto]"
      >
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search scholarships, housing, employment..."
        />
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {[
            "Education",
            "Healthcare",
            "Employment",
            "Agriculture",
            "Housing",
            "Entrepreneurship",
            "Social Security",
            "Energy"
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button className="btn-primary">Search</button>
      </form>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((s) => (
            <SchemeCard key={s._id} scheme={s} />
          ))}
        </div>
      )}
    </div>
  );
}
