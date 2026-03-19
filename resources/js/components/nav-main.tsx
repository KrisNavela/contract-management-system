import { useSidebar } from "@/components/ui/sidebar"
import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import type { NavItem } from '@/types'
import { ChevronDown } from 'lucide-react'
import { useEffect } from "react"

interface Props {
    items: NavItem[]
}

export function NavMain({ items }: Props) {
    const { state, toggleSidebar  } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { url } = usePage()
    const [openMenu, setOpenMenu] = useState<string | null>(null)

    useEffect(() => {
        if (isCollapsed) {
            setOpenMenu(null)
        }
    }, [isCollapsed])

    return (
        <nav className="space-y-1 px-2">
            {items.map((item) => {
                const isActive =
                    item.href && url.startsWith(item.href.toString())

                const isParentActive =
                    item.children?.some(
                        (child) =>
                            child.href &&
                            url.startsWith(child.href.toString())
                    ) ?? false

                const isOpen = openMenu === item.title || isParentActive

                return (
                    <div key={item.title}>
                        {/* ================= SINGLE LINK ================= */}
                        {item.href && !item.children && (
                            <Link
                                href={item.href}
                                onClick={() => {
                                    if (isCollapsed) {
                                        toggleSidebar()
                                    }
                                }}
                                className={`flex w-full items-center justify-between h-9
                                    rounded-md px-3 text-sm font-medium transition
                                    ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    {item.icon && (
                                        <item.icon className="size-5 shrink-0" />
                                    )}
                                    <span className="leading-none">{item.title}</span>
                                </span>
                            </Link>
                        )}

                        {/* ================= EXPANDABLE PARENT ================= */}
                        {item.children && (
                            <>
                                <button
                                type="button"
                                
                                onClick={() => {
                                    if (isCollapsed) {
                                        toggleSidebar()
                                    } else {
                                        setOpenMenu(isOpen ? null : item.title)
                                    }
                                }}
                                    className={`flex w-full items-center justify-between h-9 
                                        rounded-md px-3 text-sm font-medium transition
                                        ${
                                            isParentActive
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        {item.icon && (
                                            <item.icon className="size-5 shrink-0" />
                                        )}
                                        <span className="leading-none">{item.title}</span>
                                    </span>

                                    <ChevronDown
                                        className={`size-4 transition-transform ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="mt-1 space-y-1 pl-10">
                                        {item.children.map((child) => {
                                            const isChildActive =
                                                child.href &&
                                                url.startsWith(
                                                    child.href.toString()
                                                )

                                            return (
                                                <Link
                                                    key={child.title}
                                                    href={child.href!}
                                                    className={`block rounded-md px-3 py-1.5 text-sm transition
                                                        ${
                                                            isChildActive
                                                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                                        }`}
                                                >
                                                    {child.title}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
