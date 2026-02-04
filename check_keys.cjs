const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hchgaovzebymnusfhdug.supabase.co';
const supabaseAnonKey = 'sb_publishable_T-nwxoyjrDOvSdUO5sLthw_cBUKVEpH';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndAddColumn() {
    console.log('Checking categories table...');
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }

    const sample = data[0];
    if (sample && sample.hasOwnProperty('order')) {
        console.log('Column "order" already exists.');
    } else {
        console.log('Column "order" might be missing. Attempting to add it via a dummy insert if possible, or just informing that we need it.');
        // In Supabase, we can't easily ALTER TABLE via JS client unless we have a RPC function.
        // Let's try to fetch all categories and see their keys.
        console.log('Keys in categories:', Object.keys(sample || {}));
    }
}

checkAndAddColumn();
