import React from "react";
import TablePagination from "../../modules/shared/erp/components/TablePagination";

const PAGE_SIZE = 20;

export default function PaginationControls({
  page,
  count = 0,
  hasNext,
  hasPrevious,
  onPageChange,
  pageSize = PAGE_SIZE,
  className = "",
}) {
  return (
    <TablePagination
      page={page}
      totalItems={count}
      pageSize={pageSize}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      onPageChange={onPageChange}
      className={className}
    />
  );
}
