import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL as string, {ssl : "require"});

async function initUuid(){
    await sql`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `
}

async function roles(){
    await sql`
        CREATE TABLE IF NOT EXISTS roles(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            label VARCHAR(255) NOT NULL
        );
    `
}

async function basket(){
    await sql`
        CREATE TABLE IF NOT EXISTS basket(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMPTZ DEFAULT now()
        )
    `
}

async function users(){
    await sql`
        CREATE TABLE IF NOT EXISTS users(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            firstname VARCHAR(255) NOT NULL,
            lastname VARCHAR(255) NOT NULL,
            birthday DATE NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(255) NOT NULL,
            password  VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            roles_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
            basket_id UUID REFERENCES basket(id) ON DELETE SET NULL
        );
    `
}

async function address(){
    await sql`
        CREATE TABLE IF NOT EXISTS address(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            street VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            zip_code VARCHAR(255) NOT NULL,
            country VARCHAR(255) NOT NULL,
            users_id UUID NOT NULL REFERENCES users(id)
        );
    `
}

async function orders(){
    await sql`
        CREATE TABLE IF NOT EXISTS orders(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_date DATE NOT NULL,
            order_status VARCHAR(255) NOT NULL,
            TVA NUMERIC(10,2) NOT NULL,
            total_price NUMERIC(10,2) NOT NULL,
            address_id UUID NOT NULL REFERENCES address(id),
            users_id UUID NOT NULL REFERENCES users(id)
        );
    `
}

async function categories(){
    await sql`
        CREATE TABLE IF NOT EXISTS categories(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            label VARCHAR(255) NOT NULL
        );
    `
}

async function articles(){
    await sql`
        CREATE TABLE IF NOT EXISTS articles(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            label VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC(10,2) NOT NULL,
            size VARCHAR(255) NOT NULL,
            color VARCHAR(255) NOT NULL,
            stock INT NOT NULL,
            categories_id UUID NOT NULL REFERENCES categories(id)
        );
    `
}

async function articles_basket(){
    await sql`
        CREATE TABLE IF NOT EXISTS articles_basket(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quantity INT NOT NULL,
            basket_id UUID NOT NULL REFERENCES basket(id),
            article_id UUID NOT NULL REFERENCES articles(id)
        );
    `
}

async function articles_order(){
    await sql`
        CREATE TABLE IF NOT EXISTS articles_order(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quantity INT NOT NULL,
            price_at_purchase NUMERIC(10,2) NOT NULL,
            article_id UUID NOT NULL REFERENCES articles(id),
            order_id UUID NOT NULL REFERENCES orders(id)
        )
    `
}

export async function GET(){
    try {
        await sql.begin(async () => {
            await initUuid();
            await roles();
            await basket();
            await users();
            await adress();
            await orders();
            await categories();
            await articles();
            await articles_basket();
            await articles_order();
        });

        return Response.json({message : "DB mise à jour"})
    }catch(error){
        return Response.json({error})
    }
}