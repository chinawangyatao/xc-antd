import { useState, useCallback } from 'react'
import { Button, Card, Space, Switch, Typography, Row, Col, Divider, Table, Tag } from 'antd'
import { TextField } from '@zhilv/xc-antd'

const { Title, Paragraph, Text } = Typography

/* ==================== 公共 Props 配置表 ==================== */
const commonPropsColumns = [
  { title: '属性', dataIndex: 'prop', width: 160, render: (v: string) => <Text code>{v}</Text> },
  { title: '说明', dataIndex: 'desc' },
  { title: '类型', dataIndex: 'type', width: 200, render: (v: string) => <Text code>{v}</Text> },
  { title: '默认值', dataIndex: 'default', width: 100 },
]

const commonPropsData = [
  { prop: 'text', desc: '字段值（只读时展示、编辑时作为初始值）', type: 'ReactNode | ReactNode[]', default: '-' },
  { prop: 'valueType', desc: '字段类型，决定渲染哪种组件', type: 'ProFieldValueType | ProFieldValueObjectType', default: "'text'" },
  { prop: 'mode', desc: '模式：read 只读 / edit 编辑 / update 编辑', type: "'read' | 'edit' | 'update'", default: "'read'" },
  { prop: 'valueEnum', desc: '值的枚举映射，用于 select / radio / checkbox 等', type: 'Record<string, { text, status?, color?, disabled? }>', default: '-' },
  { prop: 'fieldProps', desc: '传递给底层 antd 组件的属性', type: 'Record<string, any>', default: '-' },
  { prop: 'emptyText', desc: '空值占位文本，设为 false 不显示', type: 'ReactNode | false', default: "'-'" },
  { prop: 'render', desc: '自定义只读渲染 (text, props, dom) => ReactNode', type: 'Function', default: '-' },
  { prop: 'formItemRender', desc: '自定义编辑渲染 (text, props, dom) => ReactNode', type: 'Function', default: '-' },
  { prop: 'light', desc: '轻量模式（下拉选中后以标签形式展示）', type: 'boolean', default: 'false' },
  { prop: 'request', desc: '从服务端请求选项数据', type: '(params, props) => Promise<Options[]>', default: '-' },
  { prop: 'params', desc: 'request 的额外参数（变化会重新请求）', type: 'Record<string, any>', default: '-' },
  { prop: 'readonly', desc: '强制只读（覆盖 mode）', type: 'boolean', default: 'false' },
]

