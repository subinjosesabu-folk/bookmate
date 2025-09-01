import React from "react";

const Pagination = ({ meta, onPageChange }) => {
  if (!meta) return null;
  const { total = 0, page = 1, limit = 10 } = meta;
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={page <= 1}
      >
        Prev
      </button>
      <div>
        Page {page} of {pages}
      </div>
      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={page >= pages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
