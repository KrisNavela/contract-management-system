import AppLayout from '@/layouts/app-layout'
import { useForm, Head } from '@inertiajs/react'
import { FormEvent } from 'react'
import type { BreadcrumbItem } from '@/types'

/* ================= TYPES ================= */

interface ContractForm {
    contract_type: 'NEW' | 'RENEWAL'
    files: File[]
    remarks: string
}

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contracts', href: '/contracts' },
    { title: 'Create', href: '/contracts/create' },
]

/* ================= PAGE ================= */

export default function Create() {
    const { data, setData, post, processing, errors, reset } =
        useForm<ContractForm>({
            contract_type: 'NEW',
            files: [],
            remarks: '',
        })

    /* ================= SUBMIT ================= */

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Frontend guards
        if (!data.remarks.trim()) {
            alert('Remarks are required before submitting the contract.')
            return
        }

        if (data.files.length === 0) {
            alert('Please upload at least one contract file.')
            return
        }

        post('/contracts', {
            forceFormData: true,
            onSuccess: () => reset(),
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Contract" />

            <div className="mx-auto max-w-3xl">
                {/* ================= HEADER ================= */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Upload Contract of Lease
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Provide contract details, attach documents, and explain
                        the purpose of submission.
                    </p>
                </div>

                {/* ================= FORM CARD ================= */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <form onSubmit={submit} className="space-y-6 p-6">

                        {/* ================= CONTRACT TYPE ================= */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contract Type
                            </label>

                            <select
                                value={data.contract_type}
                                onChange={(e) =>
                                    setData(
                                        'contract_type',
                                        e.target.value as 'NEW' | 'RENEWAL'
                                    )
                                }
                                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="NEW">New</option>
                                <option value="RENEWAL">Renewal</option>
                            </select>
                        </div>

                        {/* ================= REMARKS (REQUIRED) ================= */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Remarks / Purpose <span className="text-red-500">*</span>
                            </label>

                            <textarea
                                rows={4}
                                value={data.remarks}
                                onChange={(e) =>
                                    setData('remarks', e.target.value)
                                }
                                placeholder="Explain the purpose or background of this contract submission"
                                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                                required
                            />

                            {errors.remarks && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.remarks}
                                </p>
                            )}
                        </div>

                        {/* ================= FILE UPLOAD ================= */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contract Files
                            </label>

                            <div className="mt-1 flex items-center justify-center rounded-lg border-2 
                                border-dashed border-gray-300 px-6 py-8 text-center"
                            >
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Upload PDF or Word documents
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Maximum file size: 5MB per file
                                    </p>

                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                        className="mt-3 block w-full text-sm text-gray-700
                                            file:mr-4 file:rounded-md file:border-0
                                            file:bg-blue-50 file:px-4 file:py-2
                                            file:text-sm file:font-medium
                                            file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) =>
                                            setData(
                                                'files',
                                                e.target.files
                                                    ? Array.from(e.target.files)
                                                    : []
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {data.files.length > 0 && (
                                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                    {data.files.map((file, index) => (
                                        <li key={index}>📎 {file.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* ================= ACTIONS ================= */}
                        <div className="flex justify-end gap-3 border-t pt-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm
                                        cursor-pointer hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`rounded-md px-6 py-2 text-sm text-white
                                    ${processing
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                    }`}
                            >
                                {processing ? 'Uploading…' : 'Submit Contract'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    )
}
