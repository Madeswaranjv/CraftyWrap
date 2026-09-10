'use client';

import { FlowButton } from "@/components/ui/flow-button";

export const FlowButtonDemo = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#140E0A] p-4">
      <FlowButton text="Flow Button" />
    </div>
  );
};

export default { FlowButtonDemo };
