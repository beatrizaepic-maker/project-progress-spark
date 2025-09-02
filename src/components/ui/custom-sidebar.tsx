import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import { cn } from "@/lib/utils";

interface Links {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface CustomSidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const CustomSidebarContext = createContext<CustomSidebarContextProps | undefined>(
  undefined
);

export const useCustomSidebar = () => {
  const context = useContext(CustomSidebarContext);
  if (!context) {
    throw new Error("useCustomSidebar must be used within a CustomSidebarProvider");
  }
  return context;
};

export const CustomSidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <CustomSidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </CustomSidebarContext.Provider>
  );
};

export const CustomSidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <CustomSidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </CustomSidebarProvider>
  );
};

export const CustomSidebarBody = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <CustomDesktopSidebar className={className} children={children} />
      <CustomMobileSidebar className={className} children={children} />
    </>
  );
};

export const CustomDesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useCustomSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen py-4 hidden md:flex md:flex-col bg-background border-r border-border w-[300px] flex-shrink-0 shadow-sm fixed left-0 top-0 z-20",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
        paddingLeft: animate ? (open ? "16px" : "4px") : "16px",
        paddingRight: animate ? (open ? "16px" : "4px") : "16px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      <div className={cn("flex flex-col h-full gap-4", open ? "items-start" : "items-center")}>
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
};

export const CustomMobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useCustomSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-card/50 backdrop-blur-sm border-b border-border w-full shadow-sm",
          className
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-foreground hover:text-primary cursor-pointer transition-colors"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background border-r border-border p-10 z-[100] flex flex-col justify-between shadow-lg",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-foreground hover:text-primary cursor-pointer transition-colors"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const CustomSidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: any;
}) => {
  const { open, animate } = useCustomSidebar();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (link.onClick) {
      link.onClick();
    } else if (link.href) {
      // Para React Router ou navegação customizada
      window.location.href = link.href;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 group/sidebar py-3 px-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50",
        open ? "justify-start" : "justify-center",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 text-muted-foreground group-hover/sidebar:text-primary transition-colors">
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-foreground text-sm group-hover/sidebar:translate-x-1 group-hover/sidebar:text-primary transition-all duration-200 whitespace-pre inline-block !p-0 !m-0 font-medium"
      >
        {link.label}
      </motion.span>
    </div>
  );
};
