import { NextRequest, NextResponse } from "next/server";
import {
    Account,
    Aptos,
    AptosConfig,
    Network,
    Ed25519PrivateKey,
    AccountAddress,
} from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

export async function POST(req: NextRequest) {
    try {
        const { recipient, amount } = await req.json();

        const privateKey = process.env.SPACESHIP_ADMIN_PRIVATEKEY;
        if (!privateKey) {
            return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
        }

        const admin = await Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(privateKey),
        });

        const txn = await aptos.transaction.build.simple({
        sender: admin.accountAddress,
        data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [AccountAddress.from(recipient), amount],
        },
        });

        const committedTxn = await aptos.signAndSubmitTransaction({
        signer: admin,
        transaction: txn,
        });

        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

        return NextResponse.json({ hash: committedTxn.hash });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}