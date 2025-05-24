import { LogoLabInformatika } from "@/lib/StaticImagesLib";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const OverlayLoader = ({ className, children, withLoader = true, textContent, subTextContent, textContentClassName, subTextContentClassName }: {
    className?: string;
    children?: ReactNode;
    withLoader?: boolean;
    textContent?: string;
    subTextContent?: string;
    textContentClassName?: string;
    subTextContentClassName?: string;
}) => {
    return (
        <>
            <div className={ `fixed w-screen h-screen bg-muted content-center text-center space-y-1 z-[999]` }>
                <div className={`relative w-28 h-28 m-auto ${className ?? ''}`}>
                    <img
                        src={LogoLabInformatika} width={120}
                        alt="pemantik-logo"
                        className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
                    />
                    {withLoader && (
                        <div className="animate-spin border-[6px] border-[#f1f2f3] border-l-blue-950 rounded-full size-28" />
                    )}
                </div>
                {textContent && (
                    <p className={ cn("font-medium", textContentClassName) }>{ textContent }</p>
                )}
                {subTextContent && (
                    <p className={ cn("text-muted-foreground text-sm font-medium", subTextContentClassName)}>{ subTextContent }</p>
                )}
                { children }
            </div>
        </>
    );
};
