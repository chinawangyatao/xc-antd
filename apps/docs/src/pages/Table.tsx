import React from 'react';
import { Typography } from 'antd';
import {
    SimpleTable,
    simpleTableDemoData,
    type XcColumnDef,
    type NewRowFieldConfig,
    type SimpleTableValidationRule,
} from '@xc-antd/ui';

/** 业务行数据类型 */
interface DataType {
    id: string;
    passBeginTime: string;
    productName: string;
    contactName: string;
    contactIdcard: string;
    contactMobile: string;
    productId: string;
    subOrderNo: string;
    orderNo: string;
    [key: string]: any;
}

/** 1. 列定义 */
const columns: XcColumnDef<DataType>[] = [
    { key: 'passBeginTime', title: '凭证创建时间', dataIndex: 'passBeginTime', filterable: true },
    { key: 'id', title: '凭证编码', dataIndex: 'id', filterable: true },
    {
        key: 'productName', title: '凭证名称', dataIndex: 'productName',
        filterable: true, filterMode: 'select',
        filterOptions: [
            { label: '巨峰游览区成人门票（人像）', value: '巨峰游览区成人门票（人像）' },
            { label: '巨峰游览区成人联票', value: '巨峰游览区成人联票' },
        ],
    },
    {
        key: 'contactName', title: '凭证分类', dataIndex: 'contactName',
        filterable: true, filterMode: 'select',
        filterOptions: [
            { label: '测试', value: '测试' },
            { label: '测试1', value: '测试1' },
            { label: '测试111', value: '测试111' },
        ],
    },
    { key: 'contactIdcard', title: '子订单号码', dataIndex: 'contactIdcard', filterable: true },
    { key: 'orderNo', title: '联系人', dataIndex: 'orderNo', filterable: true },
    { key: 'contactMobile', title: '手机号', dataIndex: 'contactMobile', filterable: true },
    { key: 'productId', title: '通关码', dataIndex: 'productId', filterable: true },
];

/** 2. 行内编辑字段配置 */
const newRowFieldConfig: Record<string, NewRowFieldConfig> = {
    passBeginTime: { valueType: 'date', placeholder: '选择日期' },
    id: { valueType: 'text', placeholder: '自动生成', readonly: true },
    productName: {
        valueType: 'select', placeholder: '选择凭证名称',
        valueEnum: {
            '巨峰游览区成人门票（人像）': { text: '巨峰游览区成人门票（人像）' },
            '巨峰游览区成人联票': { text: '巨峰游览区成人联票' },
        },
    },
    contactName: {
        valueType: 'select', placeholder: '选择凭证分类',
        valueEnum: {
            '测试': { text: '测试' },
            '测试1': { text: '测试1' },
            '测试111': { text: '测试111' },
        },
    },
    contactIdcard: { valueType: 'text', placeholder: '请输入子订单号码' },
    orderNo: { valueType: 'text', placeholder: '请输入联系人' },
    contactMobile: { valueType: 'text', placeholder: '请输入手机号' },
    productId: { valueType: 'text', placeholder: '请输入通关码' },
};

/** 3. 校验规则 */
const validationRules: SimpleTableValidationRule[] = [
    { field: 'passBeginTime', label: '凭证创建时间' },
    { field: 'productName', label: '凭证名称' },
    { field: 'orderNo', label: '联系人' },
    {
        field: 'contactMobile', label: '手机号',
        rule: (v) => {
            if (!v) return '请输入手机号';
            if (!/^1[3-9]\d{9}$/.test(v)) return '手机号格式不正确';
            return null;
        },
    },
];

/** 4. 新增行默认值工厂 */
const newRowFactory = (): Partial<DataType> => ({
    passBeginTime: '',
    productName: '',
    contactName: '',
    contactIdcard: '',
    contactMobile: '',
    productId: '',
    subOrderNo: '',
    orderNo: '',
});

const Table = () => {
    return (
        <div>
            <Typography.Title>Simple Table</Typography.Title>
            <SimpleTable<DataType>
                columns={columns}
                dataSource={simpleTableDemoData as DataType[]}
                newRowFieldConfig={newRowFieldConfig}
                validationRules={validationRules}
                newRowFactory={newRowFactory}
                onSave={(rows) => {
                    // eslint-disable-next-line no-console
                    console.log('保存数据:', rows);
                }}
            />
        </div>
    );
};

export default Table;
