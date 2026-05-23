'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, UserPlus, ShoppingCart, Search, type LucideIcon } from 'lucide-react'
import AddProductDialog from './AddProductDialog'
import IssueInviteDialog from './IssueInviteDialog'

export default function QuickActionsRow() {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  return (
    <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      <ActionTile icon={Plus} label="Add product" onClick={() => setShowAddProduct(true)} />
      <ActionTile icon={UserPlus} label="Issue partner invite" onClick={() => setShowInvite(true)} />
      <ActionTile icon={ShoppingCart} label="Manual order" href="/admin/orders/new" />
      <ActionTile icon={Search} label="Find customer" href="/admin/customers" />

      {showAddProduct && <AddProductDialog onClose={() => setShowAddProduct(false)} />}
      {showInvite && <IssueInviteDialog onClose={() => setShowInvite(false)} />}
    </section>
  )
}

function ActionTile({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  href?: string
}) {
  const body = (
    <div
      className="flex items-center gap-3 rounded-3xl border border-[#1e3d32]/8 bg-white px-4 py-3.5 transition-all hover:border-[#D4A373]/40 hover:bg-[#FAF6EE]/40"
      style={{ boxShadow: '0 1px 0 0 rgba(30,61,50,0.04)' }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2F5D50]/10">
        <Icon className="h-4 w-4 text-[#2F5D50]" strokeWidth={1.8} />
      </span>
      <span className="font-heading text-[12.5px] font-semibold text-[#1e3d32]">{label}</span>
    </div>
  )
  return href ? (
    <Link href={href}>{body}</Link>
  ) : (
    <button type="button" onClick={onClick} className="w-full text-left">
      {body}
    </button>
  )
}
