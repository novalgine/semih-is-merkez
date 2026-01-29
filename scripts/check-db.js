const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkTable() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.log("Error type:", error.code);
        console.log("Error message:", error.message);
        if (error.code === '42P01') {
            console.log("TABLE DOES NOT EXIST: daily_logs");
        }
    } else {
        console.log("Table 'daily_logs' exists and is accessible.");
    }
}

checkTable();
