import AppLayout from '@/layouts/app-layout'
import { Head, router, useForm, usePage } from '@inertiajs/react'

/* ================= TYPES ================= */

interface FileItem {
    id: number
    file_path: string
}

interface LegalDocument {
    id: number
    reference_no: string
    title: string
    description?: string | null
    status: string
    files?: FileItem[]
}

interface Props {
    document: LegalDocument
}

/* ================= PAGE ================= */

export default function EditLegalDocument({ document }: Props) {
    const { auth } = usePage<any>().props
    const user = auth?.user

    // 🚫 HARD GUARD (frontend)
    if (
        user?.legal_role !== 'USER' ||
        document.status !== 'RETURNED'
    ) {
        return (
            <AppLayout breadcrumbs={[
                { title: 'Legal Documents', href: '/legal-documents' },
            ]}>
                <Head title="Access Denied" />
                <div className="mx-auto max-w-2xl py-20 text-center">
                    <h1 className="text-xl font-semibold text-red-600">
                        Access Denied
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        You are not allowed to edit this document.
                    </p>
                </div>
            </AppLayout>
        )
    }

    /* ================= FORM ================= */

    const { data, setData, post, processing, errors } = useForm({
        title: document.title,
        description: document.description ?? '',
        files: [] as File[],
        remarks: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()

        post(`/legal-documents/${document.id}/update`, {
            forceFormData: true,
        })
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Legal Documents', href: '/legal-documents' },
                { title: document.reference_no, href: `/legal-documents/${document.id}` },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${document.reference_no}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        Edit Legal Document
                    </h1>
                    <p className="text-sm text-gray-600">
                        Update the document and resubmit it for approval
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                >
                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-medium">
                            Title
                        </label>
                        <select
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">Select document type</option>
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

                    {/* EXISTING FILES */}
                    {document.files && document.files.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Existing Files
                            </p>

                            <ul className="divide-y rounded-md border">
                                {document.files.map((file) => (
                                    <li
                                        key={file.id}
                                        className="flex items-center justify-between px-4 py-2 text-sm"
                                    >
                                        <span>
                                            {file.file_path.split('/').pop()}
                                        </span>

                                        <a
                                            href={`/storage/${file.file_path}`}
                                            target="_blank"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ADD NEW FILES */}
                    <div>
                        <label className="block text-sm font-medium">
                            Add More Files (optional)
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
                    {/* REMARKS */}
                    <div>
                        <label className="block text-sm font-medium">
                            Message / Remarks (optional)
                        </label>

                        <textarea
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            rows={3}
                            placeholder="Explain the changes you made..."
                            required
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(`/legal-documents/${document.id}`)
                            }
                            className="rounded-md border px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save & Resubmit'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
