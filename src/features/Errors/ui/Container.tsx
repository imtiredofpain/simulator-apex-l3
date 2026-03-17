import { memo } from 'react';

interface ErrorPageProps {
  children: React.ReactNode;
}

function ErrorPageContainer({ children }: ErrorPageProps) {
  return (
    <div
      className="w-full min-h-dvh overflow-hidden p-0 bg-background bg-linear-to-b from-background to-[#1a84ec4d]"
      aria-labelledby="forbidden-title"
      aria-describedby="forbidden-desc"
      role="region"
    >
      <div className="flex items-center justify-center p-4 min-h-dvh">
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );
}

export default memo(ErrorPageContainer);
