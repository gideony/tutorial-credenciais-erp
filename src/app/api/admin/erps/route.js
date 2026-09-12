import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We create a helper to get the Admin Supabase client
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials (URL or Service Role Key).');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Ensure only authenticated admin requests reach here via basic auth middleware
export async function POST(request) {
  try {
    const formData = await request.formData();

    const action = formData.get('action');

    if (action === 'delete') {
      const name = formData.get('name');
      if (!name) return NextResponse.json({ error: 'Name is required for deletion' }, { status: 400 });

      const supabase = getAdminSupabase();
      const { error } = await supabase.from('erps').delete().eq('name', name);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    if (action === 'save') {
      const name = formData.get('name');
      const title = formData.get('title');
      const message = formData.get('message');
      const file = formData.get('file');
      const originalName = formData.get('originalName');
      const isUpdate = formData.get('isUpdate') === 'true';
      let imagePath = formData.get('currentImage') || null;

      const supabase = getAdminSupabase();

      // Handle file upload
      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `tutorials/${fileName}`;

        // Convert the File object to an ArrayBuffer, then Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, buffer, {
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
        imagePath = publicUrl;
      }

      const erpData = {
        name,
        title,
        message,
        image: imagePath,
      };

      let error;
      if (isUpdate) {
        const { error: updateErr } = await supabase.from("erps").update(erpData).eq("name", originalName);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase.from("erps").insert([erpData]);
        error = insertErr;
      }

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
