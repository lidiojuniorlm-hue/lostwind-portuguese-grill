import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller using the anon client with their auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Use anon client with user's auth context to validate token
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

    // Admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // LIST USERS
    if (action === "list") {
      const { data: authUsers, error: listErr } =
        await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) throw listErr;

      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role, store");

      const rolesMap: Record<string, { role: string; store: string | null }> = {};
      (roles || []).forEach((r: any) => {
        rolesMap[r.user_id] = { role: r.role, store: r.store };
      });

      const users = authUsers.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.email,
        role: rolesMap[u.id]?.role || "funcionario",
        store: rolesMap[u.id]?.store || null,
        created_at: u.created_at,
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE USER
    if (action === "create") {
      const { email, password, name, role, store } = body;
      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: "email, password, name required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: newUser, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name },
        });
      if (createErr) throw createErr;

      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: role || "funcionario",
          store: store || null,
        });
      if (roleErr) throw roleErr;

      return new Response(
        JSON.stringify({
          user: {
            id: newUser.user.id,
            email,
            name,
            role: role || "funcionario",
            store: store || null,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // UPDATE USER
    if (action === "update") {
      const { userId, email, password, name, role, store } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (name) updateData.user_metadata = { full_name: name };

      if (Object.keys(updateData).length > 0) {
        const { error: updateErr } =
          await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
        if (updateErr) throw updateErr;
      }

      if (role) {
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert(
            { user_id: userId, role, store: store ?? null },
            { onConflict: "user_id" }
          );
        if (roleErr) {
          await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", userId);
          await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: userId, role, store: store ?? null });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE USER
    if (action === "delete") {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (userId === callerId) {
        return new Response(
          JSON.stringify({ error: "Cannot delete yourself" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      const { error: delErr } =
        await supabaseAdmin.auth.admin.deleteUser(userId);
      if (delErr) throw delErr;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
