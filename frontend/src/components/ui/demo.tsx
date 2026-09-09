"use client";

import { Pagination } from "@/components/ui/pagination";

export default function PaginationDemo() {
  return (
    <div className="grid w-full place-items-center py-10">
      <Pagination count={12} defaultPage={1} label="Search results" />
    </div>
  );
}
