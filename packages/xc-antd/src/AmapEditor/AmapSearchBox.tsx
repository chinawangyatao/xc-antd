import React from 'react';
import { AutoComplete, Empty, Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type {
  AmapEditorSearchOptions,
  AmapSearchResult,
} from './types';
import { toAmapSearchResult } from './utils';

interface AmapSearchOption {
  value: string;
  label: React.ReactNode;
  result?: AmapSearchResult;
  disabled?: boolean;
}

interface AmapSearchBoxProps {
  options: AmapEditorSearchOptions;
  onInput?: (keyword: string) => void;
  onSelect: (result: AmapSearchResult) => void;
  onError?: (error: Error) => void;
}

function createSearchService(
  city: string | undefined,
  cityLimit: boolean | undefined,
  type: string | undefined,
  dataType: AmapEditorSearchOptions['dataType'],
) {
  const Service = AMap.v ? AMap.Autocomplete : AMap.AutoComplete;
  return new Service({
    city,
    citylimit: cityLimit,
    type,
    datatype: dataType,
  });
}

function loadSearchService(
  city: string | undefined,
  cityLimit: boolean | undefined,
  type: string | undefined,
  dataType: AmapEditorSearchOptions['dataType'],
) {
  return new Promise<AMap.AutoComplete | AMap.Autocomplete>((resolve, reject) => {
    try {
      const plugin = AMap.v ? 'AMap.Autocomplete' : 'AMap.AutoComplete';
      AMap.plugin([plugin], () => {
        try {
          resolve(createSearchService(city, cityLimit, type, dataType));
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

export function AmapSearchBox({
  options,
  onInput,
  onSelect,
  onError,
}: AmapSearchBoxProps) {
  const [keyword, setKeyword] = React.useState('');
  const [searchOptions, setSearchOptions] = React.useState<AmapSearchOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const servicePromiseRef = React.useRef<
    Promise<AMap.AutoComplete | AMap.Autocomplete> | undefined
  >(undefined);
  const timerRef = React.useRef<number | undefined>(undefined);
  const requestSequenceRef = React.useRef(0);

  React.useEffect(() => {
    let active = true;
    const servicePromise = loadSearchService(
      options.city,
      options.cityLimit,
      options.type,
      options.dataType,
    );
    servicePromiseRef.current = servicePromise;
    void servicePromise.catch((error: unknown) => {
      if (active) onError?.(toError(error));
    });
    return () => {
      active = false;
      requestSequenceRef.current += 1;
      if (servicePromiseRef.current === servicePromise) {
        servicePromiseRef.current = undefined;
      }
    };
  }, [onError, options.city, options.cityLimit, options.dataType, options.type]);

  React.useEffect(() => () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
  }, []);

  const handleSearch = (nextKeyword: string) => {
    setKeyword(nextKeyword);
    onInput?.(nextKeyword);
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);

    const normalizedKeyword = nextKeyword.trim();
    if (!normalizedKeyword) {
      requestSequenceRef.current += 1;
      setSearchOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const sequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = sequence;
    timerRef.current = window.setTimeout(() => {
      const servicePromise = servicePromiseRef.current;
      if (!servicePromise) {
        setLoading(false);
        onError?.(new Error('地点搜索服务尚未加载'));
        return;
      }
      void servicePromise.then((service) => {
        if (sequence !== requestSequenceRef.current) return;
        service.search(normalizedKeyword, (status, result) => {
          if (sequence !== requestSequenceRef.current) return;
          setLoading(false);
          if (status === 'complete') {
            const nextOptions = result.tips.flatMap((tip, index) => {
              const searchResult = toAmapSearchResult(tip);
              if (!searchResult) return [];
              return [{
                value: `${searchResult.id || searchResult.name}-${index}`,
                result: searchResult,
                label: (
                  <div className="xc-amap-editor__search-option">
                    <span className="xc-amap-editor__search-option-name">
                      {searchResult.name}
                    </span>
                    <span className="xc-amap-editor__search-option-address">
                      {searchResult.district}{searchResult.address}
                    </span>
                  </div>
                ),
              }];
            });
            setSearchOptions(nextOptions);
            return;
          }
          setSearchOptions([]);
          if (status !== 'no_data') {
            onError?.(new Error(result.info || '地点搜索失败'));
          }
        });
      }).catch((error: unknown) => {
        if (sequence !== requestSequenceRef.current) return;
        setLoading(false);
        setSearchOptions([]);
        onError?.(toError(error));
      });
    }, Math.max(0, options.debounce ?? 300));
  };

  const displayedOptions: AmapSearchOption[] = loading
    ? [{
      value: '__loading__',
      disabled: true,
      label: <div className="xc-amap-editor__search-state"><Spin size="small" /></div>,
    }]
    : searchOptions.length
      ? searchOptions
      : keyword.trim()
        ? [{
          value: '__empty__',
          disabled: true,
          label: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无匹配地点"
            />
          ),
        }]
        : [];

  return (
    <AutoComplete<string, AmapSearchOption>
      value={keyword}
      options={displayedOptions}
      filterOption={false}
      popupMatchSelectWidth
      onSearch={handleSearch}
      onSelect={(_, option) => {
        if (!option.result) return;
        setKeyword(option.result.name);
        onSelect(option.result);
      }}
    >
      <Input
        allowClear
        prefix={<SearchOutlined />}
        suffix={loading ? <Spin size="small" /> : undefined}
        placeholder={options.placeholder ?? '搜索地点'}
      />
    </AutoComplete>
  );
}
