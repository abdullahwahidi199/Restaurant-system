// src/pages/expenses/Pagination.jsx
import TablePagination from "../../../modules/shared/erp/components/TablePagination";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) {
  return (
    <TablePagination
      page={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={[10, 25, 50, 100]}
      loading={loading}
    />
  );
}
