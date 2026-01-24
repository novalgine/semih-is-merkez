
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from './lib/supabase/client'

async function test() {
    const supabase = await createClient()

    console.log('Checking shoots table...')
    const { data: shoot, error: sError } = await supabase.from('shoots').select('*').limit(1).single()
    console.log('Shoot Sample:', { shoot, sError })
    if (shoot) console.log('Shoot keys:', Object.keys(shoot))

    console.log('Checking shoot_scenes table...')
    const { data: scene, error: scError } = await supabase.from('shoot_scenes').select('*').limit(1).single()
    console.log('Shoot Scene Sample:', { scene, scError })

    if (scError) {
        console.log('Error details:', scError.message, scError.details, scError.hint)
    }

    console.log('Checking deliverables table...')
    const { data: deliverables, error: dError } = await supabase.from('deliverables').select('count', { count: 'exact', head: true })
    console.log('Deliverables:', { deliverables, dError })

    console.log('Checking expenses table...')
    const { data: expenses, error: eError } = await supabase.from('expenses').select('count', { count: 'exact', head: true })
    console.log('Expenses:', { expenses, eError })

    console.log('Checking customers portal_token...')
    const { data: customer, error: cError } = await supabase.from('customers').select('portal_token').limit(1)
    console.log('Customer Token Sample:', { customer, cError })
}

test()
