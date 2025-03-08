import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-sm",
      "bg-background/95 backdrop-blur-sm",
      "p-1 text-muted-foreground",
      "border border-border/40",
      "shadow-sm shadow-border/5",
      "transition-all duration-300",
      "hover:shadow-md hover:border-border/60",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-secondary/5",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-2 py-1.5 text-sm font-medium relative group",
      "text-muted-foreground transition-colors",
      "hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-foreground",
      "before:absolute before:inset-0 before:bg-primary/10 before:opacity-0 before:scale-50",
      "before:transition-all before:duration-300",
      "hover:before:opacity-100 hover:before:scale-100",
      "after:absolute after:inset-0 after:ring-1 after:ring-primary/20",
      "after:opacity-0 after:scale-50",
      "after:transition-all after:duration-300",
      "hover:after:opacity-100 hover:after:scale-100",
      "data-[state=active]:before:opacity-100 data-[state=active]:before:scale-100",
      "data-[state=active]:after:opacity-100 data-[state=active]:after:scale-100",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
