import { NextResponse } from "next/server";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

export async function GET() {
    try {
        const privateKey = process.env.SPACESHIP_ADMIN_PRIVATEKEY;
        if (!privateKey) {
            return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
        }

        const admin = await Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(privateKey),
        });

        return NextResponse.json({ address: admin.accountAddress.toString() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}