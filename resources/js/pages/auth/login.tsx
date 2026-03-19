import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Contract Management System"
            description="Secure access to contract workflows and approvals"
        >
            <Head title="Log in" />

            {/* Status Message */}
            {status && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {status}
                </div>
            )}

            {/* Login Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">

                                {/* Email */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="font-medium text-gray-700"
                                    >
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        className="h-11 focus-visible:ring-emerald-600"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label
                                            htmlFor="password"
                                            className="font-medium text-gray-700"
                                        >
                                            Password
                                        </Label>

                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm font-medium text-emerald-600 hover:underline"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>

                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-11 focus-visible:ring-emerald-600"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal text-gray-700"
                                    >
                                        Keep me signed in
                                    </Label>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="mt-2 h-11 w-full bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    {processing ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="mt-6 text-center text-sm text-gray-600">
                                    Don’t have an account?{' '}
                                    <TextLink
                                        href={register()}
                                        className="font-medium text-emerald-600 hover:underline"
                                        tabIndex={6}
                                    >
                                        Create one
                                    </TextLink>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} Contract Management System
            </div>
        </AuthLayout>
    );
}