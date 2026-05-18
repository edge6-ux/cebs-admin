import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { LineItem } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { proposalId, lineItems } = await req.json()

  const itemsToInsert = (lineItems as LineItem[]).map((item, index) => ({
    proposal_id:  proposalId,
    service_id:   item.service_id || null,
    name:         item.name,
    description:  item.description || '',
    price:        item.price || 0,
    is_retainer:  item.is_retainer || false,
    sort_order:   index,
  }))

  const { error } = await supabaseAdmin
    .from('proposal_line_items')
    .insert(itemsToInsert)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
