import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    children?: NavItem[];
}

/* ================= BREADCRUMBS ================= */

export interface BreadcrumbItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;
}


