"use client";

import { Button, Pagination, Table } from "@mantine/core";
import { useState } from "react";

const initialElements = [
  { position: 6, mass: 12.011, symbol: "C", name: "Carbon" },
  { position: 7, mass: 14.007, symbol: "N", name: "Nitrogen" },
  { position: 39, mass: 88.906, symbol: "Y", name: "Yttrium" },
  { position: 56, mass: 137.33, symbol: "Ba", name: "Barium" },
  { position: 58, mass: 140.12, symbol: "Ce", name: "Cerium" },
];

const Type = () => {
  const [activePage, setActivePage] = useState(1);
  const [elements] = useState(initialElements);

  const rowsPerPage = 5;
  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = elements.slice(startIndex, endIndex);

  const rows = currentRows.map((item) => (
    <Table.Tr key={item.position}>
      <Table.Td>{item.position}</Table.Td>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.symbol}</Table.Td>
      <Table.Td>{item.mass}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
    <Button variant="filled">Add Type</Button>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Element position</Table.Th>
            <Table.Th>Element name</Table.Th>
            <Table.Th>Symbol</Table.Th>
            <Table.Th>Atomic mass</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Pagination
        total={Math.ceil(elements.length / rowsPerPage)}
        // page={activePage}
        onChange={setActivePage}
        // position="center"
        color="blue"
        style={{ marginTop: "20px" }}
      />
    </>
  );
};

export default Type;
