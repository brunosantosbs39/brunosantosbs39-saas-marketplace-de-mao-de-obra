import {NextResponse} from "next/server";export async function GET(){return NextResponse.json({conectado:Boolean(process.env.DATABASE_URL)})}
