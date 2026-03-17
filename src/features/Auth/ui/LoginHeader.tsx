import { memo } from "react";

const LoginHeader = memo(function LoginHeader({ title, description, showDescription }: { title: string; description: string; showDescription: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {showDescription && (
        <p className="text-muted-foreground text-balance">{description}</p>
      )}
    </div>
  );
});

export default LoginHeader;