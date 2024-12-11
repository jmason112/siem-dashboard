import * as React from "react";
import { toast as sonnerToast } from "sonner";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast({ title, description, variant = "default" }: ToastProps) {
  sonnerToast[variant === "destructive" ? "error" : "success"](
    <ToastContent title={title} description={description} />
  );
}

function ToastContent({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid gap-1">
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
    </div>
  );
}
