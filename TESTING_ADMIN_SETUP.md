# Guia de Teste - Sistema de Admin com user_roles

## ✅ Implementação Completa

O sistema foi configurado para:

1. **Verificar `user_roles` do banco**: O hook `useAuth()` agora busca as roles do usuário na tabela `public.user_roles` após login
2. **Expor propriedade `isAdmin`**: O hook retorna `isAdmin: userRole === "admin"` que pode ser usado em qualquer componente
3. **Redirecionar admins**: Usuários admin são redirecionados automaticamente para `/admin` após login
4. **Mostrar link no navbar**: Se o usuário é admin, um link "Admin" aparece no navbar e sidebar

## 🧪 Como Testar

### Passo 1: Criar um usuário de teste

Acesse o painel do Supabase em: https://app.supabase.com/

1. Entre no projeto `mlamcmbqmdegyhgvfthj`
2. Vá para **Authentication > Users**
3. Clique em **Add user** (ou use email + senha para criar via signup)
4. Crie um usuário com:
   - Email: `admin@test.local`
   - Password: `Admin@123456`

### Passo 2: Adicionar role 'admin' ao usuário

1. Vá para **SQL Editor** no Supabase
2. Execute o seguinte SQL, substituindo `USER_ID` pelo ID do usuário criado:

```sql
-- Copie o ID do usuário e substitua em UUID_AQUI
INSERT INTO public.user_roles (user_id, role)
VALUES ('UUID_AQUI', 'admin');
```

Para descobrir o UUID do usuário:
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@test.local';
```

### Passo 3: Testar o login

1. Acesse a aplicação em http://localhost:5173
2. Clique em "Login"
3. Entre com:
   - Email: `admin@test.local`
   - Password: `Admin@123456`
4. **Esperado**: Você será redirecionado automaticamente para `/admin`

### Passo 4: Verificar o painel admin

Na página `/admin`, você deve ver:
- ✅ Título "Painel Administrativo"
- ✅ Opções de configuração de precificação
- ✅ Gerenciamento de tracks

## 🔧 Alternativa: Usar página de setup

Se você preferir não acessar o painel Supabase:

1. Crie um usuário via **Sign Up** (isso pode gerar um link de confirmação por email)
2. Acesse `/admin-setup` (você será redirecionado aqui se tentar acessar `/admin` sem permissão)
3. O ID do seu usuário será exibido
4. Clique em "Usar ID do usuário atual"
5. Clique em "Adicionar Role Admin"

**Nota**: A página de setup só funciona se você conseguir confirmar o email do usuário no Supabase.

## 📝 Detalhes Técnicos

### Arquivos modificados:

- **`src/hooks/use-auth.ts`**: 
  - Adicionado `userRole` state
  - Adicionado `fetchUserRole()` para buscar roles da tabela `user_roles`
  - Novo retorno: `isAdmin`, `userRole`

- **`src/pages/AdminPage.tsx`**:
  - Atualizado para usar `isAdmin` do hook em vez de `app_metadata`
  - Validação mais robusta baseada no banco de dados

- **`src/App.tsx`**:
  - Modificado `AuthRedirect()` para redirecionar admins para `/admin`
  - Adicionado link "Admin" no navbar e sidebar (apenas visível se `isAdmin`)
  - Importado ícone `Shield` do lucide-react

- **`src/pages/AdminSetupPage.tsx`**: 
  - Nova página para facilitar o teste
  - Permite adicionar role admin manualmente
  - Mostra ID do usuário logado
  - Auto-redireciona para `/admin` após adicionar role

### Fluxo de autenticação:

```
Login → Obter sessão → Buscar user_roles → Armazenar isAdmin → 
  → Se admin → Redirecionar /admin
  → Se não admin → Redirecionar /profile
```

### RLS Policies (banco de dados):

As políticas de segurança já existem:
- Usuários só podem ver suas próprias roles
- Apenas admins podem inserir/atualizar/deletar roles
- Função `public.has_role(_user_id, _role)` valida roles no backend

## ❓ Troubleshooting

**Problema**: Faço login mas não sou redirecionado para `/admin`
- **Solução**: Verifique se existe um registro em `public.user_roles` com seu `user_id` e `role = 'admin'`

**Problema**: A página de admin diz "Acesso negado"
- **Solução**: Verifique novamente a tabela `user_roles` - o registro pode não ter sido criado corretamente

**Problema**: O link "Admin" não aparece no navbar
- **Solução**: Faça logout e login novamente, pois o `isAdmin` pode ser cache do login anterior

## ✨ Próximos passos (opcional)

Se quiser automatizar o teste:
1. Criar um endpoint no backend que permite criar usuários admin (com autenticação)
2. Ou usar a Supabase Admin API com a service role key
3. Ou criar um seed script que roda automaticamente no setup
