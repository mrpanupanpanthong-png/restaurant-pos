import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hchgaovzebymnusfhdug.supabase.co';
const supabaseAnonKey = 'sb_publishable_T-nwxoyjrDOvSdUO5sLthw_cBUKVEpH';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCategories() {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Categories sample:', JSON.stringify(data, null, 2));
    }
}

checkCategories();
