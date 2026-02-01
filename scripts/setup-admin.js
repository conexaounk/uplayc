/**
 * Script para criar um usuário admin de teste no Supabase
 * 
 * Modo de uso (dentro do container):
 * node scripts/setup-admin.js <email> <password>
 * 
 * Exemplo:
 * node scripts/setup-admin.js admin@test.com password123
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Erro: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não estão definidos"
  );
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Uso: node scripts/setup-admin.js <email> <password>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdminUser() {
  try {
    console.log(`Criando usuário admin: ${email}`);

    // Criar usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("Erro ao criar usuário:", error.message);
      process.exit(1);
    }

    const userId = data.user.id;
    console.log(`Usuário criado com ID: ${userId}`);

    // Adicionar role admin
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) {
      console.error("Erro ao adicionar role admin:", roleError.message);
      process.exit(1);
    }

    console.log("✅ Usuário admin criado com sucesso!");
    console.log(`Email: ${email}`);
    console.log(`ID: ${userId}`);
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }
}

createAdminUser();
