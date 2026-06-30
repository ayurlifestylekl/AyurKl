import Link from 'next/link'
import CsvImportForm from './CsvImportForm'

export const metadata = { title: 'Import Products · Admin' }

export default function ImportPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        href="/admin/products"
        className="text-[11px] uppercase tracking-wider text-[#6E1023]/55 hover:text-[#D4AF37]"
      >
        ← Back to products
      </Link>
      <header>
        <h1 className="font-heading text-[24px] font-bold text-[#6E1023]">
          Import products from CSV
        </h1>
        <p className="mt-1 text-[12.5px] text-[#1F1F1F]/65">
          Bulk-load products. Rows with missing required columns are skipped and reported.
        </p>
      </header>
      <CsvImportForm />
    </div>
  )
}
