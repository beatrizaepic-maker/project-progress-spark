import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[9999] overflow-hidden border-2 border-purple-500 bg-background px-3 py-2 text-sm text-white shadow-md animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-opacity duration-200 ease-in-out",
        className
      )}
      style={{
        fontSize: '12px',
        padding: '8px 12px',
        borderRadius: '0',
        backgroundColor: 'hsl(var(--background))',
        color: 'white',
        border: '2px solid rgb(168, 85, 247)', // purple-500
        maxWidth: 'calc(100vw - 2rem)',
        wordWrap: 'break-word'
      }}
      avoidCollisions={true}
      collisionPadding={16}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
