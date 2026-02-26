"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import {
  Sparkles,
  Menu,
  Phone,
  Calendar,
  User,
  LogOut,
  LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  if (pathname === "/userform") return null;

  const navItems = [
    { name: "About", href: "/#about" },
    { name: "Spaces", href: "/#spaces" },
    { name: "Workshops", href: "/workshops" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const handleSignOut = async () => signOut({ callbackUrl: "/login" });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-2xl py-3"
          : "bg-white/90 backdrop-blur-xl shadow-lg py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex justify-between items-center">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white w-7 h-7" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Eeni Meeni
            </h1>
            <p className="text-xs text-gray-500 font-semibold tracking-wide">
              Where Magic Happens ✨
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    href={item.href}
                    className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:text-purple-700 bg-transparent hover:bg-purple-100 transition"
                  >
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+911234567890">
            <Button variant="ghost" className="font-bold text-purple-700">
              <Phone className="w-4 h-4 mr-2" /> Call Now
            </Button>
          </a>

          <Link href="/packages">
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white shadow-lg rounded-xl">
              <Calendar className="w-4 h-4 mr-2" /> Book Now
            </Button>
          </Link>

          {/* Auth */}
          {status === "loading" ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-10 h-10 border shadow">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white font-bold">
                    {getInitials(session?.user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-bold">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.phone}</p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="font-bold text-purple-700 border-purple-600 rounded-xl"
              >
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-7 h-7 text-purple-700" />
              </Button>
            </SheetTrigger>

            <SheetContent className="w-80 flex flex-col">
              <SheetHeader>
                {/* Required for accessibility */}
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>

              {/* Brand */}
              <div className="flex items-center gap-3 mt-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <p className="font-black text-lg">Eeni Meeni</p>
              </div>

              {/* Profile */}
              {session && (
                <div className="p-4 rounded-xl bg-purple-50 mb-4">
                  <p className="font-semibold">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {session.user?.phone}
                  </p>
                </div>
              )}

              {/* Nav Links */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-5 py-4 rounded-xl text-gray-700 font-semibold bg-white hover:bg-purple-100 transition"
                  >
                    {item.name}
                  </Link>
                ))}

                {session && (
                  <Link
                    href="/dashboard"
                    className="block px-5 py-4 rounded-xl text-gray-700 font-semibold bg-white hover:bg-purple-100 transition"
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="mt-auto space-y-3 pt-6">
                <a href="tel:+911234567890">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl text-purple-700 border-purple-700"
                  >
                    <Phone className="w-4 h-4 mr-2" /> Call Now
                  </Button>
                </a>

                <Link href="/packages">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold shadow-xl">
                    <Calendar className="w-4 h-4 mr-2" /> Book Now
                  </Button>
                </Link>

                {session ? (
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full text-red-600 border-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full text-purple-700 border-purple-700"
                    >
                      <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </Button>
                  </Link>
                )}
              </div>

              <p className="text-center mt-4 text-sm text-gray-500">
                Open Daily • 9 AM - 9 PM
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
