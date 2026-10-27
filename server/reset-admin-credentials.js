import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'sernic_concurso.sqlite');

const db = new Database(dbPath);

console.log('🔄 Reiniciando credenciais do admin...\n');

// Atualizar ou criar o usuário admin com novas credenciais
const adminNuit = '123922328';
const adminPassword = 'buenaverte7';
const adminName = 'Direcção de Recursos Humanos - SERNIC';
const adminEmail = 'drh@sernic.gov.mz';

// Verificar se o admin existe
const existingAdmin = db.prepare("SELECT id FROM users WHERE nuit = ? OR role = 'admin' LIMIT 1").get(adminNuit);

if (existingAdmin) {
  // Atualizar admin existente
  const update = db.prepare(`
    UPDATE users
    SET nuit = ?, name = ?, password = ?, email = ?, role = 'admin'
    WHERE id = ?
  `);

  update.run(
    adminNuit,
    adminName,
    bcrypt.hashSync(adminPassword, 10),
    adminEmail,
    existingAdmin.id
  );

  console.log('✅ Admin atualizado com sucesso!\n');
} else {
  // Criar novo admin se não existir
  const insert = db.prepare(`
    INSERT INTO users (nuit, name, password, email, role)
    VALUES (?, ?, ?, ?, 'admin')
  `);

  insert.run(
    adminNuit,
    adminName,
    bcrypt.hashSync(adminPassword, 10),
    adminEmail
  );

  console.log('✅ Admin criado com sucesso!\n');
}

// Exibir informações do admin
const admin = db.prepare("SELECT id, nuit, name, email, role FROM users WHERE nuit = ?").get(adminNuit);

if (admin) {
  console.log('📋 Credenciais do Admin:');
  console.log('─'.repeat(50));
  console.log(`ID:        ${admin.id}`);
  console.log(`Login:     ${admin.nuit}`);
  console.log(`Nome:      ${admin.name}`);
  console.log(`Email:     ${admin.email}`);
  console.log(`Função:    ${admin.role}`);
  console.log('─'.repeat(50));
  console.log(`\n🔑 Login:    123922328`);
  console.log(`🔐 Senha:    buenaverte7\n`);
} else {
  console.log('❌ Erro ao verificar as credenciais do admin.');
  process.exit(1);
}

db.close();
console.log('✨ Credenciais do admin reiniciadas com sucesso!');
