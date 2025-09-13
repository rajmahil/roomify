"use client";

import type React from "react";

import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SideDrawerProps {
  children: ReactNode;
  trigger: ReactNode;
  title?: string;
  description?: string;
  direction?: "left" | "right";
  width?: string;
  gap?: string;
  className?: string;
  open?: boolean;
  icon?: ReactNode;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function SideDrawer({
  children,
  trigger,
  title,
  description,
  direction = "right",
  width = "310px",
  gap = "8px",
  className,
  open,
  onOpenChange,
  icon,
  footer,
}: SideDrawerProps) {
  const positionClasses =
    direction === "right" ? "right-2 top-2 bottom-2" : "left-2 top-2 bottom-2";

  const initialTransform =
    direction === "right" ? `calc(100% + ${gap})` : `calc(-100% - ${gap})`;

  return (
    <Drawer.Root direction={direction} open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-gradient-to-tl from-black/50 to-black/30 backdrop-blur-sm z-[100]" />
        <Drawer.Content
          className={cn(
            `${positionClasses} fixed z-[1001] outline-none flex`,
            className
          )}
          style={
            {
              "--initial-transform": initialTransform,
              width,
            } as React.CSSProperties
          }
        >
          <div className="bg-white dark:bg-secondary border h-full w-full grow flex flex-col rounded-lg overflow-hidden shadow-lg p-2 relative">
            <div className="p-4 flex flex-row items-center gap-4">
              {icon && icon}
              <div>
                {title && (
                  <Drawer.Title className="font-medium text-foreground">
                    {title}
                  </Drawer.Title>
                )}
                {description && (
                  <Drawer.Description className="text-muted-foreground  text-sm">
                    {description}
                  </Drawer.Description>
                )}
              </div>
            </div>
            <ScrollArea className="flex-1 h-0 -mx-1 px-4 py-2 min-w-0 overflow-hidden">
              <div className="space-y-2 min-w-0">{children}</div>
            </ScrollArea>

            <div className="absolute left-0 bottom-0 z-10 w-full flex flex-row items-center justify-end bg-white dark:bg-secondary border-t">
              {footer}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
