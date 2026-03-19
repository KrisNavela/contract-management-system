import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <img
                src="/images/company-logo.png"
                alt="Company Logo"
                className="h-8 w-auto"
            />
            <span className="text-sm font-semibold">
                CMS
            </span>
        </div>
    )
}