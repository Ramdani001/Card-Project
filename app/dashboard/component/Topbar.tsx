"use client";

import { Container, Flex } from "@mantine/core";

const Topbar = () => {
  return (
    <Container fluid h="100%">
      <Flex align="center" h="100%">
        <h1 style={{ margin: 0 }}>Topbar</h1>
      </Flex>
    </Container>
  );
};

export default Topbar;
