"use client"

import { Button, Container, Divider, Flex, Grid } from "@mantine/core";
import { IconLayoutDashboard, IconLibraryPhoto } from "@tabler/icons-react";

type SidebarProps = {
  onMenuClick: (menuName: string) => void;
};

const Sidebar = ({ onMenuClick }: SidebarProps) => {
    
  return (
    <>

        <h1>Card Royal</h1>
        <Divider />

        <Container>
            <Grid>
                <Grid.Col>
                    <Button bg="transparent" onClick={() => onMenuClick("Dashboard")}>
                       <Flex gap="md" justify="flex-center" align="flex-center" >
                        <IconLayoutDashboard />
                        <span>Dashboard</span>
                       </Flex>
                    </Button>
                </Grid.Col>
                <Grid.Col>
                    <Button bg="transparent" onClick={() => onMenuClick("Collection")}>

                        <Flex gap="md" justify="flex-center" align="flex-center" >
                            <IconLibraryPhoto /> 
                            <span>Collection</span>
                        </Flex>

                    </Button>
                </Grid.Col>
            </Grid>
        </Container>

    </>
  );
};

export default Sidebar;
