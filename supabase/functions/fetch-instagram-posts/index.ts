import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const IG_ACCESS_TOKEN = Deno.env.get('IG_ACCESS_TOKEN')!;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !IG_ACCESS_TOKEN) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Missing env vars' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch from Instagram Graph API
    const igResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${IG_ACCESS_TOKEN}`);
    const igData = await igResponse.json();

    if (igData.error) {
      console.error('IG API Error:', igData.error);
      return new Response(JSON.stringify({ error: igData.error }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const posts = igData.data || [];
    let insertedCount = 0;

    for (const post of posts) {
      // Check if already exists in DB
      const { data: existing, error: searchError } = await supabase
        .from('news')
        .select('id')
        .eq('source', 'instagram')
        .eq('source_post_id', post.id)
        .maybeSingle();

      if (!existing && !searchError) {
        // Prepare content
        const caption = post.caption || '';
        let title = caption.length > 80 ? caption.substring(0, 80) + '...' : caption;
        if (!title) title = 'Postingan Instagram';
        
        // Generate a simple unique slug
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 40);
        const slug = `${baseSlug || 'ig-post'}-${post.id.substring(0, 6)}`;

        // Convert newlines to HTML breaks for simple rendering
        const content = caption ? caption.replace(/\n/g, '<br/>') : 'Tidak ada deskripsi.';

        // Insert new post as draft
        const { error: insertError } = await supabase.from('news').insert({
          title: title,
          slug: slug,
          content: content,
          cover_image_url: post.media_url || null,
          category: 'Media Sosial',
          author_name: 'Admin Media Sosial',
          status: 'draft', // Must be draft for review
          source: 'instagram',
          source_url: post.permalink,
          source_post_id: post.id
        });

        if (insertError) {
          console.error(`Error inserting post ${post.id}:`, insertError);
        } else {
          insertedCount++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, fetched: posts.length, inserted: insertedCount }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Internal Function Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
