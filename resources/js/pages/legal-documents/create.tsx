import AppLayout from '@/layouts/app-layout'
import { Head, router, useForm, usePage } from '@inertiajs/react'

export default function CreateLegalDocument() {
    const page = usePage<any>()
    const authUser = page.props.auth.user

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        department_id: authUser.department_id, // ✅ AUTO
        files: [] as File[],
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/legal-documents', {
            forceFormData: true,
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Legal Documents', href: '/legal-documents' },
                { title: 'Create', href: '/legal-documents/create' },
            ]}
        >
            <Head title="Create Legal Document" />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold">
                    Create Legal Document
                </h1>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                >
                    {/* TITLE (DROPDOWN) */}
                    <div>
                        <label className="block text-sm font-medium">
                            Document Title
                        </label>

                        <select
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">Select document title</option>
                            <option value="Non-Disclosure Agreement">
                                Non-Disclosure Agreement
                            </option>
                            <option value="Service Agreement">
                                Service Agreement
                            </option>
                            <option value="Other Documents">
                                Other Documents
                            </option>
                        </select>

                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            rows={4}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>

                    {/* FILES */}
                    <div>
                        <label className="block text-sm font-medium">
                            Attach Files
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) =>
                                setData(
                                    'files',
                                    e.target.files
                                        ? Array.from(e.target.files)
                                        : []
                                )
                            }
                            className="mt-1 block text-sm"
                        />
                        {errors.files && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.files}
                            </p>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/legal-documents')}
                            className="rounded-md border px-4 py-2 text-sm
                                    cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`rounded-md px-4 py-2 text-sm font-medium text-white
                                transition-colors duration-200
                                ${
                                    processing
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                }`}
                        >
                            {processing ? 'Submitting…' : 'Create & Submit'}
                        </button>
                    </div>

                </form>
            </div>
        </AppLayout>
    )
}
