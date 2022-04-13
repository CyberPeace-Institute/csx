import {
    Box,
    Button,
    Checkbox,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Heading,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useDisclosure
} from '@chakra-ui/react';
import { ExtensionRemove, Eye, Link as LinkGG, Search } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function FileUploadModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loadProgress, setLoadProgress] = useState(0);
    const [intervalCounter, setIntervalCounter] = useState(null);

    useEffect(() => {
        if (store.fileUpload.showFileUploadModal) {
            onOpen();
        } else if (!store.fileUpload.showFileUploadModal && isOpen) {
            onClose();
        }
    }, [isOpen, onClose, onOpen, store.fileUpload.showFileUploadModal]);

    useEffect(() => {
        if (
            (store.fileUpload.fileUploadData.name === '' ||
                store.fileUpload.isPopulating) &&
            isOpen &&
            intervalCounter == null
        ) {
            const interval = setInterval(() => {
                setLoadProgress(prevProgress => {
                    return prevProgress < 90
                        ? prevProgress + Math.floor(Math.random() * 10)
                        : prevProgress;
                });
            }, 750);
            setIntervalCounter(() => interval);
        } else if (
            store.fileUpload.fileUploadData.name !== '' &&
            !store.fileUpload.isPopulating &&
            isOpen &&
            intervalCounter !== null
        ) {
            return () => {
                setLoadProgress(() => 0);
                clearInterval(intervalCounter);
                setIntervalCounter(() => null);
            };
        }
    }, [
        intervalCounter,
        isOpen,
        loadProgress,
        store.fileUpload.fileUploadData.name,
        store.fileUpload.isPopulating
    ]);

    const renderColumnTypeDropdown = (column, defaultType) => (
        <Select
            defaultValue={defaultType}
            size="sm"
            borderRadius="5px"
            variant="filled"
            onChange={val =>
                store.fileUpload.changeFileUplodColumnType(
                    column,
                    val.target.value
                )
            }
        >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="list">list</option>
        </Select>
    );

    const renderColumnDropdown = () => (
        <Select
            defaultValue={store.fileUpload.fileUploadData.anchor}
            size="sm"
            borderRadius="5px"
            variant="filled"
            onChange={val =>
                store.fileUpload.changeFileUplodAnchor(val.target.value)
            }
        >
            {Object.keys(store.fileUpload.fileUploadData.defaults).map(
                column => (
                    <option key={`deafult_anchor_${column}`} value={column}>
                        {column}
                    </option>
                )
            )}
        </Select>
    );

    const getTextForErrorCode = errorCode => {
        switch (errorCode) {
            case 'defaultVisible':
                return 'visible nodes';
            case 'defaultSearchable':
                return 'searchable nodes';
            default:
                return 'link nodes';
        }
    };

    const generateErrorMessage = () => {
        const errors = Object.keys(store.fileUpload.fileUploadErrors)
            .map(errorCode =>
                store.fileUpload.fileUploadErrors[errorCode]
                    ? getTextForErrorCode(errorCode)
                    : ''
            )
            .filter(val => val !== '');

        if (errors.length === 1) {
            return errors[0];
        } else if (errors.length === 2) {
            return `${errors[0]} and ${errors[1]}`;
        } else {
            return `${errors[0]}, ${errors[1]} and ${errors[2]}`;
        }
    };

    const renderTableHeader = () => (
        <Thead>
            <Tr>
                <Th width="24%">Column</Th>
                <Th width="5%" padding="0px 4px">
                    <Tooltip label="Visible by default">
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Eye style={{ '--ggs': '0.7' }} />
                        </Flex>
                    </Tooltip>
                </Th>

                <Th width="5%" padding="0px 4px">
                    <Tooltip label="Use for searching">
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Search
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        </Flex>
                    </Tooltip>
                </Th>

                <Th width="5%" padding="0px 4px">
                    <Tooltip label="Use as default link">
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <LinkGG style={{ '--ggs': '0.7' }} />
                        </Flex>
                    </Tooltip>
                </Th>
                <Th width="18%">Data Type</Th>
                <Th width="18%" paddingLeft="4px">
                    Null replacement
                </Th>
                <Th width="5%" padding="0px 24px 0 4px">
                    <Tooltip label="Remove row if null">
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <ExtensionRemove
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        </Flex>
                    </Tooltip>
                </Th>
            </Tr>
        </Thead>
    );

    const renderTableBody = () => (
        <Tbody>
            {Object.keys(store.fileUpload.fileUploadData.defaults).map(
                (column, id) => (
                    <Tr key={`upload_file_${id}`}>
                        <Td width="24%">
                            <Editable
                                defaultValue={
                                    store.fileUpload.fileUploadData.defaults[
                                        column
                                    ].name
                                }
                                backgroundColor="blackAlpha.300"
                                borderRadius="5px"
                                maxWidth="176px"
                                onSubmit={val =>
                                    store.fileUpload.changeColumnName(
                                        column,
                                        val
                                    )
                                }
                            >
                                <EditablePreview
                                    padding="5px 23px"
                                    width="100%"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    height="30px"
                                />
                                <EditableInput
                                    padding="5px 23px"
                                    width="100%"
                                    height="30px"
                                />
                            </Editable>
                        </Td>

                        <Td width="5%" paddingLeft="4px" paddingRight="4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Checkbox
                                    checked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultVisible
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
                                            column,
                                            'isDefaultVisible'
                                        )
                                    }
                                />
                            </Flex>
                        </Td>
                        <Td width="5%" paddingLeft="4px" paddingRight="4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Checkbox
                                    checked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultSearch
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
                                            column,
                                            'isDefaultSearch'
                                        )
                                    }
                                />
                            </Flex>
                        </Td>
                        <Td width="5%" paddingLeft="4px" paddingRight="4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Checkbox
                                    checked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultLink
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
                                            column,
                                            'isDefaultLink'
                                        )
                                    }
                                />
                            </Flex>
                        </Td>
                        <Td width="18%">
                            {renderColumnTypeDropdown(
                                column,
                                store.fileUpload.fileUploadData.defaults[column]
                                    .dataType
                            )}
                        </Td>
                        <Td width="18%" paddingLeft="4px">
                            <Editable
                                defaultValue={
                                    store.fileUpload.fileUploadData.defaults[
                                        column
                                    ].defaultNullValue
                                }
                                backgroundColor="blackAlpha.300"
                                borderRadius="5px"
                                minHeight="30px"
                                onSubmit={val =>
                                    store.fileUpload.changeNullReplacement(
                                        column,
                                        val
                                    )
                                }
                            >
                                <EditablePreview
                                    padding="5px 23px"
                                    width="100%"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    height="30px"
                                />
                                <EditableInput
                                    padding="5px 23px"
                                    width="100%"
                                    height="30px"
                                />
                            </Editable>
                        </Td>
                        <Td width="5%" padding="0px 24px 0 4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Checkbox
                                    checked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].removeIfNull
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
                                            column,
                                            'removeIfNull'
                                        )
                                    }
                                />
                            </Flex>
                        </Td>
                    </Tr>
                )
            )}
        </Tbody>
    );

    const renderModalBody = () => {
        if (
            store.fileUpload.fileUploadData.name === '' ||
            store.fileUpload.isPopulating
        ) {
            return (
                <ModalBody overflowY="scroll" marginBottom="20px">
                    <Heading size="sm" marginBottom="10px">
                        {store.fileUpload.isPopulating
                            ? 'populating index'
                            : 'Processing Dataset'}
                    </Heading>
                    <Progress size="xs" value={loadProgress} />
                </ModalBody>
            );
        }

        return (
            <ModalBody overflowY="scroll" width="748px">
                <Heading size="xs" marginBottom="10px">
                    Dataset name:{' '}
                </Heading>
                <Editable
                    defaultValue={store.fileUpload.fileUploadData.name}
                    backgroundColor="blackAlpha.300"
                    borderRadius="5px"
                    onSubmit={val => store.fileUpload.changeDatasetName(val)}
                >
                    <EditablePreview padding="5px 23px" width="100%" />
                    <EditableInput padding="5px 23px" width="100%" />
                </Editable>
                <Heading size="xs" marginBottom="10px" marginTop="10px">
                    Columns:{' '}
                </Heading>

                <Box overflowX="scroll">
                    <TableContainer
                        backgroundColor="blackAlpha.300"
                        borderTopRadius="5px"
                        minWidth="700px"
                        width="700px"
                    >
                        <Table style={{ tableLayout: 'fixed' }}>
                            {renderTableHeader()}
                        </Table>
                    </TableContainer>
                    <TableContainer
                        backgroundColor="blackAlpha.300"
                        borderBottomRadius="5px"
                        maxHeight="290px"
                        overflowY="scroll"
                        minWidth="700px"
                        width="700px"
                    >
                        <Table style={{ tableLayout: 'fixed' }}>
                            {renderTableBody()}
                        </Table>
                    </TableContainer>
                </Box>
                <Heading size="xs" marginBottom="10px" marginTop="10px">
                    Default Anchor:
                </Heading>
                {renderColumnDropdown()}
                {store.fileUpload.showFileUploadError && (
                    <Text
                        fontSize="sm"
                        color="red.500"
                        fontWeight="bold"
                        marginTop="15px"
                    >
                        Please select default {generateErrorMessage()}.
                    </Text>
                )}
            </ModalBody>
        );
    };

    const populateIndex = () => {
        store.fileUpload.setDefaults();
    };

    const cancelFileUpload = () => {
        store.fileUpload.cancelFileUpload();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            isCentered
            closeOnEsc={false}
            closeOnOverlayClick={false}
        >
            <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
            <ModalContent width="748px" minWidth="748px" maxWidth="748px">
                <ModalHeader>Dataset Defaults Setup</ModalHeader>
                {isOpen && renderModalBody()}

                {store.fileUpload.fileUploadData.name !== '' &&
                    !store.fileUpload.isPopulating && (
                        <ModalFooter>
                            <Button
                                variant="outline"
                                mr={3}
                                onClick={cancelFileUpload}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={() => populateIndex()}
                            >
                                Set defaults
                            </Button>
                        </ModalFooter>
                    )}
            </ModalContent>
        </Modal>
    );
}

export default observer(FileUploadModal);
