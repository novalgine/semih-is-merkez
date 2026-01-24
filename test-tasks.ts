
import { createClient } from "@/lib/supabase/client"
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testTasks() {
    console.log('--- Task Board Test Başlıyor ---')
    const supabase = await createClient()

    // 1. Create Task
    const { data: task, error: createError } = await supabase
        .from('tasks')
        .insert({
            content: 'Test Görevi',
            is_completed: false,
            assigned_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

    if (createError) {
        console.error('Create Error:', createError)
        return
    }
    console.log('Görev Oluşturuldu:', task.id)

    // 2. Update Task (Move to Backlog)
    const { error: updateError } = await supabase
        .from('tasks')
        .update({ assigned_date: null })
        .eq('id', task.id)

    if (updateError) {
        console.error('Update Error:', updateError)
    } else {
        console.log('Görev Backlog\'a taşındı.')
    }

    // 3. Delete Task
    const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

    if (deleteError) {
        console.error('Delete Error:', deleteError)
    } else {
        console.log('Görev Silindi.')
    }

    console.log('--- Test Bitti ---')
}

testTasks()
