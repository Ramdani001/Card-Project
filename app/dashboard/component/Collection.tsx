"use client";

import { Button, Flex, Grid } from "@mantine/core";
import Card from "./Card";
import Type from "./Type";
import Discount from "./Discount";

const Collection = () => {
 
  return (
    <>
        <Grid style={{ width: "80vw" }}>
            <Grid.Col>
                <Grid>
                    <Grid.Col span={6}>
                        <Type />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Discount />
                    </Grid.Col>
                </Grid>
            </Grid.Col>
            <Grid.Col>
                <Card />
            </Grid.Col>
        </Grid>
    </>
  );
};

export default Collection;
