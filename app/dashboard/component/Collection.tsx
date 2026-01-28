"use client"
const collection = () => {

    return (
        <>
            <div className="w-screen bg-red p-3 grid justify-content-center">
                <table className="table-auto shadow-md bg-gray-200/20">
                    <thead className="border-b">
                        <tr className="p-3 flex gap-5">
                            <th className="grow">No</th>
                            <th className="grow text-start">Name Card</th>
                            <th className="grow text-start">Type</th>
                            <th className="grow text-start">Price</th>
                            <th className="grow text-start">Discount</th>
                            <th className="grow text-start">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="p-3 flex gap-5">
                            <th className="grow">1</th>
                            <th className="grow text-start">Yu-gi-oh</th>
                            <th className="grow text-start">Card Single</th>
                            <th className="grow text-start">Rp. 1.000.000</th>
                            <th className="grow text-start">10%</th>
                            <th className="grow text-start">11</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default collection