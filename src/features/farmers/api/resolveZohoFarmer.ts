// import { supabase } from '../../../shared/lib/supabaseClient'
// import type { Farmer } from '../../../shared/types'
// import type { ZohoVendor } from '../../purchase-orders/api/zohoApi'

// function normalizeName(name: string): string {
//   return name.trim().toLowerCase().replace(/\s+/g, ' ')
// }

// function normalizePhone(phone: string | null | undefined): string | null {
//   if (!phone) return null
//   const digits = phone.replace(/\D/g, '')
//   // Compare last 10 digits so +91/leading-0/formatting differences don't
//   // cause a false mismatch between how Zoho stores a number and how it
//   // was typed in manually for a local farmer record.
//   return digits.length >= 10 ? digits.slice(-10) : digits || null
// }

// export async function resolveZohoFarmer(vendor: ZohoVendor): Promise<Farmer | null> {
//   // Already linked — nothing to do.
//   const { data: existing } = await supabase
//     .from('farmers')
//     .select('*')
//     .eq('zoho_contact_id', vendor.zoho_contact_id)
//     .maybeSingle()

//   if (existing) return existing as Farmer

//   // FIX: before creating a brand-new farmer row, look for an existing
//   // LOCAL-ONLY farmer (no zoho_contact_id yet) that's actually the same
//   // person — matched by name or phone. If found, link Zoho to THAT row
//   // instead of inserting a duplicate. This is what was producing two
//   // "A C Sathisha" entries in the vendor dropdown, one of which could
//   // never upload to Zoho.
//   const { data: unlinkedCandidates, error: candidatesError } = await supabase
//     .from('farmers')
//     .select('*')
//     .is('zoho_contact_id', null)

//   if (!candidatesError && unlinkedCandidates) {
//     const targetName = normalizeName(vendor.name)
//     const targetPhone = normalizePhone(vendor.phone)

//     const match = unlinkedCandidates.find((f: any) => {
//       const nameMatches = normalizeName(f.name ?? '') === targetName
//       const phoneMatches =
//         targetPhone !== null && normalizePhone(f.mobile) === targetPhone
//       return nameMatches || phoneMatches
//     })

//     if (match) {
//       const { data: updated, error: updateError } = await supabase
//         .from('farmers')
//         .update({
//           zoho_contact_id: vendor.zoho_contact_id,
//           // Fill in the phone number from Zoho if the local record didn't have one.
//           mobile: match.mobile ?? vendor.phone,
//         })
//         .eq('id', match.id)
//         .select()
//         .maybeSingle()

//       if (updateError) {
//         console.error('Failed to link existing local farmer to Zoho vendor:', updateError)
//         return null
//       }

//       return updated as Farmer
//     }
//   }

//   // No local match found — genuinely a new vendor, safe to insert.
//   const { data: created, error } = await supabase
//     .from('farmers')
//     .insert({
//       name: vendor.name,
//       mobile: vendor.phone,
//       zoho_contact_id: vendor.zoho_contact_id,
//     })
//     .select()
//     .maybeSingle()

//   if (error) {
//     console.error('Failed to create local farmer from Zoho vendor:', error)
//     return null
//   }

//   return created as Farmer
// }
import { supabase } from '../../../shared/lib/supabaseClient'
import type { Farmer } from '../../../shared/types'
import type { ZohoVendor } from '../../purchase-orders/api/zohoApi'

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  // Compare last 10 digits so +91/leading-0/formatting differences don't
  // cause a false mismatch between how Zoho stores a number and how it
  // was typed in manually for a local farmer record.
  return digits.length >= 10 ? digits.slice(-10) : digits || null
}

// Finds the farmer already linked to this Zoho contact.
// Uses limit(1) so it never fails if an old duplicate still exists.
async function findLinkedFarmer(zohoContactId: string): Promise<Farmer | null> {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('zoho_contact_id', zohoContactId)
    .limit(1)

  if (error) {
    console.error('Failed to look up farmer by Zoho id:', error)
    return null
  }
  return (data?.[0] as Farmer | undefined) ?? null
}

export async function resolveZohoFarmer(vendor: ZohoVendor): Promise<Farmer | null> {
  // Already linked: nothing to do.
  const existing = await findLinkedFarmer(vendor.zoho_contact_id)
  if (existing) return existing

  // Before creating a new farmer, look for an existing LOCAL-ONLY farmer
  // (no zoho_contact_id yet) that is the same person. Name match is
  // preferred over phone match, so two different people who share a phone
  // number are not mixed up.
  const { data: unlinkedCandidates, error: candidatesError } = await supabase
    .from('farmers')
    .select('*')
    .is('zoho_contact_id', null)

  if (!candidatesError && unlinkedCandidates) {
    const targetName = normalizeName(vendor.name)
    const targetPhone = normalizePhone(vendor.phone)

    const byName = unlinkedCandidates.find(
      (f: any) => normalizeName(f.name ?? '') === targetName
    )
    const byPhone =
      targetPhone !== null
        ? unlinkedCandidates.find((f: any) => normalizePhone(f.mobile) === targetPhone)
        : undefined

    const match = byName ?? byPhone

    if (match) {
      const { data: updated, error: updateError } = await supabase
        .from('farmers')
        .update({
          zoho_contact_id: vendor.zoho_contact_id,
          // Fill in the phone number from Zoho if the local record didn't have one.
          mobile: match.mobile ?? vendor.phone,
        })
        .eq('id', match.id)
        .select()
        .maybeSingle()

      if (updateError) {
        // Another request may have linked this contact at the same moment.
        const linkedNow = await findLinkedFarmer(vendor.zoho_contact_id)
        if (linkedNow) return linkedNow

        console.error('Failed to link existing local farmer to Zoho vendor:', updateError)
        return null
      }

      return updated as Farmer
    }
  }

  // No local match found: genuinely a new vendor, safe to insert.
  const { data: created, error } = await supabase
    .from('farmers')
    .insert({
      name: vendor.name,
      mobile: vendor.phone,
      zoho_contact_id: vendor.zoho_contact_id,
    })
    .select()
    .maybeSingle()

  if (error) {
    // Unique violation (23505): another request created it first, so use that one.
    const linkedNow = await findLinkedFarmer(vendor.zoho_contact_id)
    if (linkedNow) return linkedNow

    console.error('Failed to create local farmer from Zoho vendor:', error)
    return null
  }

  return created as Farmer
}