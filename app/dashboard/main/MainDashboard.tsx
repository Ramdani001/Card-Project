"use client"
import Sidebar from "../component/Sidebar";
import Collection from "../component/Collection";
import Topbar from "../component/Topbar";
import { Container, Grid, Button } from "@mantine/core";
import { useState } from "react";
import Dashboard from "../component/Dashboard";

const MainDashboard = () => {

    const [menus, setMenu] = useState<string>("");

    const handleMenuChange = (menuName: string) => {
        setMenu(menuName);
    };

    return (
        <>
            <Grid>
                <Grid.Col span={2} bg="#0f1536" style={{ textAlign: 'center', display: 'fixed', height: '100.6vh', overflow: "hidden" }}>
                    {/* <Sidebar /> */}
                      <Sidebar onMenuClick={handleMenuChange} />
                      <p>Menu aktif: {menus}</p>
                </Grid.Col>
                <Grid.Col span={4}>
                     <Container>
                        <Topbar />
                        {menus === "Dashboard" ? <Dashboard /> : ""}
                        {menus === "Collection" ? <Collection /> : ""}

                    </Container>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default MainDashboard