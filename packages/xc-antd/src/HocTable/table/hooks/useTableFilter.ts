import React from 'react';
import Highlighter from 'react-highlight-words';
import TableFilter from '../tableFilter';

/**
 * 表格列过滤 + 文字高亮 hook
 * 封装过滤数据源、生成带搜索输入的列标题、高亮匹配文字等逻辑
 */
export function useTableFilter<T extends Record<string, any>>(dataSource: T[]) {
    const [searchTexts, setSearchTexts] = React.useState<Record<string, string>>({});

    const setSearchText = (dataIndex: string, text: string) => {
        setSearchTexts(prev => ({ ...prev, [dataIndex]: text }));
    };

    /** 根据 searchWords 过滤后的数据源 */
    const filteredDataSource = React.useMemo(() => {
        const activeFilters = Object.entries(searchTexts).filter(([, v]) => v);
        if (activeFilters.length === 0) return dataSource;
        return dataSource.filter(record =>
            activeFilters.every(([key, text]) =>
                String(record[key] ?? '').toLowerCase().includes(text.toLowerCase()),
            ),
        );
    }, [dataSource, searchTexts]);

    /** 清空所有列的搜索文本 */
    const clearAllSearch = () => setSearchTexts({});

    /**
     * 获取列的搜索配置（title + render），spread 到 column 定义中即可
     * @param dataIndex 列数据字段名
     * @param title     列标题文字
     * @param filterVisible 搜索输入框是否可见
     */
    const getColumnSearchProps = (
        dataIndex: string,
        title: string,
        filterVisible: boolean,
    ) => ({
        title: () => (
            <TableFilter
                title={title}
                visible={filterVisible}
                placeholder={`请输入${title}`}
                searchText={searchTexts[dataIndex] ?? ''}
                onSearchChange={(text: string) => setSearchText(dataIndex, text)}
            />
        ),
        render: (text: unknown) => {
            const searchText = searchTexts[dataIndex] ?? '';
            if (!searchText) return String(text ?? '');
            return (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={String(text ?? '')}
                />
            );
        },
    });

    return { searchTexts, filteredDataSource, clearAllSearch, getColumnSearchProps };
}
