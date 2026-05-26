"use client";
import React, { useEffect, useState } from 'react';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';
import ListItemModal from '../(components)/ListItemModal';
import items from '../utils/items';

const Profile = () => {
    const { userAddress } = useUserContext();
    const { 
        fetchUserStats, 
        adminAddress, 
        mySpaceships, 
        myItems,
        ownedItems, 
        myStats,
        itemsCollectionAddress,
        allUserStats,
        fetchItemsCollectionAddress,
        getItem,
    } = useAppContext();
    const [openModal, setOpenModal] = useState(false);
    const [itemToBeListed, setItemToBeListed] = useState<any>();
    const [myPosition, setMyPosition] = useState(0);

    const handleListing = async (item: any) => {
        console.log("item", item);
        setItemToBeListed(item);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (adminAddress && userAddress) {
                await fetchUserStats(adminAddress, userAddress);
                await fetchItemsCollectionAddress(adminAddress);
            }
        }

        fetchData();
    }, [adminAddress, userAddress]);

    useEffect(() => {
        const index = allUserStats.findIndex(user => user.addr === userAddress?.toString());

        // If the user is found, update the position
        if (index !== -1) {
            setMyPosition(index + 1);
        } else {
            setMyPosition(0);
        }
    }, [allUserStats, userAddress]);

    useEffect(() => {
        if (myItems.length !== 0) {
            items.map(async (item: any) => {
                myItems.map((myItem: any) => {
                    if (myItem.current_token_data.token_name === item.name) {
                        getItem(myItem.token_data_id, item.name);
                    }
                })
            })
        }
    }, [myItems]);

    useEffect(() => {
        console.log("collection_id", itemsCollectionAddress);
        console.log("My Items", myItems);
        console.log("Owned Items", ownedItems);
    },[itemsCollectionAddress, ownedItems, myItems]);

    return (
        <div style={{minHeight: '75vh'}} className='w-full sm:p-14 p-5 min-h-screen text-white mt-20'>
            <div className='max-w-screen-lg mx-auto'>
                <section className='flex flex-col max-w-3xl sm:pb-12 space-y-10'>
                    <h1 className='text-2xl font-bold'>My Profile</h1>
                    <div className='flex flex-col border rounded-lg p-5'>
                        <p className='font-semibold pb-2'>My Address</p>
                        <p className='ml-4'>{userAddress?.toString()}</p>
                    </div>

                    <div className='flex flex-col place-content-center'>
                        <div className='font-semibold pb-2 mb-2'>
                            My Rank
                        </div>
                        <div className='px-4 py-2 border rounded-md max-w-max ml-4'>
                            <h1 className='text-4xl font-bold'>{myPosition}</h1>
                        </div>
                    </div>

                    <div className='flex flex-col place-content-center'>
                        <div className='font-semibold pb-2 mb-2'>
                            My Stats
                        </div>
                        <div className='flex flex-row flex-wrap gap-4'>
                            <ul className='list-disc ml-4'>
                                <li><strong>Best Score:</strong>  <strong>{myStats[0]?.best_score}</strong></li>
                            </ul>
                            <ul className='list-disc ml-4'>
                                <li><strong>Games Played:</strong>  <strong>{myStats[0]?.games_played}</strong></li>
                            </ul>
                            <ul className='list-disc ml-4'>
                                <li><strong>Spaceship:</strong> <strong>{myStats[0]?.spaceship}</strong></li>
                            </ul>
                        </div>
                    </div>

                    <div className='flex flex-col place-content-center'>
                        <div className='font-semibold pb-2 mb-2'>
                            My Spaceships
                        </div>
                        <div className='flex flex-row flex-wrap gap-4'>
                            {mySpaceships.map((myShip: any, index: number) => (
                                <div key={index} className='bg-transparent border rounded-lg p-2'>
                                    <h3 className='text-center font-semibold'>{myShip.name}</h3>
                                    <img src={myShip.icon} className='size-44'/>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='flex flex-col place-content-center'>
                        <div className='font-semibold pb-2 mb-2'>
                            My Collected Items
                        </div>
                        {ownedItems && ownedItems.length > 0 ? (
                            <div className='flex flex-row flex-wrap gap-4'>
                            {ownedItems.map((item: any, index: number) => {
                                let rarityColor;
                                switch (item.rarity) {
                                case 'Common':
                                    rarityColor = 'text-white';
                                    break;
                                case 'Uncommon':
                                    rarityColor = 'text-green-500';
                                    break;
                                case 'Rare':
                                    rarityColor = 'text-blue-500';
                                    break;
                                case 'Epic':
                                    rarityColor = 'text-purple-500';
                                    break;
                                case 'Legendary':
                                    rarityColor = 'text-red-500';
                                    break;
                                default:
                                    rarityColor = 'text-white';
                                }

                                return (
                                <div key={index} className='flex flex-col gap-2 bg-transparent border rounded-lg p-2 items-center'>
                                    <h3 className='text-center font-semibold'>{item.name}</h3>
                                    <p className={`text-center font-semibold ${rarityColor}`}>{item.rarity}</p>
                                    <img src={item.image} className='w-24 h-24' />
                                    <button
                                        className='bg-white rounded-md my-2 px-2 py-1 text-black hover:bg-transparent hover:text-white hover:border hover:border-white max-w-max'
                                        onClick={() => handleListing(item)}
                                    >
                                        List in Marketplace
                                    </button>
                                </div>
                                );
                            })}
                        </div>
                        ):(null)}
                    </div>
                </section>
            </div>

            <ListItemModal open={openModal} item={itemToBeListed} handleClose={handleCloseModal} />
        </div>
    )
}

export default Profile;