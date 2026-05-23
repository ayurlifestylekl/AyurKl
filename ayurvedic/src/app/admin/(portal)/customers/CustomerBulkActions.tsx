'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import BulkVoucherPushDialog from './BulkVoucherPushDialog'

export default function CustomerBulkActions({
  selectedIds,
}: {
  selectedIds: string[]
}) {
  const [pushOpen, setPushOpen] = useState(false)
  if (selectedIds.length === 0) return null

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-[#D4A373]/30 bg-[#FAF6EE] p-3">
      <span className="text-[12px] font-semibold text-[#1e3d32]">
        {selectedIds.length} selected
      </span>
      <button
        type="button"
        onClick={() => setPushOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4A373] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#b58a5d]"
      >
        <Gift className="h-3.5 w-3.5" /> Push voucher
      </button>
      {pushOpen ? (
        <BulkVoucherPushDialog
          customerIds={selectedIds}
          onClose={() => setPushOpen(false)}
        />
      ) : null}
    </div>
  )
}
