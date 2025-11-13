import { useEffect, useState } from "react";
import instance from "../../../api/axiosInstance";
import FeedBacksDisplay from "./FeedbacksDisplayModel";
import { Filter, Calendar } from "lucide-react";

export default function Feedbacks() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filterResponse, setFilterResponse] = useState("all");
  const [filterDate, setFilterDate] = useState({ start: "", end: "" });

  const getAllReviews = async () => {
    try {
      const res = await instance.get("/menu/reviews/");
      setReviews(res.data);
      setFilteredReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAllReviews();
  }, []);

  useEffect(() => {
    let filtered = [...reviews];
    if (filterResponse === "responded") {
      filtered = filtered.filter((r) => r.response);
    } else if (filterResponse === "not_responded") {
      filtered = filtered.filter((r) => !r.response);
    }

    if (filterDate.start && filterDate.end) {
      const start = new Date(filterDate.start);
      const end = new Date(filterDate.end);
      filtered = filtered.filter((r) => {
        const created = new Date(r.created_at);
        return created >= start && created <= end;
      });
    }

    setFilteredReviews(filtered);
  }, [reviews, filterResponse, filterDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Reviews Management</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter className="w-5 h-5 text-blue-500" />
          Filters
        </div>

        <select
          value={filterResponse}
          onChange={(e) => setFilterResponse(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="all">All</option>
          <option value="responded">Responded</option>
          <option value="not_responded">Not Responded</option>
        </select>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <input
            type="date"
            value={filterDate.start}
            onChange={(e) => setFilterDate({ ...filterDate, start: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={filterDate.end}
            onChange={(e) => setFilterDate({ ...filterDate, end: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      <FeedBacksDisplay reviews={filteredReviews} refresh={getAllReviews} />
    </div>
  );
}
