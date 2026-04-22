const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_2eygO9YwfNHd@ep-gentle-sea-ammyigrp-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
sql`SELECT 1`.then(r => console.log('Success:', r)).catch(e => console.error('Error:', e.message));