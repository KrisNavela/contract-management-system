import AppLogo from '@/components/app-logo';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between bg-gradient-to-br from-emerald-700 to-emerald-600 p-12 text-white lg:flex">

                {/* Top Branding */}
                <div className="space-y-8">

                    {/* Logo + System Name */}
                    <div className="flex items-center space-x-4">
                        <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                            <AppLogo className="h-24 w-auto text-white" />
                        </div>

                    </div>

                    {/* Feature Highlights */}
                    <div className="mt-12 space-y-6 text-sm leading-relaxed text-emerald-100">

                        <div className="flex items-start space-x-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                            <p>
                                Streamlined contract upload, verification, and approval workflows.
                            </p>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                            <p>
                                Role-based review system for secure document handling.
                            </p>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="mt-1 h-2 w-2 rounded-full bg-white" />
                            <p>
                                Centralized monitoring for compliance and audit tracking.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href="/"
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogo className="h-10 w-auto text-emerald-600" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
