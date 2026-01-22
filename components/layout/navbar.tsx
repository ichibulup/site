"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { NavAvatar, NavDropdownItem, NavName, NavUser, NavUserDropdown } from "@/components/dashboard/nav-user";
import { navigation, appGlobal } from "@/lib/constants";
import {
  Menu,
  User,
  LogIn,
  KeySquare,
  Phone,
  Clock,
  MapPin,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Nav } from "react-day-picker";
import { NavElement } from "@/components/dashboard/nav-element";

export function Navbar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-professional-main text-white py-2 hidden">
      {/*<div*/}
      {/*  data-show={showIntro}*/}
      {/*  aria-hidden={!showIntro}*/}
      {/*  className={[*/}
      {/*    "bg-professional-main text-white overflow-hidden py-2",*/}
      {/*    // transition mượt*/}
      {/*    "transition-[max-height,opacity] duration-300 ease-out",*/}
      {/*    // Ẩn: max-h-0 + opacity-0; Hiện: max-h-[48px] + opacity-100*/}
      {/*    "data-[show=false]:max-h-0 data-[show=false]:opacity-0",*/}
      {/*    "data-[show=true]:max-h-[48px] data-[show=true]:opacity-100",*/}
      {/*  ].join(" ")}*/}
      {/*>*/}
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Hotline: {appGlobal.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{appGlobal.times}</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{appGlobal.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/(customer)/booking" className="hover:underline">
                Đặt bàn ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto">
        <div className="flex h-16 items-center px-6">
          {/* Logo */}
          <div className="mr-4 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                className="w-9 h-9"
                src="/logo/icon.png"
                alt={appGlobal.name}
                width={36}
                height={36}
              />
              <span className="text-lg font-bold hidden md:inline-block">{appGlobal.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {/* <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav> */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger className="text-base bg-transparent">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="p-1 w-80">
                        <ul className="grid gap-1 md:w-[500px] md:grid-cols-2 rounded-md">
                          {item.children.map((child) => (
                            <li key={child.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.title}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {child.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild className="bg-transparent rounded-md">
                      <Link
                        href={item.href}
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="">{/*w-[300px] sm:w-[400px]*/}
              <SheetHeader className="pb-0">
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/logo/logo.png"
                      alt={appGlobal.name}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{appGlobal.name}</span>
                      <span className="truncate text-xs">Manager</span>
                    </div>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <nav className="p-4 pt-0">
                {navigation.map((item) => (
                  <div key={item.title}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                    {item.children && (
                      <div className="ml-8 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.title}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(false)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              {/* <nav className="flex flex-col space-y-0 p-4 pt-0">
                {navigation.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start w-full"
                  >
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium transition-colors hover:text-primary w-full text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </nav> */}
            </SheetContent>
          </Sheet>

          {/* Search */}
          <div className="ml-auto flex items-center space-x-2">
            <NavElement user={user}/>

            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 p-0 cursor-pointer"
                    >
                      <NavAvatar user={user} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    // side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                  >
                    <NavUserDropdown user={user}/>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    // side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <NavAvatar />
                        <NavName />
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <NavDropdownItem
                        icon={LogIn}
                        title="Đăng nhập"
                        link="/sign-in"
                      />
                      <NavDropdownItem
                        icon={KeySquare}
                        title="Đăng ký"
                        link="/sign-up"
                      />
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
