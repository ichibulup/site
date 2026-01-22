"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CartButton } from "@/components/element/cart";
import { NotifyButton } from "@/components/element/notify";
import { SearchDialog } from "@/components/element/search-bar";
import { SearchBarHolder } from "@/components/element/search-bar";
import { ModeToggle } from "@/components/element/mode-toggle";
import { Customizer } from "@/components/element/customizer";
import { Utility } from "@/components/element/utility";
import { Button } from "@/components/ui/button"
import { User } from "@/lib/interfaces"
import { Search } from "lucide-react";

export function NavElement({
	user,
}: {
	user?: User | null
}) {
  const router = useRouter();
  const [openSearch, setOpenSearch] = useState(false);
	
	return (
		<>
			{/*<div className="hidden lg:flex">*/}
			{/*  <div className="relative">*/}
			{/*    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />*/}
			{/*    <Input*/}
			{/*      type="search"*/}
			{/*      placeholder="Search..."*/}
			{/*      className="w-[200px] pl-8"*/}
			{/*    />*/}
			{/*  </div>*/}
			{/*</div>*/}
			<Button variant="ghost" size="icon" onClick={() => setOpenSearch(true)}>
				<Search className="h-4 w-4" />
			</Button>
			<SearchDialog open={openSearch} onOpenChange={setOpenSearch} />
			{/* <SearchBarHolder /> */}

			{/* Language */}
			{/* <DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="hidden sm:flex">
						<Globe className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem>English</DropdownMenuItem>
					<DropdownMenuItem>Spanish</DropdownMenuItem>
					<DropdownMenuItem>French</DropdownMenuItem>
					<DropdownMenuItem>German</DropdownMenuItem>
					<DropdownMenuItem>Italian</DropdownMenuItem>
					<DropdownMenuItem>Vietnamese</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu> */}

			{/* Theme Toggle */}
			<ModeToggle />
			{/* Theme Custom */}
			<Customizer />
			{/* Notifications */}
			<NotifyButton/>
			{/* Carts */}
			<CartButton/>
			{/* Utility */}
			<Utility/>

			{/* {user?.role === "customer" ? (
				<>
					<CartButton/>
				</>
			) : (
				<>
					<Utility/>
				</>
			)} */}
		</>
	)
}
