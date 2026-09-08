import React from 'react';
import {InputTree} from "@zhilv/xc-antd";
import {Card, Col, Divider, Row, TreeDataNode} from "antd";
import CrudTableDemo from "./CrudTableDemo.tsx";

const treeData: TreeDataNode[] = [
    {
        title: '崂山风票区',
        key: '0-0',
        children: [
            {
                title: '南线游览路线',
                key: '0-0-0',
                icon: <TreeIcon title="票"/>,
                children: [
                    {
                        title: '太清游览区',
                        key: '0-0-0-0',
                        icon: <TreeIcon title="票"/>,
                        children: [
                            {
                                title: '八水河售票站',
                                key: '0-0-0-0-0',
                                icon: <TreeIcon title="点"/>,
                                children: [
                                    {
                                        title: '八水河信创窗口01',
                                        key: '0-0-0-0-0-0',
                                        icon: <TreeIcon title="窗"/>,
                                    },
                                    {
                                        title: '八水河普通窗口01',
                                        key: '0-0-0-0-0-1',
                                        icon: <TreeIcon title="窗"/>,
                                    }]
                            },
                            {
                                title: '太清广场售票站',
                                key: '0-0-0-0-1',
                                icon: <TreeIcon title="点"/>,
                            }
                        ]
                    },
                    {
                        title: '巨峰游览区',
                        key: '0-0-0-1',
                        icon: <TreeIcon title="票"/>,
                    },
                    {
                        title: '仰口游览区',
                        key: '0-0-0-2',
                        icon: <TreeIcon title="票"/>,
                    },
                    {
                        title: '南线码头售票站',
                        key: '0-0-0-3',
                        icon: <TreeIcon title="点"/>,
                        children: [
                            {
                                title: '南线码头独立售票窗口',
                                key: '0-0-0-3-0',
                                icon: <TreeIcon title="窗"/>,
                            }
                        ]
                    },
                ],
            },
            {
                title: '九水游览路线',
                key: '0-1',
                icon: <TreeIcon title="票"/>,
                children: [
                    {
                        title: '九水游览区',
                        key: '0-1-0',
                        icon: <TreeIcon title="票"/>,
                    },
                ]
            },
            {
                title: '二龙山游览路线',
                key: '0-2',
                icon: <TreeIcon title="票"/>,
                children: [
                    {
                        title: '二龙山票区',
                        key: '0-2-0',
                        icon: <TreeIcon title="票"/>,
                    },
                ]
            },
        ],
    },
];

const TreeSelectPage = () => {
    return (
        <>
            <Card>
                <Row>
                    <Col span={4} ><InputTree height={500} treeData={treeData}/></Col>
                    <Col span={19} offset={1}> <CrudTableDemo/></Col>
                </Row>
            </Card>

        </>
    );
};


function TreeIcon({title}: { title: string }) {

    if (title === '票') {
        return <div
            className={'text-sm flex justify-center items-center w-full h-full border bg-black text-white'}>{title}</div>
    }

    if (title === '点') {
        return <div
            className={'text-sm flex justify-center items-center w-full h-full border bg-gray-600 text-white'}>{title}</div>
    }

    if (title === '窗') {
        return <div
            className={'text-sm flex justify-center items-center w-full h-full border bg-green-800 text-white'}>{title}</div>
    }


}


export default TreeSelectPage;
