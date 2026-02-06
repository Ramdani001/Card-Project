"use client";

import { AppDispatch, RootState } from "@/app/reudux/store";
import { Container, Table, Pagination, Modal, Stack, TextInput, Combobox, InputBase, useCombobox, Input, FileInput, Button, Flex, Center, Alert } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import axios from 'axios'
import { fetchData } from "next-auth/client/_utils";
import { IconInfoCircle } from "@tabler/icons-react";

const groceries = ['🍎 Apples', '🍌 Bananas', '🥦 Broccoli', '🥕 Carrots', '🍫 Chocolate'];

const Card = () => {
  const [activePage, setActivePage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [elements, setElements] = useState([]);
  
  const rowsPerPage = 4;

  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
useEffect(() => {
  const fetchData = async () => {
    try {
      const url = `http://localhost:3000/api/cards?page=1&limit=${rowsPerPage}/`;
      const response = await axios.get(url);
      setElements(response.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  fetchData();
}, []);

useEffect(() => {
  console.log(elements);
}, [elements]);
const currentRows = elements.slice(startIndex, endIndex);

const handleEdit = ((idCard) => {
    alert(idCard);
})

const handleDelete = async (idCard) => {
    try {
      await axios.delete(`http://localhost:3000/api/cards/${idCard}`);
      // Hapus card dari state supaya UI update
      setElements((prev) => prev.filter((c) => c.idCard !== idCard));
      alert("Card deleted successfully");
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Failed to delete card");
    }
  };

//   alert
const icon = <IconInfoCircle />;

const rows = currentRows.map((item) => (
  <Table.Tr key={item.idCard}>
    {/* Image */}
    <Table.Td>
      <img
        src={item.detail.image.location}
        alt={item.detail.name}
        width={60}
      />
    </Table.Td>

    {/* Name (detail) */}
    <Table.Td>{item.detail.name}</Table.Td>

    {/* Type Card */}
    <Table.Td>{item.typeCard.name}</Table.Td>

    {/* Price */}
    <Table.Td>
      Rp {item.detail.price.toLocaleString("id-ID")}
    </Table.Td>

    {/* Stock */}
    <Table.Td>{item.detail.stock}</Table.Td>

    {/* Discount */}
    <Table.Td>{item.detail.discount.discount}%</Table.Td>

    {/* Action */}
    <Table.Td>
        <Flex gap="md">
            <Button variant="filled" onClick={() => handleEdit(item.idCard)}>
                Edit
            </Button>
            <Button variant="filled" color="red" onClick={() => handleDelete(item.idCard)}>
                Delete
            </Button>
        </Flex>
    </Table.Td>
  </Table.Tr>
));


    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const typeCard = useCombobox({
        onDropdownClose: () => typeCard.resetSelectedOption(),
    });

    const [typeVal, setTypeVal] = useState<string | null>(null);
    const [value, setValue] = useState<string | null>(null);

    const options = groceries.map((item) => (
        <Combobox.Option value={item} key={item}>
        {item}
        </Combobox.Option>
    ));

    const optionType = groceries.map((item) => (
        <Combobox.Option value={item} key={item}>
        {item}
        </Combobox.Option>
    ));

  return (
    <>
        <Container style={{ minWidth: "80vw"}}>
            <Button variant="filled" onClick={open}>Add Card</Button>  

            <Table stickyHeader stickyHeaderOffset={60}>
                <Table.Thead>
                <Table.Tr>
                    <Table.Th>Image</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Stock</Table.Th>
                    <Table.Th>Discount</Table.Th>
                </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            <Pagination
                total={Math.ceil(elements.length / rowsPerPage)}
                page={activePage}
                onChange={setActivePage}
                position="center"
                color="blue"
                style={{ marginTop: "20px" }}
            />
            <Modal opened={opened} onClose={close} title="Add Card">
                <form>
                    <Stack>
                        <TextInput
                        label="Name"
                        placeholder="Yu-Gi oh"
                        radius="md"
                        />

                        {/* Type Card */}
                        <div>
                            <label>Type Card</label>
                            <Combobox
                            store={typeCard}
                            onOptionSubmit={(val) => {
                                setTypeVal(val);
                                typeCard.closeDropdown();
                            }}
                            >
                                <Combobox.Target>
                                    <InputBase
                                    component="button"
                                    type="button"
                                    pointer
                                    rightSection={<Combobox.Chevron />}
                                    rightSectionPointerEvents="none"
                                    onClick={() => typeCard.toggleDropdown()}
                                    >
                                    {typeVal || <Input.Placeholder>Type Card</Input.Placeholder>}
                                    </InputBase>
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>{optionType}</Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        </div>

                        <TextInput
                        label="Price"
                        placeholder="Yu-Gi oh"
                        radius="md"
                        />
                        <TextInput
                        label="Stok"
                        placeholder="Yu-Gi oh"
                        radius="md"
                        />

                        {/* Discount */}
                        <div>
                            <label>Discount</label>
                            <Combobox
                            store={combobox}
                            onOptionSubmit={(val) => {
                                setValue(val);
                                combobox.closeDropdown();
                            }}
                            >
                                <Combobox.Target>
                                    <InputBase
                                    component="button"
                                    type="button"
                                    pointer
                                    rightSection={<Combobox.Chevron />}
                                    rightSectionPointerEvents="none"
                                    onClick={() => combobox.toggleDropdown()}
                                    >
                                    {value || <Input.Placeholder>Discount</Input.Placeholder>}
                                    </InputBase>
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>{options}</Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        </div>

                         <FileInput label="Image" placeholder="Upload files" multiple />

                    </Stack>

                    <Flex
                        pt="md"
                        gap="xl"
                        align="center"
                    >
                        <Button variant="filled" fullWidth>Submit</Button>
                    </Flex>

                </form>
            </Modal>
        </Container>
        
        {/* aler */}
        {/* <Alert variant="light" color="red" title="Alert title" icon={icon}>
            Delete Succesfully
        </Alert> */}

    </>
  );
};

export default Card;
