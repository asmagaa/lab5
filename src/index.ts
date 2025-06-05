import { Client } from 'pg';
import * as readline from 'readline';

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'baza_danych',
    user: 'user',
    password: 'sigma'
};

class DatabaseApp {
    private client: Client;
    private rl: readline.Interface;

    constructor() {
        this.client = new Client(dbConfig);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        await this.client.connect();
        this.mainMenu();
    }

    mainMenu() {
        console.log('\nMenu:');
        console.log('1. Zapytanie skalarne');
        console.log('2. Zapytanie z wieloma złączeniami (JOIN)');
        console.log('3. Zapytanie z wyrażeniem tabelarnym (CTE) i funkcjami okna');
        console.log('4. Zapytanie do metadanych');
        console.log('5. Funkcja skalarna');
        console.log('6. Funkcja tabelarna');
        console.log('7. Procedura składowana');
        console.log('8. Funkcja systemowa/Procedura systemowa');
        console.log('9. Tabela odpowiadająca tematyce bazy danych');
        console.log('10. Wstawienie danych do utworzonej tabeli za pomocą instrukcji INSERT/COPY');
        this.rl.question('Wybierz zadanie (1-10, q do przerwania programu): ', async (answer: string) => {
            switch (answer) {
                case '1': await this.jeden(); break;
                case '2': await this.dwa(); break;
                case '3': await this.trzy(); break;
                case '4': await this.cztery(); break;
                case '5': await this.piec(); break;
                case '6': await this.szesc(); break;
                case '7': await this.siedem(); break;
                case '8': await this.osiem(); break;
                case '9': await this.dziewiec(); break;
                case '10': await this.dziesiec(); break;
                case 'q': await this.exit(); return;
                default: console.log('Złe zadanie.');
            }
            this.mainMenu();
        });
    }

    async jeden() {
        const res = await this.client.query('SELECT COUNT(*) FROM liczby');
        console.log('Scalar result:', res.rows[0].count);
    }

    async dwa() {
        const res = await this.client.query(`
            SELECT a.id, a.name, b.value
            FROM table_a a
            JOIN table_b b ON a.id = b.a_id
            JOIN table_c c ON b.c_id = c.id
            LIMIT 5
        `);
        console.table(res.rows);
    }

    async trzy() {
        const res = await this.client.query(`
            WITH ranked AS (
                SELECT id, value, ROW_NUMBER() OVER (ORDER BY value DESC) as rn
                FROM liczby
            )
            SELECT * FROM ranked WHERE rn <= 5
        `);
        console.table(res.rows);
    }

    async cztery() {
        const res = await this.client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
        console.table(res.rows);
    }

    async piec() {
        const res = await this.client.query('SELECT my_scalar_function(42) AS result');
        console.log('Function result:', res.rows[0].result);
    }

    async szesc() {
        const res = await this.client.query('SELECT * FROM my_table_function(5)');
        console.table(res.rows);
    }

    async siedem() {
        await this.client.query('CALL my_stored_procedure(123)');
        console.log('Stored procedure called.');
    }

    async osiem() {
        const res = await this.client.query('SELECT version()');
        console.log('System function result:', res.rows[0].version);
    }

    async dziewiec() {
        await this.client.query(`
            CREATE TABLE IF NOT EXISTS my_topic_table (
                id SERIAL PRIMARY KEY,
                name TEXT,
                value INTEGER
            )
        `);
        console.log('Tabela utworzona lub już istnieje.');
    }

    async dziesiec() {
        await this.client.query(`
            INSERT INTO my_topic_table (name, value) VALUES ('example', 123)
        `);
        console.log('Dane wprowadzono do tabeli.');
    }

    async exit() {
        await this.client.end();
        this.rl.close();
        console.log('Rozłączono z bazą danych.');
    }
}

const app = new DatabaseApp();
app.start();