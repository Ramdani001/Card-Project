"use client"

import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {

    const [active, setActive] = useState(false);

    const handleClick = () => {
        setActive(!active)
    };

    return (
        <>
            <div className="flex items-start">
                <div className= {!active
                            ?"w-0 hidden animate-[sidebar]"
                            :"bg-[#0f1535] h-screen w-70 p-5"}>
                    <div className="flex pb-5 flex-auto justify-center items-center gap-10" >
                        <h1 className="text-3xl text-center font-bold">You'r Card</h1>
                        <button onClick={handleClick} className="justify-end font-bold text-2xl cursor-pointer">X</button>
                    </div>
                    <hr className="opacity-10" />

                    <div className="grid gap-5 place-content-start pt-10 text-m">
                        <div className="w-60">
                            <div className="flex p-2 gap-3 cursor-pointer items-center hover:bg-gray-50/20 hover:font-bold animation-ease-in">
                           <FontAwesomeIcon icon={faChartBar} />
                            <h2>Dashboard</h2>
                        </div>
                        </div>
                        <div>
                            <button onClick={handleClick} className="cursor-pointer">
                                Collection
                            </button>
                        </div>
                    </div>

                </div>
                {/* <button onClick={handleClick}>OPEN</button> */}
            </div>
        </>
    );
};

export default Sidebar