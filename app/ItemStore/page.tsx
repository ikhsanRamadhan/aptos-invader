"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const ItemStore = () => {
    const { userAddress } = useUserContext();
    const { adminAddress, allSellers, listedNfts, getAllListedNfts, handlePurchaseItem, getAllItems, getAllSellers } = useAppContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 40;
    const [buttonLoading, setButtonLoading] = useState(false);

    const handleBuy = async (item: any) => {
        setButtonLoading(true);
        if (adminAddress && userAddress) {
            await handlePurchaseItem(adminAddress, userAddress, item);
            setButtonLoading(false);
        }
        setButtonLoading(false);
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return 'text-white';
            case 'Uncommon': return 'text-green-500';
            case 'Rare': return 'text-blue-500';
            case 'Epic': return 'text-purple-500';
            case 'Legendary': return 'text-red-500';
            default: return 'text-white';
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = listedNfts?.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        if (listedNfts) {
            setTotalPages(Math.ceil(listedNfts.length / itemsPerPage));
        }
    }, [listedNfts]);

    const handleChangePage = (newPage: number) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        getAllItems();
        if (adminAddress) {
            getAllSellers(adminAddress);
        }

        const fetchListedNfts = async () => {
            setIsLoading(true);
            await getAllListedNfts();
            setIsLoading(false);
        };

        fetchListedNfts();
    }, [adminAddress, allSellers]);

    return (
        <div style={{ minHeight: '75vh' }} className='flex flex-col gap-6 justify-center mt-20'>
            <h1 className='w-full text-center text-3xl mt-2'>Item Store</h1>
            <div className='flex flex-row gap-4 mx-10 mt-4 flex-wrap items-center justify-center'>
                {isLoading ? (
                    <CircularProgress color="secondary" size={50}/>
                ) : (
                    currentItems?.map((item, i) => (
                        <div
                            className='
                                flex flex-col flex-wrap gap-2 p-2
                                border border-gray-300 rounded-lg
                                place-content-center items-center
                                hover:bg-black hover:shadow-[0_0_10px_#ffffff] hover:text-white
                                transition duration-500 cursor-pointer
                            '
                            key={i}
                        >
                            <div className='w-24 h-24 p-2 mt-2'>
                                <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                            </div>
                            <h3 className='text-center text-lg font-bold'>{item.name}</h3>
                            <p className={`${getRarityColor(item.attributes)} text-md font-semibold`}>{item.attributes}</p>
                            <Link
                                href={`https://explorer.aptoslabs.com/object/${item.nftAddress}?network=testnet`}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <p className='text-sm'>View on Aptos Explorer</p>
                            </Link>
                            <p>{item.price} APT</p>
                            {!buttonLoading ? (
                                <button 
                                    className='bg-white rounded-md my-2 px-2 py-1 text-black hover:bg-transparent hover:text-white hover:border hover:border-white max-w-max'
                                    onClick={() => handleBuy(item)}
                                >
                                    Buy Now
                                </button>
                            ) : (
                                <CircularProgress color="secondary" size={20}/>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className='flex justify-center my-4 text-white'>
                {(currentItems?.length ?? 0) > 0 ? (
                    <Pagination 
                        count={totalPages} 
                        variant="outlined" 
                        shape="rounded" 
                        color='secondary' 
                        page={currentPage}
                        onChange={(_, newPage) => handleChangePage(newPage)}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: 'white',
                                fontWeight: 'bold',
                            },
                        }}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default ItemStore;