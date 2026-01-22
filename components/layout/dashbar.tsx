"use client"

import React, { ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { appGlobal } from "@/lib/constants"
import { createBreadcrumbs } from "@/lib/general/breadcrumb-utils"
import { NavElement } from "@/components/dashboard/nav-element"
import { useUser } from "@/hooks/use-user";

export function Dashbar({
  children
}: {
  children: ReactNode
}) {
  const { user } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  const breadcrumbs = createBreadcrumbs(pathname, appGlobal.name)

  return (
    <>
      <header className="flex h-14 shrink-0 border-b items-center gap-2 ease-linear">
        <div className="flex flex-1 items-center justify-between gap-2 px-6">
          <div className="container flex h-14 items-center gap-2 md:gap-4">
            {children}
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {item.isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!item.isLast && (
                      <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="items-center">
            <div className="ml-auto flex items-center space-x-2">
              <NavElement user={null} />
            </div>
          </div>
        </div>
      </header>
    </>
  )

  // return (
  //   <>
  //     <header className="flex h-14 shrink-0 border-b items-center gap-2 ease-linear">
  //       {/* <div className="flex items-center gap-2 px-4"> */}
  //       <div className="container flex h-14 items-center gap-2 md:gap-4 px-6">
  //         {children}
  //         <Separator
  //           orientation="vertical"
  //           className="mr-2 data-[orientation=vertical]:h-4"
  //         />
  //         <Breadcrumb>
  //           <BreadcrumbList>
  //             {breadcrumbs.map((item, index) => (
  //               <React.Fragment key={item.href}>
  //                 <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
  //                   {item.isLast ? (
  //                     <BreadcrumbPage>{item.label}</BreadcrumbPage>
  //                   ) : (
  //                     <BreadcrumbLink asChild>
  //                       <Link href={item.href}>
  //                         {item.label}
  //                       </Link>
  //                     </BreadcrumbLink>
  //                   )}
  //                 </BreadcrumbItem>
  //                 {!item.isLast && (
  //                   <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
  //                 )}
  //               </React.Fragment>
  //             ))}
  //           </BreadcrumbList>
  //         </Breadcrumb>
  //       </div>
  //       {/* <ModeToggle
  //         className="px-6 ml-auto"
  //       /> */}
  //       <div className="items-center px-6">
  //         <div className="ml-auto flex items-center space-x-2">
  //           <Customizer/>
  //           <ModeToggle />
  //         </div>
  //       </div>
  //     </header>
  //   </>
  // )
}
