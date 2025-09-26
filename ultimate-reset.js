import postgres from 'postgres';
import fs from 'fs';

async function ultimateReset() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('Connected to database');

    // Read and execute the complete reset
    const resetSQL = fs.readFileSync('complete-reset.sql', 'utf8');
    const statements = resetSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim());
        await sql.unsafe(statement);
      }
    }

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Reset failed:', error);
  } finally {
    await sql.end();
  }
}

ultimateReset();