"use client";
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';

import Style from './store.module.css';
import spaceships from '../utils/spaceships';
import { Ship, ShipStatsProps, StatCardProps } from '../Ship';
import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';
import ListedItems from '../(components)/ListedItems';

const StatCard: FC<StatCardProps> = ({ label, value }) => (
    <div className='grid grid-rows-2 mb-2'>
        <div className='font-semibold'>{label}</div>
        <div className='bg-[#4c5773] p-1 text-white rounded-full'>
            <div className='place-self-center text-center justify-self-center'>{value}</div>
        </div>
    </div>
);

const ShipStats: FC<ShipStatsProps> = ({ ship }) => {
    const stats = [
        { label: 'Health Points', value: ship.hp },
        { label: 'Max Energy', value: ship.maxEnergy },
        { label: 'Energy Recovery', value: ship.energyRegen },
        { label: 'Laser Size', value: ship.laserWidth },
        { label: 'Laser Damage', value: ship.laserDamage },
        { label: 'Bullet', value: ship.bullet }
    ];

    return (
        <div className='grid grid-cols-3 text-[#4c5773] text-center mt-2 gap-2 justify-center'>
            {stats.map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} />
            ))}
        </div>
    );
};

const Store: FC = () => {
    const router = useRouter();
    const { adminAddress, mySpaceships, allSellers, listedNfts, handleMint, fundWallet, getAllItems, getAllSellers, getAllListedNfts } = useAppContext();
    const { userAddress } = useUserContext();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = listedNfts?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalPages = Math.ceil((listedNfts?.length || 0) / itemsPerPage);

    const handleChangePage = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleBuySpaceShip = async (ship: any) => {
        if (ship.price < 1 || mySpaceships.some(myShip => myShip.name === ship.name)) {
            return;
        }

        if (adminAddress && userAddress) {
            await handleMint(adminAddress, userAddress, ship.price, ship);
        }
        
        console.log(ship.name);
    };

    const handleFundWallet = async () => {
        setIsLoading(true);
        if (userAddress) {
            await fundWallet(userAddress);
            setIsLoading(false);
        }
        setIsLoading(false);
    };

    const handleItemStore = () => {
        router.push('/ItemStore');
    };

    useEffect(() => {
        getAllItems();
        if (adminAddress) {
            getAllSellers(adminAddress);
        }
    }, [adminAddress]);

    useEffect(() => {
        const fetchListedNfts = async () => {
            setIsLoading(true);
            await getAllListedNfts();
            setIsLoading(false);
        };

        fetchListedNfts();
    },[allSellers, adminAddress]);

    return (
        <div style={{ minHeight: '75vh' }} className='flex flex-col gap-6 justify-center mt-20'>
            <h1 className='w-auto text-center text-3xl mt-2'>Store</h1>
            <div className={`${Style.NFTCard} flex flex-row flex-wrap gap-6 px-10 place-content-center`}>
                {spaceships.map((ship: Ship, i: number) => (
                    <div className={Style.NFTCard_box} key={i} onClick={() => handleBuySpaceShip(ship)}>
                        <div className={Style.NFTCard_box_img}>
                            <img src={ship.icon} alt="Spaceship images" width={256} height={256} className={Style.NFTCard_box_img_img} />
                        </div>

                        <div className={Style.NFTCard_box_update}>
                            <div className={Style.NFTCard_box_update_left}>
                                <div className={Style.NFTCard_box_update_left_price}>
                                    {mySpaceships.some(myShip => myShip.name === ship.name) || ship.price < 1 ? <p>Owned</p> : <p>{ship.price / 100000000} APT</p>}
                                </div>
                            </div>

                            <div className={Style.NFTCard_box_update_right}>
                                <div className={Style.NFTCard_box_update_right_info}>
                                    <p>{ship.name}</p>
                                </div>
                            </div>
                        </div>

                        <ShipStats ship={ship} />
                    </div>
                ))}
            </div>

            <div className='xl:w-full max-w-6xl flex flex-col items-center gap-y-9 mx-5 sm:mx-8 md:mx-9 xl:mx-auto pt-14 pb-20 md:pb-10 lg:pb-32 xl:pb-20'>
                <div className='flex sm:flex-row flex-col items-center gap-y-2 px-2 sm:px-0 w-full'>
                    <h1 className='w-full text-3xl text-start font-bold'>Listed NFT Items</h1>
                    <a onClick={handleItemStore} className='inline-flex items-center justify-end font-semibold ml-auto border border-grayscale-2 rounded-lg px-4 py-2 w-full sm:w-auto hover:bg-black hover:text-white cursor-pointer transition-colors duration-300'>
                        <span className="whitespace-nowrap">View All</span>
                        <img src='arrowright.svg' className='ml-2 w-5 h-5 flex-shrink-0' alt="Arrow right" />
                    </a>
                </div>
                <ListedItems isLoading={isLoading} currentItems={currentItems} totalPages={totalPages} handleChangePage={handleChangePage}/>
            </div>

            <div className='flex flex-col w-full text-center items-center'>
                <p className='text-2xl'>Fund your wallet with APT</p>
                {!isLoading ? (
                    <button 
                        onClick={handleFundWallet} 
                        className='
                            bg-white
                            rounded-md 
                            my-2 
                            px-4 
                            py-2 
                            text-black 
                            hover:bg-transparent 
                            hover:text-white 
                            hover:border 
                            hover:border-white 
                            max-w-max'
                    >
                        Fund 1 Aptos Coin to Wallet
                    </button>
                ) : (
                    <CircularProgress color="secondary" size={20}/>
                )}
            </div>
        </div>
    );
};

export default Store;