/* ==================== 各 valueType 特有 Props ==================== */
const specificPropsData: Record<string, { prop: string; desc: string; type: string; default: string }[]> = {
  money: [
    { prop: 'moneySymbol', desc: '是否显示货币符号', type: 'boolean', default: 'true' },
    { prop: 'locale', desc: '国际化 locale', type: 'string', default: "'zh-CN'" },
    { prop: 'customSymbol', desc: '自定义货币符号', type: 'string', default: '-' },
    { prop: 'numberPopoverRender', desc: '金额气泡渲染，false 关闭', type: '((props, text) => ReactNode) | boolean', default: '-' },
    { prop: 'numberFormatOptions', desc: 'Intl.NumberFormat 配置', type: 'object', default: '-' },
  ],
  percent: [
    { prop: 'precision', desc: '小数精度', type: 'number', default: '-' },
    { prop: 'showSymbol', desc: '是否显示 % 符号', type: 'boolean | ((value) => boolean)', default: 'true' },
    { prop: 'showColor', desc: '正绿负红', type: 'boolean', default: 'false' },
    { prop: 'prefix', desc: '前缀', type: 'ReactNode', default: '-' },
    { prop: 'suffix', desc: '后缀', type: 'ReactNode', default: '-' },
  ],
  digit: [
    { prop: 'placeholder', desc: '占位文本', type: 'string', default: "'请输入'" },
  ],
  digitRange: [
    { prop: 'separator', desc: '分隔符', type: 'string', default: "'~'" },
    { prop: 'separatorWidth', desc: '分隔符宽度', type: 'number', default: '30' },
    { prop: 'placeholder', desc: '占位文本', type: 'string | string[]', default: '-' },
  ],
  image: [
    { prop: 'width', desc: '图片宽度', type: 'number', default: '-' },
  ],
  select: [
    { prop: 'debounceTime', desc: '搜索防抖时间 (ms)', type: 'number', default: '10' },
    { prop: 'defaultKeyWords', desc: '默认搜索关键词', type: 'string', default: '-' },
    { prop: 'variant', desc: '变体样式', type: "'outlined' | 'filled' | 'borderless'", default: '-' },
  ],
  tag: [
    { prop: 'separator', desc: '字符串拆分为多个标签时使用的分隔符', type: 'string', default: '-' },
    { prop: 'maxTagCount', desc: '最多展示的标签数量', type: 'number', default: '-' },
    { prop: 'tagProps', desc: 'Tag 属性或按标签返回属性的函数', type: 'TagProps | Function', default: '-' },
  ],
  second: [
    { prop: 'placeholder', desc: '占位文本', type: 'string', default: "'请输入'" },
  ],
  date: [
    { prop: 'format', desc: '日期格式', type: 'string', default: "'YYYY-MM-DD'" },
    { prop: 'showTime', desc: '是否显示时间', type: 'boolean', default: 'false' },
    { prop: 'picker', desc: '选择器类型', type: "'date' | 'week' | 'month' | 'quarter' | 'year'", default: "'date'" },
  ],
  rate: [],
  slider: [],
  switch: [],
  progress: [],
  color: [],
  segmented: [],
  password: [],
  text: [
    { prop: 'placeholder', desc: '占位文本', type: 'string', default: "'请输入'" },
  ],
  textarea: [
    { prop: 'placeholder', desc: '占位文本', type: 'string', default: "'请输入'" },
  ],
  fromNow: [],
  time: [
    { prop: 'format', desc: '时间格式', type: 'string', default: "'HH:mm:ss'" },
  ],
  checkbox: [
    { prop: 'layout', desc: '布局方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  ],
  radio: [
    { prop: 'radioType', desc: 'radio 样式', type: "'radio' | 'button'", default: "'radio'" },
  ],
  cascader: [
    { prop: 'variant', desc: '变体样式', type: "'outlined' | 'borderless' | 'filled'", default: '-' },
  ],
  treeSelect: [
    { prop: 'variant', desc: '变体样式', type: "'outlined' | 'borderless' | 'filled'", default: '-' },
  ],
  code: [],
}

/* ==================== valueType 值列表 ==================== */
const allValueTypes = [
  'text', 'password', 'textarea', 'digit', 'digitRange', 'money', 'percent',
  'progress', 'rate', 'slider', 'switch', 'color', 'second',
  'date', 'dateTime', 'time', 'dateRange', 'fromNow',
  'select', 'radio', 'radioButton', 'checkbox', 'segmented',
  'cascader', 'treeSelect', 'tag', 'image', 'code', 'jsonCode',
]

/* ==================== 状态枚举 ==================== */
const statusEnum = {
  online: { text: '在线', status: 'Success' },
  offline: { text: '离线', status: 'Default' },
  busy: { text: '忙碌', status: 'Warning' },
  error: { text: '异常', status: 'Error' },
}

const tagEnum = {
  design: { text: '设计', color: 'blue' },
  frontend: { text: '前端', color: 'cyan' },
  urgent: { text: '紧急', status: 'Error' },
}

/* ==================== Demo 数据 ==================== */
type DemoItem = {
  label: string
  valueType: string
  defaultText: any
  fieldProps?: Record<string, any>
  valueEnum?: Record<string, any>
}

const demos: DemoItem[] = [
  { label: '文本', valueType: 'text', defaultText: 'Hello TextField' },
  { label: '密码', valueType: 'password', defaultText: 'p@ssw0rd123' },
  { label: '文本域', valueType: 'textarea', defaultText: '这是一段较长的文本内容，可以折行展示。' },
  { label: '数字', valueType: 'digit', defaultText: 12345 },
  { label: '数字范围', valueType: 'digitRange', defaultText: [10, 99] },
  { label: '金额（CNY）', valueType: 'money', defaultText: 88888.88 },
  { label: '百分比', valueType: 'percent', defaultText: 23.45, fieldProps: { precision: 2 } },
  { label: '进度', valueType: 'progress', defaultText: 65 },
  { label: '评分', valueType: 'rate', defaultText: 4 },
  { label: '滑块', valueType: 'slider', defaultText: 30 },
  { label: '开关', valueType: 'switch', defaultText: true },
  { label: '颜色', valueType: 'color', defaultText: '#1677ff' },
  { label: '秒（时长）', valueType: 'second', defaultText: 3725 },
  { label: '日期', valueType: 'date', defaultText: '2026-06-02' },
  { label: '日期时间', valueType: 'dateTime', defaultText: '2026-06-02 10:30:00' },
  { label: '时间', valueType: 'time', defaultText: '10:30:00' },
  { label: '日期范围', valueType: 'dateRange', defaultText: ['2026-01-01', '2026-12-31'] },
  { label: '相对时间', valueType: 'fromNow', defaultText: '2026-05-01 12:00:00' },
  { label: '下拉选择', valueType: 'select', defaultText: 'online', valueEnum: statusEnum },
  { label: '单选', valueType: 'radio', defaultText: 'online', valueEnum: statusEnum },
  { label: '单选按钮', valueType: 'radioButton', defaultText: 'busy', valueEnum: statusEnum },
  { label: '多选', valueType: 'checkbox', defaultText: ['online', 'busy'], valueEnum: statusEnum },
  { label: '标签', valueType: 'tag', defaultText: ['design', 'frontend', 'urgent'], valueEnum: tagEnum },
  { label: '分段控制器', valueType: 'segmented', defaultText: 'offline', valueEnum: statusEnum },
  { label: '图片', valueType: 'image', defaultText: 'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg' },
]

/* ==================== 组件 ==================== */
function ProFieldDemo() {
  const [editMode, setEditMode] = useState(false)
  const mode = editMode ? 'edit' : 'read'

  // 保存每个字段的当前值，编辑后可回显
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {}
    demos.forEach((d) => { init[d.valueType] = d.defaultText })
    return init
  })

  /**
   * 不同 valueType 的 onChange 参数格式不同，统一提取目标值
   * - Input/Textarea:    onChange(e) → e.target.value
   * - DatePicker/Time:   onChange(dayjs, dateString) → dateString (args[1])
   * - RangePicker:       onChange(dayjs[], strings[]) → strings[] (args[1])
   * - ColorPicker:       onChange(Color) → Color.toHexString()
   * - 其余(digit/money/rate/switch/select…): onChange(value) → value
   */
  const extractValue = useCallback((valueType: string, ...args: any[]): any => {
    const first = args[0]
    // Input / Textarea / Password event
    if (first?.target !== undefined) return first.target.value
    // ColorPicker Color 对象
    if (first && typeof first.toHexString === 'function') return first.toHexString()
    // RangePicker: (dayjs[], strings[])
    const rangeTypes = ['dateRange', 'dateTimeRange', 'timeRange', 'dateWeekRange', 'dateMonthRange', 'dateQuarterRange', 'dateYearRange']
    if (rangeTypes.includes(valueType) && Array.isArray(args[1])) return args[1]
    // DatePicker / TimePicker: (dayjs, string)
    const dateTypes = ['date', 'dateTime', 'time', 'dateWeek', 'dateMonth', 'dateQuarter', 'dateYear', 'fromNow']
    if (dateTypes.includes(valueType) && typeof args[1] === 'string') return args[1]
    // 其余直接返回第一个参数
    return first
  }, [])

  const handleChange = useCallback((valueType: string) => (...args: any[]) => {
    const val = extractValue(valueType, ...args)
    setValues((prev) => ({ ...prev, [valueType]: val }))
  }, [extractValue])

  const handleReset = useCallback(() => {
    const init: Record<string, any> = {}
    demos.forEach((d) => { init[d.valueType] = d.defaultText })
    setValues(init)
  }, [])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 标题 */}
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          TextField 示例
        </Title>
        <Paragraph style={{ color: '#666' }}>
          TextField 是一个原子字段组件，通过 <Text code>valueType</Text> 切换不同类型的展示／编辑形态。
          编辑模式下修改数据后，切换回只读模式会展示修改后的值。<br/>
          <Typography.Title level={4} mark italic type={'danger'}>
            这一个组件就能完成表单90%的功能，非常强大，行业首创，遥遥领先！
          </Typography.Title>
        </Paragraph>
        <Space wrap>
          <Text strong>编辑模式：</Text>
          <Switch checked={editMode} onChange={setEditMode} />
          <Text type="secondary">当前模式：{mode}</Text>
          <Button size="small" onClick={handleReset}>重置数据</Button>
        </Space>
      </Card>

      {/* 字段总览 */}
      <Card title="字段总览">
        <Row gutter={[16, 16]}>
          {demos.map((item) => (
            <Col span={8} key={item.valueType}>
              <div
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 16,
                  height: '100%',
                  background: '#fafafa',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{item.label}</Text>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    valueType=&quot;{item.valueType}&quot;
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ background: '#fff', padding: 8, borderRadius: 4, minHeight: 36 }}>
                  <TextField
                    mode={mode}
                    valueType={item.valueType as any}
                    text={values[item.valueType]}
                    value={values[item.valueType]}
                    onChange={handleChange(item.valueType)}
                    fieldProps={item.fieldProps}
                    valueEnum={item.valueEnum as any}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 公共 Props 配置表 */}
      <Card title="公共 Props（TextField 通用）">
        <Table
          dataSource={commonPropsData}
          columns={commonPropsColumns}
          rowKey="prop"
          size="small"
          pagination={false}
          bordered
        />
      </Card>

      {/* 各 valueType 特有 Props */}
      <Card title="各 valueType 特有 Props">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {allValueTypes
            .filter((vt) => specificPropsData[vt] && specificPropsData[vt].length > 0)
            .map((vt) => (
              <div key={vt}>
                <Tag color="blue" style={{ marginBottom: 8 }}>
                  valueType=&quot;{vt}&quot;
                </Tag>
                <Table
                  dataSource={specificPropsData[vt]}
                  columns={commonPropsColumns}
                  rowKey="prop"
                  size="small"
                  pagination={false}
                  bordered
                />
              </div>
            ))}
        </Space>
      </Card>

      {/* valueType 完整列表 */}
      <Card title="valueType 完整列表">
        <Space wrap>
          {allValueTypes.map((vt) => (
            <Tag key={vt} color="processing">{vt}</Tag>
          ))}
        </Space>
      </Card>

      {/* 自定义 render */}
      <Card title="自定义 render（只读时高亮金额）">
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextField
            mode={mode}
            valueType="money"
            text={values.money}
            value={values.money}
            onChange={handleChange('money')}
            render={(_: any, _2: any, dom: React.ReactNode) => (
              <span style={{ color: '#cf1322', fontWeight: 600 }}>{dom}</span>
            )}
          />
          <TextField
            mode={mode}
            valueType="percent"
            text={-12.5}
            fieldProps={{ precision: 1 }}
          />
        </Space>
      </Card>

      {/* 空值占位 */}
      <Card title="空值占位">
        <Space direction="vertical">
          <div>
            <Text type="secondary">无 emptyText（默认 -）：</Text>
            <TextField mode="read" valueType="text" text={undefined} />
          </div>
          <div>
            <Text type="secondary">自定义 emptyText：</Text>
            <TextField mode="read" valueType="text" text={undefined} emptyText="暂无数据" />
          </div>
        </Space>
      </Card>
    </Space>
  )
}

export default ProFieldDemo
