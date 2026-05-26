"use client";
import {
    useWallet,
    InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import {
    AccountAddress,
    Aptos,
    AptosConfig,
    Network,
} from "@aptos-labs/ts-sdk";
import { FC, ReactNode, useState, useContext, createContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { AlertProvider, useAlert } from "../provider/AlertProvider";
import { AutoConnectProvider } from "../provider/AutoConnectProvider";
import { WalletContext } from "./WalletContext";
import { UserContextProvider } from "./UserContext";
import { Ship } from "../Ship";
import items from "../utils/items";

const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS;

const theme = createTheme({
    palette: {
        primary: { main: "#000000" },
        secondary: { main: "#FFFFFF" },
    },
});

export interface CollectedItem {
    id: number;
    name: string;
    image: HTMLImageElement;
    rarity: string;
    collected: boolean;
}

export interface Items {
    name: string;
    address: string;
}

interface ListedItem {
    name?: string;
    image?: string;
    attributes?: any;
    price?: number;
    listingObjectAddress?: string;
    nftAddress?: string;
    sellerAddress?: string;
}

interface AppContextState {
    aptos: any;
    adminAddress: string | null;
    mySpaceships: Ship[];
    myItems: any[];
    ownedItems: any[];
    myBalance: number;
    myStats: any;
    allUserStats: any[];
    itemsCollectionAddress: any;
    listedNfts: any[];
    allSellers: any[];
    myRank: number;
    setMyRank: (rank: number) => void;
    fetchAdminAddress: () => Promise<string | null>;
    fetchBalance: (accountAddress: AccountAddress, versionToWaitFor?: bigint) => void;
    fundWallet: (address: AccountAddress) => void;
    transferAPT: (accountAddress: AccountAddress, recipient: AccountAddress, amount: number) => Promise<string>;
    transferAPTBack: (recipient: AccountAddress, amount: number) => Promise<string>; // admin dihapus dari param
    handleMint: (adminAddress: string, account: AccountAddress, amount: number, ship: Ship) => Promise<string>;
    handleMintItems: (adminAddress: string, account: AccountAddress, item: CollectedItem) => Promise<string>;
    setMyBalance: (myBalance: number) => void;
    fetchSpaceships: (adminAddress: string, account: AccountAddress, shipName: string) => void;
    handleNewGameSession: (adminAddress: string, account: AccountAddress, score: number, spaceship: string) => Promise<string>;
    fetchUserStats: (adminAddress: string, account: AccountAddress) => void;
    fetchItemsCollectionAddress: (adminAddress: string) => void;
    getUserOwnedItems: (ownerAddr: string) => Promise<any>;
    getItem: (itemObjectAddress: string, itemName: string) => void;
    handleListItem: (adminAddress: string, account: AccountAddress, item: any, price: string) => Promise<string>;
    getAllItems: () => void;
    getAllSellers: (adminAddress: string) => void;
    getAllListedNfts: () => void;
    handlePurchaseItem: (adminAddress: string, account: AccountAddress, item: any) => Promise<string>;
    fetchAllUserStats: (adminAddress: string) => void;
}

export const AppContexts = createContext<AppContextState | undefined>(undefined);

export function useAppContext(): AppContextState {
    const context = useContext(AppContexts);
    if (!context)
        throw new Error("useAppContext must be used within an AppContextProvider");
    return context;
}

const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [adminAddress, setAdminAddress] = useState<string | null>(null);
    const APT = "0x1::aptos_coin::AptosCoin";
    const APT_UNIT = 100_000_000;
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const { signAndSubmitTransaction } = useWallet();
    const {
        setSuccessAlertMessage,
        setErrorAlertMessage,
        setLoadingAlertMessage,
        setLoadingUpdateAlertMessage,
    } = useAlert();

    const [myBalance, setMyBalance] = useState<number>(0);
    const [mySpaceships, setMyspaceships] = useState<Ship[]>([]);
    const [myItems, setMyItems] = useState<any[]>([]);
    const [myStats, setMyStats] = useState<any>({});
    const [allUserStats, setAllUserStats] = useState<any[]>([]);
    const [myRank, setMyRank] = useState<number>(0);
    const [ownedItems, setOwnedItems] = useState<any[]>([]);
    const [itemsCollectionAddress, setItemsCollectionAddress] = useState<any>();
    const [allSellers, setAllSellers] = useState<any[]>([]);
    const [listedNfts, setListedNfts] = useState<any[]>([]);

    const fetchAdminAddress = async (): Promise<string | null> => {
        try {
            const res = await fetch("/api/admin/account-address");
            if (!res.ok) throw new Error("Failed to fetch admin address");
            const data = await res.json();
            setAdminAddress(data.address);
            return data.address;
        } catch (error: any) {
            console.error("Failed to fetch admin address:", error.message);
            return null;
        }
    };

    const handleMint = async (
        adminAddr: string,
        account: AccountAddress,
        amountToTransfer: number,
        ship: Ship
    ): Promise<string> => {
        const id = setLoadingAlertMessage("Please wait. Minting Spaceship...");

        try {
            const txnTransfer = await transferAPT(account, AccountAddress.from(adminAddr), amountToTransfer);
            if (txnTransfer === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to transfer coin. Please try again later", "error");
                return "Error";
            }

            const txnMint = await mintSpaceship(id, adminAddr, account, ship);
            if (txnMint === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to purchase spaceship. Please try again later", "error");
                await transferAPTBack(account, amountToTransfer);
                await fetchBalance(account);
                return "Error";
            }

            await fetchSpaceships(adminAddr, account, ship.name);
            await fetchBalance(account);
            return txnMint;
        } catch {
            setLoadingUpdateAlertMessage(id, "Failed to swap coin. Please try again later", "error");
            return "Error";
        }
    };

    const mintSpaceship = async (
        id: any,
        adminAddr: string,
        account: AccountAddress,
        ship: Ship
    ): Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                function: `${adminAddr}::main::create_Spaceship`,
                typeArguments: [],
                functionArguments: [
                    ship.name, ship.image, ship.icon, ship.hp,
                    ship.energyRegen, ship.maxEnergy, ship.laserWidth,
                    ship.laserDamage, ship.laserColor, ship.bullet,
                    ship.width, ship.height, ship.maxFrame,
                ],
                },
            });

            await aptos.waitForTransaction({ transactionHash: response.hash });
            setLoadingUpdateAlertMessage(id, `Successfully purchased ${ship.name}! Hash: ${response.hash}`, "success");
            return response.hash;
        } catch {
            return "Error";
        }
    };

    const handleMintItems = async (
        adminAddr: string,
        account: AccountAddress,
        item: CollectedItem
    ): Promise<string> => {
        const id = setLoadingAlertMessage("Please wait. Minting Item...");

        try {
            const txnMint = await mintItems(id, adminAddr, account, item);
            if (txnMint === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to mint item. Please try again later", "error");
                return "Error";
            }
            return txnMint;
        } catch {
            setLoadingUpdateAlertMessage(id, "Failed to mint item. Please try again later", "error");
            return "Error";
        }
    };

    const mintItems = async (
        id: any,
        adminAddr: string,
        account: AccountAddress,
        item: CollectedItem
    ): Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                function: `${adminAddr}::itemsv4::create_item`,
                typeArguments: [],
                functionArguments: [item.name, item.image.src as string, item.rarity],
                },
            });

            await aptos.waitForTransaction({ transactionHash: response.hash });
            setLoadingUpdateAlertMessage(id, `Successfully minted ${item.name}! Hash: ${response.hash}`, "success");
            return response.hash;
        } catch {
            return "Error";
        }
    };

    const fetchSpaceships = async (
        adminAddr: string,
        account: AccountAddress,
        shipName: string
    ) => {
        const hasSpaceships = await aptos.view({
            payload: {
                function: `${adminAddr}::main::has_spaceship`,
                functionArguments: [account, shipName],
            },
        });

        if (!hasSpaceships) return;

        try {
            const response = await aptos.view({
                payload: {
                function: `${adminAddr}::main::get_spaceship`,
                functionArguments: [account, shipName],
                },
            });

            const [name, image, icon, attributes] = response;
            const nameString = name as string;
            const typeAttributes = attributes as {
                hp: number; energyRegen: number; maxEnergy: number;
                laserWidth: number; laserDamage: number; laserColor: string;
                bullet: number; width: number; height: number; maxFrame: number;
            };

            setMyspaceships((prev) => {
                if (prev.some((ship) => ship.name === nameString)) return prev;
                return [...prev, {
                name: nameString, image: image as string, icon: icon as string,
                hp: typeAttributes.hp, energyRegen: typeAttributes.energyRegen,
                maxEnergy: typeAttributes.maxEnergy, laserWidth: typeAttributes.laserWidth,
                laserDamage: typeAttributes.laserDamage, laserColor: typeAttributes.laserColor,
                bullet: typeAttributes.bullet, width: typeAttributes.width,
                height: typeAttributes.height, maxFrame: typeAttributes.maxFrame, price: 0,
                }];
            });
        } catch {
            console.error("Ships not found");
        }
    };

    const fetchItemsCollectionAddress = async (adminAddr: string) => {
        try {
            const response = await aptos.view({
                payload: {
                function: `${adminAddr}::itemsv4::get_items_collection_address`,
                functionArguments: [],
                },
            });
            setItemsCollectionAddress(response);
        } catch {
            console.error("Items Collection Address not found");
        }
    };

    const getUserOwnedItems = async (ownerAddr: string) => {
        const result = await aptos.getAccountOwnedTokensFromCollectionAddress({
            accountAddress: ownerAddr,
            collectionAddress: COLLECTION_ID as string,
        });
        setMyItems(result);
    };

    const getItem = async (itemObjectAddress: string, itemName: string) => {
        try {
            const response = await aptos.view({
                payload: {
                function: `${adminAddress}::itemsv4::get_item`,
                typeArguments: [],
                functionArguments: [itemObjectAddress],
                },
            });

            const [name, attributes] = response;
            const typeAttributes = attributes as { image: string; rarity: string };

            setOwnedItems((prev) => {
                if (prev.some((item) => item.name === name)) return prev;
                return [...prev, {
                itemObjectAddress,
                name: name as string,
                image: typeAttributes.image,
                rarity: typeAttributes.rarity,
                }];
            });
        } catch (error) {
            console.error("Error fetching item:", error instanceof Error ? error.message : error);
        }
    };

    const handleListItem = async (
        adminAddr: string,
        account: AccountAddress,
        item: any,
        price: string
    ): Promise<string> => {
        const id = setLoadingAlertMessage("Please wait. Listing Item...");

        const refresh = async () => {
            await getUserOwnedItems(account.toString());
            await getAllListedNfts();
            await getItem(item.itemObjectAddress, item.name);
        };

        try {
            const txnList = await listItem(id, adminAddr, account, item, price);
            if (txnList === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to list item. Please try again later", "error");
                await refresh();
                return "Error";
            }
            await refresh();
            return txnList;
        } catch {
            setLoadingUpdateAlertMessage(id, "Failed to list item. Please try again later", "error");
            await refresh();
            return "Error";
        }
    };

    const listItem = async (
        id: any,
        adminAddr: string,
        account: AccountAddress,
        item: any,
        price: string
    ): Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                function: `${adminAddr}::list_and_purchasev2::list_with_fixed_price`,
                typeArguments: [APT],
                functionArguments: [item.itemObjectAddress, item.name, parseFloat(price) * APT_UNIT],
                },
            });

            await aptos.waitForTransaction({ transactionHash: response.hash });
            setLoadingUpdateAlertMessage(id, `Successfully Listed ${item.name}!`, "success");
            await getAllListedNfts();
            return response.hash;
        } catch {
            await getAllListedNfts();
            return "Error";
        }
    };

    const getAllItems = async () => {
        const result: { current_token_datas_v2: Items[] } = await aptos.queryIndexer({
            query: {
                query: `
                query MyQuery($collectionId: String) {
                    current_token_datas_v2(where: {collection_id: {_eq: $collectionId}}) {
                    name: token_name
                    address: token_data_id
                    }
                }
                `,
                variables: { collectionId: COLLECTION_ID },
            },
        });
    };

    const getAllSellers = async (adminAddr: string) => {
        const allSellersData: [string[]] = await aptos.view({
            payload: {
                function: `${adminAddr}::list_and_purchasev2::get_sellers`,
                typeArguments: [],
                functionArguments: [],
            },
        });
        setAllSellers(allSellersData[0]);
    };

    const getAllListingObjectAddresses = async (sellerAddr: string): Promise<string[]> => {
        const allListings: [string[]] = await aptos.view({
            payload: {
                function: `${adminAddress}::list_and_purchasev2::get_seller_listings`,
                typeArguments: [],
                functionArguments: [sellerAddr],
            },
        });
        return allListings[0];
    };

    const getListingObjectAndSeller = async (
        listingObjectAddr: string
    ): Promise<[string, string, string]> => {
        const res = await aptos.view({
            payload: {
                function: `${adminAddress}::list_and_purchasev2::listing`,
                typeArguments: [],
                functionArguments: [listingObjectAddr],
            },
        });
        return [
            (res[0] as any)["inner"] as string,
            res[1] as string,
            res[2] as string,
        ];
    };

    const getListingObjectPrice = async (listingObjectAddr: string): Promise<number> => {
        const res = await aptos.view({
            payload: {
                function: `${adminAddress}::list_and_purchasev2::price`,
                typeArguments: [APT],
                functionArguments: [listingObjectAddr],
            },
        });
        return ((res[0] as any)["vec"] as number) / APT_UNIT;
    };

    const getAllListedNfts = async () => {
        if (!allSellers) return;

        const listedItems: ListedItem[] = [];
        const ownedItemNames = new Set(ownedItems.map((item) => item.name));
        const processedItems = new Set<string>();
        const rarityOrder: Record<string, number> = {
            Legendary: 5, Epic: 4, Rare: 3, Uncommon: 2, Common: 1,
        };

        await Promise.all(
        allSellers.map(async (seller) => {
            try {
                const listingObjectAddresses = await getAllListingObjectAddresses(seller);
                if (!listingObjectAddresses) return;

                await Promise.all(
                    listingObjectAddresses.map(async (listingObjectAddress) => {
                        try {
                            const [nftAddress, name, sellerAddress] = await getListingObjectAndSeller(listingObjectAddress);
                            const price = await getListingObjectPrice(listingObjectAddress);
                            const itemDetails = items.find((item: any) => item.name === name);
                            if (!itemDetails) return;

                            const { image, rarity } = itemDetails;

                            if (!ownedItemNames.has(name) && !processedItems.has(listingObjectAddress)) {
                                listedItems.push({ name, image, attributes: rarity, price, listingObjectAddress, nftAddress, sellerAddress });
                                processedItems.add(listingObjectAddress);
                            }
                        } catch (error) {
                            console.error("Error processing listing:", error);
                        }
                    })
                );
            } catch (error) {
                console.error("Error processing seller:", seller, error);
            }
        })
        );

        const sorted = listedItems.sort((a, b) => {
            const rarityDiff =
                (rarityOrder[b.attributes as string] || 0) -
                (rarityOrder[a.attributes as string] || 0);
            return rarityDiff !== 0 ? rarityDiff : Number(b.price) - Number(a.price);
        });

        setListedNfts(sorted);
    };

    const handlePurchaseItem = async (
        adminAddr: string,
        account: AccountAddress,
        item: any
    ): Promise<string> => {
        const id = setLoadingAlertMessage("Please wait. Purchasing Item...");

        const refresh = async () => {
            await getUserOwnedItems(account.toString());
            await getAllListedNfts();
            await getItem(item.itemObjectAddress, item.name);
        };

        try {
            const txnPurchase = await purchaseListedItem(id, adminAddr, account, item);
            if (txnPurchase === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to purchase item. Please try again later", "error");
                await refresh();
                return "Error";
            }
            await refresh();
            return txnPurchase;
        } catch {
            setLoadingUpdateAlertMessage(id, "Failed to purchase item. Please try again later", "error");
            await refresh();
            return "Error";
        }
    };

    const purchaseListedItem = async (
        id: any,
        adminAddr: string,
        account: AccountAddress,
        item: ListedItem
    ): Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                function: `${adminAddr}::list_and_purchasev2::purchase`,
                typeArguments: [APT],
                functionArguments: [item.listingObjectAddress, item.name],
                },
            });

            await aptos.waitForTransaction({ transactionHash: response.hash });
            setLoadingUpdateAlertMessage(id, `Successfully Purchased ${item.name}!`, "success");
            await getAllListedNfts();
            await getUserOwnedItems(account.toString());
            return response.hash;
        } catch (error) {
            console.error(error);
            await getAllListedNfts();
            return "Error";
        }
    };

    const handleNewGameSession = async (
        adminAddr: string,
        account: AccountAddress,
        score: number,
        spaceship: string
    ): Promise<string> => {
        const id = setLoadingAlertMessage("Please wait. Submitting New Game Session...");

        try {
            const txn = await fetchNewGameSession(id, adminAddr, account, score, spaceship);
            if (txn === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to submit new game session. Please try again later", "error");
                return "Error";
            }
            await fetchUserStats(adminAddr, account);
            return txn;
        } catch {
            setLoadingUpdateAlertMessage(id, "Failed to submit new game session. Please try again later", "error");
            return "Error";
        }
    };

    const fetchNewGameSession = async (
        id: any,
        adminAddr: string,
        account: AccountAddress,
        score: number,
        spaceship: string
    ): Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                function: `${adminAddr}::aptos_invaderv2::save_game_session`,
                typeArguments: [],
                functionArguments: [score, spaceship],
                },
            });

            await aptos.waitForTransaction({ transactionHash: response.hash });
            setLoadingUpdateAlertMessage(id, "Successfully submitted new game session", "success");
            return response.hash;
        } catch {
            return "Error";
        }
    };

    const fetchUserStats = async (adminAddr: string, account: AccountAddress) => {
        try {
            const response = await aptos.view({
                payload: {
                function: `${adminAddr}::aptos_invaderv2::get_user_stats`,
                functionArguments: [account],
                },
            });
            setMyStats(response);
        } catch {
            console.error("Stats not found");
        }
    };

    const fetchAllUserStats = async (adminAddr: string) => {
        try {
            const response = await aptos.view({
                payload: {
                function: `${adminAddr}::aptos_invaderv2::get_all_user_stats`,
                functionArguments: [],
                },
            });

            const sorted = (response[0] as any[]).sort(
                (a, b) => (b.best_score ?? 0) - (a.best_score ?? 0)
            );
            setAllUserStats(sorted);
        } catch {
            console.error("Stats not found");
        }
    };

    const fetchBalance = async (
        accountAddress: AccountAddress,
        versionToWaitFor?: bigint
    ) => {
        try {
            const amount = await aptos.getAccountAPTAmount({
                accountAddress,
                minimumLedgerVersion: versionToWaitFor,
            });
            setMyBalance(amount / 100_000_000);
        } catch (error: any) {
            setErrorAlertMessage(error.message);
        }
    };

    const fundWallet = async (address: AccountAddress) => {
        const id = setLoadingAlertMessage("Please wait. Funding wallet...");
        try {
            await aptos.fundAccount({ accountAddress: address, amount: 100_000_000 });
            await fetchBalance(address);
            const shortAddr = `0x${address.toString().substring(2, 6)}...${address.toString().slice(-5)}`;
            setLoadingUpdateAlertMessage(id, `Successful to fund wallet to ${shortAddr}`, "success");
        } catch (error: any) {
            setLoadingUpdateAlertMessage(id, error.message, "error");
        }
    };

    const transferAPT = async (
        accountAddress: AccountAddress,
        recipient: AccountAddress,
        amount: number
    ): Promise<string> => {
        const transaction: InputTransactionData = {
            data: {
                function: "0x1::coin::transfer",
                typeArguments: ["0x1::aptos_coin::AptosCoin"],
                functionArguments: [recipient.toStringLong(), amount],
            },
        };

        const id = setLoadingAlertMessage("Please accept transaction in your mobile wallet");

        try {
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: response.hash });
            setLoadingUpdateAlertMessage(id, `Transaction Confirmed with hash: ${response.hash}`, "success");
            await fetchBalance(accountAddress);
            return response.hash;
        } catch {
            setLoadingUpdateAlertMessage(id, "Transaction failed. Please try again later", "error");
            return "Error";
        }
    };

    const transferAPTBack = async (
        recipient: AccountAddress,
        amount: number
    ): Promise<string> => {
        try {
            const res = await fetch("/api/admin/transfer-back", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient: recipient.toString(),
                    amount,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                setErrorAlertMessage(err.error ?? "Transfer back failed");
                return "Error";
            }

            const data = await res.json();
            setSuccessAlertMessage(`Successful to return your APT with hash ${data.hash}`);
            return data.hash;
        } catch (error: any) {
            setErrorAlertMessage(error.message);
            return "Error";
        }
    };

    return (
        <ThemeProvider theme={theme}>
        <AppContexts.Provider
            value={{
            aptos,
            adminAddress,
            mySpaceships,
            myItems,
            ownedItems,
            myBalance,
            myStats,
            allUserStats,
            itemsCollectionAddress,
            listedNfts,
            allSellers,
            myRank,
            setMyRank,
            fetchAdminAddress,
            fetchBalance,
            fundWallet,
            transferAPT,
            transferAPTBack,
            handleMint,
            handleMintItems,
            setMyBalance,
            fetchSpaceships,
            handleNewGameSession,
            fetchUserStats,
            fetchItemsCollectionAddress,
            getUserOwnedItems,
            getItem,
            handleListItem,
            getAllItems,
            getAllSellers,
            getAllListedNfts,
            handlePurchaseItem,
            fetchAllUserStats,
            }}
        >
            {children}
        </AppContexts.Provider>
        </ThemeProvider>
    );
};

export const AppContext: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <AlertProvider>
            <AutoConnectProvider>
                <WalletContext>
                    <UserContextProvider>
                        <AppContextProvider>{children}</AppContextProvider>
                    </UserContextProvider>
                </WalletContext>
            </AutoConnectProvider>
        </AlertProvider>
    );
};