import {useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction} from 'react'
import {Alert, Button, Card, Modal, Popconfirm, Tag, Tooltip, Typography} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined, SettingOutlined} from '@ant-design/icons'
import {TextField} from 'xc-antd'
import {getBatchDates, getOtherTimeRanges, pricePeriods} from './ticketRuleUtils'

type Choices = readonly (readonly [string, string])[]
type TimeRange = [string, string] | null

const radioButtonClass = 'inline-flex flex-wrap [&_.ant-radio-button-wrapper]:min-w-[116px] [&_.ant-radio-button-wrapper]:text-center max-[600px]:[&_.ant-radio-button-wrapper]:min-w-0 max-[600px]:[&_.ant-radio-button-wrapper]:px-2.5'
const compactRadioButtonClass = 'inline-flex flex-wrap [&_.ant-radio-button-wrapper]:min-w-[50px] [&_.ant-radio-button-wrapper]:px-2 [&_.ant-radio-button-wrapper]:text-center'
const ruleCardClass = 'w-full min-w-0 scroll-mt-5 border-[#d9d9d9] [&_.ant-card-head]:min-h-[46px]'
const ruleContentClass = 'grid min-w-0 grid-cols-1 justify-items-start gap-3.5 [&>*]:min-w-0 [&>*]:max-w-full [&>.ant-alert]:w-full [&>.ant-btn-block]:w-full'
const ruleRowClass = 'flex w-full flex-wrap items-center gap-x-3.5 gap-y-2.5 [&>label]:inline-flex [&>label]:flex-wrap [&>label]:items-center [&>label]:gap-2'
const subpanelClass = 'grid w-full grid-cols-1 gap-3 rounded-md bg-[#f7f7f7] p-4 [&[hidden]]:hidden'
const priceGridClass = 'grid min-w-[880px] grid-cols-[180px_250px_100px_100px_100px_70px] items-center gap-2'
const priceRowClass = `${priceGridClass} border border-[#e5e5e5] p-2 [&_.ant-radio-button-wrapper]:min-w-[50px] [&_.ant-radio-button-wrapper]:px-2`
const dayGridCheckboxClass = [
    'grid! w-full grid-cols-7 gap-0 border-l border-t border-[#d9d9d9]',
    '[&_.ant-checkbox-wrapper]:m-0 [&_.ant-checkbox-wrapper]:flex [&_.ant-checkbox-wrapper]:min-h-[46px]',
    '[&_.ant-checkbox-wrapper]:items-center [&_.ant-checkbox-wrapper]:justify-center',
    '[&_.ant-checkbox-wrapper]:border-r [&_.ant-checkbox-wrapper]:border-b [&_.ant-checkbox-wrapper]:border-[#d9d9d9]',
    '[&_.ant-checkbox]:absolute [&_.ant-checkbox]:size-px [&_.ant-checkbox]:opacity-0',
    '[&_.ant-checkbox-wrapper>span:last-child]:p-0 [&_.ant-checkbox-wrapper>span:last-child]:whitespace-nowrap',
    '[&_.ant-checkbox-wrapper-checked]:bg-[#1677ff] [&_.ant-checkbox-wrapper-checked]:text-white!',
    '[&_.ant-checkbox-wrapper:focus-within]:outline-2 [&_.ant-checkbox-wrapper:focus-within]:outline-offset-[-2px]',
    '[&_.ant-checkbox-wrapper:focus-within]:outline-[#0958d9]',
].join(' ')

const choicesToEnum = (choices: Choices) =>
    Object.fromEntries(choices.map(([value, label]) => [value, {text: label}]))

const limitedChoices = [['none', '不限制'], ['limited', '限制']] as const
const identityChoices = [
    ['id', '身份证'], ['residence', '外国人永久居留证'], ['hkmo', '港澳通行证'],
    ['taiwan', '台湾通行证'], ['passport', '护照'],
] as const

function Choice({value, onChange, options, compact = false}: {
    value: string
    onChange: (value: string) => void
    options: Choices
    compact?: boolean
}) {
    return <TextField mode="edit" valueType="radioButton" value={value}
                      onChange={(event: { target: { value: string } }) => onChange(event.target.value)}
                      valueEnum={choicesToEnum(options)} fieldProps={{buttonStyle: 'solid', className: compact ? compactRadioButtonClass : radioButtonClass}}/>
}

function SelectField({value, onChange, options, placeholder = '请选择', multiple = false, width = 260}: {
    value: string | string[] | undefined
    onChange: (value: string | string[]) => void
    options: Choices
    placeholder?: string
    multiple?: boolean
    width?: number | string
}) {
    return <TextField mode="edit" valueType="select" value={value} onChange={onChange}
                      valueEnum={choicesToEnum(options)} fieldProps={{
        mode: multiple ? 'multiple' : undefined,
        allowClear: false, showSearch: true, optionFilterProp: 'label', placeholder, style: {width, maxWidth: '100%'}
    }}/>
}

function CheckField({value, onChange, options, dayGrid = false}: {
    value: string[]
    onChange: (value: string[]) => void
    options: Choices
    dayGrid?: boolean
}) {
    return <TextField mode="edit" valueType="checkbox" value={value} onChange={onChange}
                      valueEnum={choicesToEnum(options)} fieldProps={{className: dayGrid ? dayGridCheckboxClass : 'flex! flex-wrap gap-x-4 gap-y-2'}}/>
}

function DigitField({value, onChange, min = 0, max, width = 92, placeholder, disabled, precision = 0}: {
    value: number | null
    onChange: (value: number | null) => void
    min?: number
    max?: number
    width?: number
    placeholder?: string
    disabled?: boolean
    precision?: number
}) {
    return <TextField mode="edit" valueType="digit" value={value} onChange={onChange}
                      fieldProps={{min, max, precision, placeholder, disabled, style: {width}}}/>
}

function SwitchField({value, onChange}: { value: boolean; onChange: (value: boolean) => void }) {
    return <TextField mode="edit" valueType="switch" value={value} onChange={onChange}/>
}

function TimeField({value, onChange}: { value: TimeRange; onChange: (value: TimeRange) => void }) {
    return <TextField mode="edit" valueType="timeRange" format="HH:mm" value={value}
                      onChange={(_times: unknown, strings?: [string, string] | null) =>
                          onChange(strings?.[0] && strings?.[1] ? [strings[0], strings[1]] : null)}
                      fieldProps={{allowClear: true, minuteStep: 15, style: {width: 248, maxWidth: '100%'}}}/>
}

function RuleCard({title, children, hint, id}: {
    title: string
    children: ReactNode
    hint?: ReactNode
    id: string
}) {
    return <Card className={ruleCardClass} title={title} id={id} size="small">
        <div className={ruleContentClass}>{children}</div>
        {hint && <Typography.Text type="secondary" className="mt-3 block">{hint}</Typography.Text>}
    </Card>
}

function FieldRow({children, style}: { children: ReactNode; style?: CSSProperties }) {
    return <div className={ruleRowClass} style={style}>{children}</div>
}

function AddedTags({values, options, onRemove, invalidValues = []}: {
    values: string[]
    options: Choices
    onRemove: (value: string) => void
    invalidValues?: string[]
}) {
    const labels = new Map(options)
    return <div className="grid w-full gap-2">
        <Typography.Text type="secondary">已添加：</Typography.Text>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2">{values.length ? values.map((value) =>
            <Tag key={value} className="m-0 max-w-full break-all whitespace-normal px-2 py-1" color={invalidValues.includes(value) ? 'orange' : undefined}
                 closable onClose={() => onRemove(value)}>{labels.get(value) ?? value}</Tag>
        ) : <Typography.Text type="secondary">暂无</Typography.Text>}</div>
    </div>
}

function TicketTypeCard({type, setType}: { type: string; setType: (type: string) => void }) {
    return <RuleCard id="ticket-type" title="门票类型" hint="决定门票载体，也是后续发送方式和制码规则的前置条件。">
        <Choice value={type} onChange={setType} options={[
            ['electronic', '电子票'], ['paper', '纸质预制票'], ['print', '纸质机打票'],
        ]}/>
        <Button type="link" icon={<SettingOutlined/>}
                onClick={() => document.getElementById('ticket-code')?.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth'
                })}>
            门票编码规则
        </Button>
    </RuleCard>
}

function DeliveryCard({ticketType}: { ticketType: string }) {
    const [method, setMethod] = useState('smsWechat')
    const [smsTemplate, setSmsTemplate] = useState<string | undefined>()
    const [wechatTemplate, setWechatTemplate] = useState<string | undefined>()
    const needsSms = method.toLowerCase().includes('sms')
    const needsWechat = method.toLowerCase().includes('wechat')
    return <RuleCard id="delivery" title="电子票发送" hint="仅门票类型为电子票时使用；示例模板为本地数据。">
        <Alert type="warning" banner title="门票类型设为电子票时，才需进行发送设置。"/>
        {ticketType === 'electronic' && <><Choice value={method} onChange={setMethod} options={[
            ['none', '不发送'], ['sms', '短信'], ['email', '邮件'], ['wechat', '微信'],
            ['smsEmail', '短信+邮件'], ['smsWechat', '短信+微信'],
        ]}/>
            {(needsSms || needsWechat) && <FieldRow>
                {needsSms &&
                    <label>短信模板 <SelectField value={smsTemplate} onChange={(v) => setSmsTemplate(v as string)}
                                                 options={[["order", '购票成功通知'], ['qrcode', '电子票二维码通知']]}/></label>}
                {needsWechat && <label>小程序模板 <SelectField value={wechatTemplate}
                                                               onChange={(v) => setWechatTemplate(v as string)}
                                                               options={[["mini", '小程序购票成功通知'], ['entry', '入园提醒']]}/></label>}
            </FieldRow>}</>}
    </RuleCard>
}

function IdentityCard() {
    const [required, setRequired] = useState('required')
    const [identities, setIdentities] = useState<string[]>([])
    return <RuleCard id="identity" title="购票证件要求" hint="需要证件时，多选满足其中一种即可。">
        <Choice value={required} onChange={setRequired} options={[["none", '不需要'], ['required', '需要']]}/>
        {required === 'required' && <CheckField value={identities} onChange={setIdentities} options={identityChoices}/>}
    </RuleCard>
}

function PeopleCard() {
    const [mode, setMode] = useState('many')
    const [maximum, setMaximum] = useState<number | null>(3)
    return <RuleCard id="people" title="人/张类型" hint="一票多人适用于家庭套票或团队票。">
        <FieldRow><Choice value={mode} onChange={setMode} options={[["one", '一票一人'], ['many', '一票多人']]}/>
            {mode === 'many' && <label>至多 <DigitField value={maximum} onChange={setMaximum} min={2}/> 人</label>}
        </FieldRow>
    </RuleCard>
}

function AdvanceMinCard() {
    const [mode, setMode] = useState('limited')
    const [days, setDays] = useState<number | null>(1)
    const [hours, setHours] = useState<number | null>(0)
    const [minutes, setMinutes] = useState<number | null>(0)
    return <RuleCard id="advance-min" title="提前预约时间" hint="最短提前量：例如提前 1 天，游客当天不能购买当天的票。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' && <><FieldRow>
            <span>提前</span><label><DigitField value={days} onChange={setDays} max={365}/> 天</label>
            <label><DigitField value={hours} onChange={setHours} max={23}/> 时</label>
            <label><DigitField value={minutes} onChange={setMinutes} max={59}/> 分</label>
        </FieldRow><Alert type="warning" banner title="购票时至少要提前所填时长，防止临时约。"/></>}
    </RuleCard>
}

function AdvanceMaxCard() {
    const [mode, setMode] = useState('limited')
    const [days, setDays] = useState<number | null>(30)
    return <RuleCard id="advance-max" title="至多预约天数" hint="最长提前量：与“提前预约时间”一起确定可预约日期窗口。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' && <><FieldRow><span>最多提前</span>
            <DigitField value={days} onChange={setDays} min={1} max={365}/><span>天可预约</span>
        </FieldRow><Alert type="warning" banner title="例如 30 天：只能购买未来 30 天内的票。"/></>}
    </RuleCard>
}

function PurchaseLimitCard() {
    const [mode, setMode] = useState('limited')
    const [orderEnabled, setOrderEnabled] = useState(false)
    const [orderCount, setOrderCount] = useState<number | null>(1)
    const [quantityEnabled, setQuantityEnabled] = useState(true)
    const [quantityMode, setQuantityMode] = useState('max')
    const [quantity, setQuantity] = useState<number | null>(1)
    const [identifiers, setIdentifiers] = useState<string[]>([])
    return <RuleCard id="purchase-limit" title="购买限制"
                     hint="身份证号、手机号、小程序 openID 多选时按“或”关系识别同一人。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' && <>
            <FieldRow><label><SwitchField value={orderEnabled} onChange={setOrderEnabled}/> 同一人最多购买单数</label>
                <DigitField value={orderCount} onChange={setOrderCount} min={1} disabled={!orderEnabled}/>
                <label><SwitchField value={quantityEnabled} onChange={setQuantityEnabled}/> 同一人</label>
                <SelectField value={quantityMode} onChange={(v) => setQuantityMode(v as string)}
                             options={[["max", '至多'], ['min', '至少']]} width={110}/>
                <span>购买张数</span><DigitField value={quantity} onChange={setQuantity} min={1}
                                                 disabled={!quantityEnabled}/>
            </FieldRow>
            <Alert type="warning" banner title="“至多”和“至少”互斥；每个子项的开关决定其限制是否生效。"/>
            <FieldRow><span>“同一人”的身份识别类型</span><CheckField value={identifiers} onChange={setIdentifiers}
                                                                     options={[["id", '身份证号'], ['phone', '手机号'], ['openid', '小程序 openID']]}/></FieldRow>
        </>}
    </RuleCard>
}

interface SaleConfig {
    id: number;
    channel: string;
    slots: { id: number; range: TimeRange }[]
}

const saleChannels = [['window', '窗口'], ['mini', '小程序'], ['kiosk', '自助机'],
    ['merchant', '渠道商'], ['agency', '旅行社'], ['ota', 'OTA']] as const
let nextSaleId = 3

function DailySaleCard() {
    const [mode, setMode] = useState('limited')
    const [configs, setConfigs] = useState<SaleConfig[]>([
        {id: 1, channel: 'window', slots: [{id: 1, range: ['09:00', '12:00']}, {id: 2, range: ['14:00', '16:00']}]},
    ])
    const updateConfig = (id: number, edit: (config: SaleConfig) => SaleConfig) =>
        setConfigs((current) => current.map((config) => config.id === id ? edit(config) : config))
    const invalidConfigs = configs.filter((config) => config.slots.some((slot, index) => {
        if (!slot.range) return false
        const [start, end] = slot.range
        return start >= end || config.slots.some((other, otherIndex) => otherIndex !== index && other.range &&
            start < other.range[1] && end > other.range[0])
    }))
    return <RuleCard id="daily-sale" title="渠道每日可售时间"
                     hint="按渠道配置每天的可售时段；价格日历可售日期仍需同时满足时段限制。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' && <>
            {configs.map((config, index) => <div className="grid w-full gap-3 rounded-md bg-[#f5f5f5] p-3 [&>:first-child]:justify-between" key={config.id}>
                <FieldRow><strong>配置 {index + 1}</strong><Button type="text" danger icon={<DeleteOutlined/>}
                                                                   aria-label={`删除配置 ${index + 1}`}
                                                                   onClick={() => setConfigs((current) => current.filter((item) => item.id !== config.id))}/></FieldRow>
                <SelectField value={config.channel}
                             onChange={(v) => updateConfig(config.id, (item) => ({...item, channel: v as string}))}
                             options={saleChannels} width="100%"/>
                <div className="grid gap-2">{config.slots.map((slot) => <FieldRow key={slot.id}>
                    <TimeField value={slot.range} onChange={(range) => updateConfig(config.id, (item) => ({
                        ...item,
                        slots: item.slots.map((entry) => entry.id === slot.id ? {...entry, range} : entry),
                    }))}/>
                    <Button type="text" danger icon={<DeleteOutlined/>} aria-label="删除时段"
                            onClick={() => updateConfig(config.id, (item) => ({
                                ...item,
                                slots: item.slots.filter((entry) => entry.id !== slot.id),
                            }))}/>
                </FieldRow>)}</div>
                <Button block type="dashed" icon={<PlusOutlined/>} onClick={() => updateConfig(config.id, (item) => ({
                    ...item, slots: [...item.slots, {id: nextSaleId++, range: null}],
                }))}>添加时段</Button>
            </div>)}
            {invalidConfigs.length > 0 &&
                <Alert type="error" title="同一配置中的时段不能重叠，结束时间应晚于开始时间。"/>}
            <Button block type="dashed" icon={<PlusOutlined/>} onClick={() => setConfigs((current) => [
                ...current, {id: nextSaleId++, channel: 'mini', slots: [{id: nextSaleId++, range: null}]},
            ])}>添加配置</Button>
        </>}
    </RuleCard>
}

type AgeMode = 'none' | 'allow' | 'deny'

function AgeCard() {
    const [mode, setMode] = useState<AgeMode>('allow')
    const [minimum, setMinimum] = useState<number | null>(null)
    const [maximum, setMaximum] = useState<number | null>(null)
    const [ranges, setRanges] = useState<[number, number][]>([[6, 18]])
    const complete = minimum !== null && maximum !== null && minimum <= maximum
    const overlaps = complete && ranges.some(([start, end]) => minimum <= end && maximum >= start)
    return <RuleCard id="age" title="购买年龄限制" hint="年龄根据证件出生日期判断；多个区间不可交叉。">
        <Choice value={mode} onChange={(v) => setMode(v as AgeMode)} options={[
            ['none', '不限制'], ['allow', '可购买年龄段'], ['deny', '不可购买年龄段'],
        ]}/>
        {mode !== 'none' && <>
            <FieldRow><DigitField value={minimum} onChange={setMinimum} min={0} max={120} width={140}
                                  placeholder="最小年龄"/>
                <span>～</span><DigitField value={maximum} onChange={setMaximum} min={0} max={120} width={140}
                                          placeholder="最大年龄"/>
                <Button type="primary" disabled={!complete || overlaps} onClick={() => {
                    if (minimum !== null && maximum !== null) setRanges((current) => [...current, [minimum, maximum]])
                    setMinimum(null);
                    setMaximum(null)
                }}>添加</Button></FieldRow>
            {overlaps && <Alert type="warning" title="年龄区间不能与已添加的区间交叉。"/>}
            <AddedTags values={ranges.map(([min, max]) => `${min}～${max}`)}
                       options={ranges.map(([min, max]) => [`${min}～${max}`, `${min}～${max}`])}
                       onRemove={(value) => setRanges((current) => current.filter(([min, max]) => `${min}～${max}` !== value))}/>
        </>}
    </RuleCard>
}

const regions = [
    ['410000', '410000 河南省'], ['110000', '110000 北京市'], ['310000', '310000 上海市'],
    ['370000', '370000 山东省'], ['440000', '440000 广东省'], ['410100', '410100 郑州市'],
] as const

function RegionCard() {
    const [mode, setMode] = useState('allow')
    const [selected, setSelected] = useState<string | undefined>()
    const [added, setAdded] = useState<string[]>(['410000'])
    return <RuleCard id="region" title="购买区域限制" hint="示例使用本地行政区划数据；接入业务时可替换为真实地区数据源。">
        <Choice value={mode} onChange={setMode} options={[
            ['none', '不限制'], ['allow', '可购买区域'], ['deny', '不可购买区域'],
        ]}/>
        {mode !== 'none' && <><FieldRow>
            <SelectField value={selected} onChange={(v) => setSelected(v as string)} options={regions}
                         width={360} placeholder="输入省市县名称或编码搜索"/>
            <Button type="primary" disabled={!selected || added.includes(selected)} onClick={() => {
                if (selected) setAdded((current) => [...current, selected]);
                setSelected(undefined)
            }}>添加</Button></FieldRow>
            <AddedTags values={added} options={regions}
                       onRemove={(value) => setAdded((current) => current.filter((v) => v !== value))}/>
        </>}
    </RuleCard>
}

function GenderCard() {
    const [mode, setMode] = useState('male')
    return <RuleCard id="gender" title="购买性别限制" hint="根据购票证件中的性别信息判断，仅作用于下单环节。">
        <Choice value={mode} onChange={setMode} options={[
            ['none', '不限制'], ['male', '仅男性可买'], ['female', '仅女性可买'],
        ]}/>
    </RuleCard>
}

const productChoices = [['P12728192', '太清成人联票（不含巨峰）（P12728192）'],
    ['P12728193', '巨峰游览票（P12728193）'], ['P12728194', '酒店大床房（P12728194）']] as const

function PrerequisiteCard() {
    const [mode, setMode] = useState('limited')
    const [category, setCategory] = useState('ticket')
    const [selected, setSelected] = useState<string | undefined>()
    const [products, setProducts] = useState<string[]>(['P12728192', 'P12728194'])
    const [relation, setRelation] = useState('all')
    const available = productChoices.filter(([id]) => category === 'hotel' ? id === 'P12728194' : id !== 'P12728194')
    return <RuleCard id="prerequisite" title="购买前置条件限制" hint="已添加的前置产品可选择满足一个或全部。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' && <><FieldRow>
            <SelectField value={category} onChange={(v) => {
                setCategory(v as string);
                setSelected(undefined)
            }}
                         options={[["ticket", '门票业务'], ['hotel', '酒店业务']]} width={150}/>
            <SelectField value={selected} onChange={(v) => setSelected(v as string)} options={available} width={360}/>
            <Button type="primary" disabled={!selected || products.includes(selected)} onClick={() => {
                if (selected) setProducts((current) => [...current, selected]);
                setSelected(undefined)
            }}>添加</Button></FieldRow>
            <AddedTags values={products} options={productChoices}
                       onRemove={(value) => setProducts((current) => current.filter((v) => v !== value))}/>
            <div>关系设置：</div>
            <Choice value={relation} onChange={setRelation} options={[
                ['any', '满足1个即可（或的关系）'], ['all', '全部满足（且的关系）'],
            ]}/>
        </>}
    </RuleCard>
}

const audienceChoices = [['student', '全日制大学生校验'], ['disabled', '青岛市残疾人校验'],
    ['military', '军人身份校验'], ['senior', '老年人身份校验']] as const

function AudienceCard() {
    const [mode, setMode] = useState('limited')
    const [selected, setSelected] = useState<string | undefined>()
    const [audiences, setAudiences] = useState<string[]>(['student', 'disabled'])
    const [relation, setRelation] = useState('all')
    return <RuleCard id="audience" title="特殊人群购买限制"
                     hint="身份校验需要业务平台开通或授权后才能在真实下单链路使用。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' && <><FieldRow>
            <SelectField value={selected} onChange={(v) => setSelected(v as string)} options={audienceChoices}
                         width={360}/>
            <Button type="primary" disabled={!selected || audiences.includes(selected)} onClick={() => {
                if (selected) setAudiences((current) => [...current, selected]);
                setSelected(undefined)
            }}>添加</Button></FieldRow>
            <Typography.Text type="warning">特殊人群验证为二次付费服务，请联系平台客服开通或授权。</Typography.Text>
            <AddedTags values={audiences} options={audienceChoices}
                       onRemove={(value) => setAudiences((current) => current.filter((v) => v !== value))}/>
            <div>关系设置：</div>
            <Choice value={relation} onChange={setRelation} options={[
                ['any', '满足1个即可'], ['all', '全部满足'],
            ]}/>
        </>}
    </RuleCard>
}

const stationChoices = [['A', '售票站点A'], ['B', '售票站点B'], ['C', '售票站点C'],
    ['D', '售票站点D'], ['E', '团队接待站点']] as const
const sellerChoices = [['A1', '售票员A-1'], ['A2', '售票员A-2'], ['Z1', '售票员Z-1'],
    ['M1', '售票员M-1']] as const

function SalesScopeCard({kind, mode, setMode, added, setAdded, invalidValues = []}: {
    kind: 'station' | 'seller'
    mode: string
    setMode: Dispatch<SetStateAction<string>>
    added: string[]
    setAdded: Dispatch<SetStateAction<string[]>>
    invalidValues?: string[]
}) {
    const station = kind === 'station'
    const title = station ? '指定售票站点' : '指定售票员'
    const choices = station ? stationChoices : sellerChoices
    const [selected, setSelected] = useState<string[]>([])
    return <RuleCard id={station ? 'sales-stations' : 'sales-staff'} title={title}
                     hint={station ? '控制哪些线下站点可以出售此票。' : '售票员与所属站点规则需要同时满足。'}>
        <Choice value={mode} onChange={setMode} options={station ? [
            ['none', '不限制'], ['allow', '指定站点可售'], ['deny', '指定站点不可售'],
        ] : [
            ['none', '不限制'], ['allow', '指定售票员可售'], ['deny', '指定售票员不可售'],
        ]}/>
        {mode !== 'none' && <>
            {mode === 'allow' && <Alert type="warning" banner
                                        title={`白名单模式：只有已添加的${station ? '站点' : '售票员'}能出售这张票。`}/>}
            <FieldRow><SelectField value={selected} onChange={(v) => setSelected(v as string[])}
                                   options={choices} multiple width={420}
                                   placeholder={`搜索并选择${station ? '站点' : '售票员'}`}/>
                <Button type="primary" disabled={!selected.length || selected.every((v) => added.includes(v))}
                        onClick={() => {
                            setAdded((current) => [...new Set([...current, ...selected])]);
                            setSelected([])
                        }}>添加</Button>
            </FieldRow>
            <AddedTags values={added} options={choices} invalidValues={invalidValues}
                       onRemove={(value) => setAdded((current) => current.filter((v) => v !== value))}/>
            {!station && invalidValues.length > 0 && <Alert type="warning" banner
                                                            title="橙色售票员所属站点不在可售范围内，实际无法售票；请调整站点规则或售票员名单。"/>}
        </>}
    </RuleCard>
}

function TextInput({value, onChange, placeholder, width = 260}: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    width?: number | string
}) {
    return <TextField mode="edit" valueType="text" value={value}
                      onChange={(event: { target: { value: string } }) => onChange(event.target.value)}
                      fieldProps={{placeholder, style: {width, maxWidth: '100%'}}}/>
}

function DateRangeField({value, onChange}: {
    value: [string, string] | null
    onChange: (value: [string, string] | null) => void
}) {
    return <TextField mode="edit" valueType="dateRange" value={value}
                      onChange={(_dates: unknown, strings?: [string, string] | null) =>
                          onChange(strings?.[0] && strings?.[1] ? [strings[0], strings[1]] : null)}
                      fieldProps={{allowClear: true, style: {width: 320, maxWidth: '100%'}}}/>
}

function DateTimeRangeField({value, onChange}: {
    value: [string, string] | null
    onChange: (value: [string, string] | null) => void
}) {
    return <TextField mode="edit" valueType="dateTimeRange" format="YYYY-MM-DD HH:mm:ss" value={value}
                      onChange={(_dates: unknown, strings?: [string, string] | null) =>
                          onChange(strings?.[0] && strings?.[1] ? [strings[0], strings[1]] : null)}
                      fieldProps={{allowClear: true, style: {width: 400, maxWidth: '100%'}}}/>
}

function TimeOfDayField({value, onChange, disabled, seconds = false}: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    seconds?: boolean
}) {
    return <TextField mode="edit" valueType="time" format={seconds ? 'HH:mm:ss' : 'HH:mm'} value={value}
                      onChange={(_time: unknown, formatted: string) => onChange(formatted || '')}
                      fieldProps={{disabled, allowClear: false, style: {width: seconds ? 150 : 130}}}/>
}

interface RuleTemplate {
    id: string;
    label: string;
    content: string
}

function TemplatePicker({label, initialContent}: { label: string; initialContent: string }) {
    const [templates, setTemplates] = useState<RuleTemplate[]>([
        {id: 'template1', label: '模板A-1', content: initialContent},
        {id: 'template2', label: '模板A-2', content: initialContent},
    ])
    const [selected, setSelected] = useState<string | null>('template1')
    const [editing, setEditing] = useState<{ id: string | null; label: string; content: string } | null>(null)
    const canSave = Boolean(editing?.label.trim() && editing.content.trim()) &&
        !templates.some((template) => template.id !== editing?.id && template.label === editing?.label.trim())
    return <div className="grid w-full grid-cols-1 gap-3">
        <FieldRow><Typography.Text strong>{label}</Typography.Text>
            <Button type="link" icon={<PlusOutlined/>}
                    onClick={() => setEditing({id: null, label: '', content: initialContent})}>新增模板</Button>
        </FieldRow>
        <TextField mode="edit" valueType="select" value={selected} onChange={setSelected}
                   fieldProps={{
                       options: templates.map((template) => ({value: template.id, label: template.label})),
                       showSearch: true, optionFilterProp: 'label', allowClear: true, style: {width: '100%'},
                       optionRender: (option: { value: string; label: string }) => <div
                           className="flex items-center justify-between gap-3">
                           <span className="break-all whitespace-normal">{option.label}</span>
                           <span className="shrink-0" onMouseDown={(event) => event.preventDefault()}
                                 onClick={(event) => event.stopPropagation()}>
            <Tooltip title="编辑模板"><Button type="text" size="small" aria-label={`编辑${option.label}`}
                                              icon={<EditOutlined/>}
                                              onClick={() => {
                                                  const template = templates.find((item) => item.id === option.value);
                                                  if (template) setEditing(template)
                                              }}/></Tooltip>
            <Popconfirm title="删除此模板？" okText="删除" cancelText="取消" onConfirm={() => {
                setTemplates((current) => current.filter((item) => item.id !== option.value))
                if (selected === option.value) setSelected(null)
            }}><Tooltip title="删除模板"><Button type="text" danger size="small" aria-label={`删除${option.label}`}
                                                 icon={<DeleteOutlined/>}/></Tooltip></Popconfirm>
          </span>
                       </div>,
                   }}/>
        {selected && <TextField mode="read" valueType="textarea"
                                text={templates.find((item) => item.id === selected)?.content}/>}
        <Modal open={Boolean(editing)} title={`${editing?.id ? '编辑' : '新增'}${label}`}
               onCancel={() => setEditing(null)}
               footer={<FieldRow><Button type="primary" disabled={!canSave} onClick={() => {
                   if (!editing || !canSave) return
                   const next = {
                       id: editing.id ?? `template-${Date.now()}`,
                       label: editing.label.trim(),
                       content: editing.content.trim()
                   }
                   setTemplates((current) => editing.id ? current.map((item) => item.id === editing.id ? next : item) : [...current, next])
                   setSelected(next.id)
                   setEditing(null)
               }}>保存</Button><Button onClick={() => setEditing(null)}>取消</Button></FieldRow>}>
            <div className="grid w-full grid-cols-1 gap-3 [&>label]:grid [&>label]:gap-1.5">
                <label>模板名称<TextInput value={editing?.label ?? ''}
                                          onChange={(value) => setEditing((current) => current ? {
                                              ...current,
                                              label: value
                                          } : current)} placeholder="模板名称" width="100%"/></label>
                <label>模板内容<TextField mode="edit" valueType="textarea" value={editing?.content ?? ''}
                                          onChange={(event: {
                                              target: { value: string }
                                          }) => setEditing((current) => current ? {
                                              ...current,
                                              content: event.target.value
                                          } : current)}
                                          fieldProps={{rows: 4}}/></label>
            </div>
        </Modal>
    </div>
}

function RefundLimitCard() {
    const [mode, setMode] = useState('conditional')
    const [condition, setCondition] = useState('beforeStart')
    const [values, setValues] = useState<Record<string, number | null>>({beforeStart: 1, beforeUse: 1, afterEnd: 1})
    const [times, setTimes] = useState<Record<string, string>>({
        beforeStart: '23:59',
        beforeUse: '23:59',
        afterEnd: '23:59'
    })
    const conditionOptions = [
        ['beforeStart', '截止有效期，开始日期前（未到使用时间）'],
        ['beforeUse', '截止有效期，结束日期前（使用时间）'],
        ['afterEnd', '截止有效期，结束日期后（已过期）'],
    ] as const
    return <RuleCard id="refund-limit" title="退订限制"
                     hint="不可退、随时退、有条件退三种模式；有条件退只允许选择一个时间条件。">
        <Choice value={mode} onChange={setMode} options={[
            ['never', '不可退'], ['anytime', '随时退'], ['conditional', '有条件退'],
        ]}/>
        {mode === 'conditional' && <div className={subpanelClass}>
            <Typography.Text strong>* 退订条件（单选）</Typography.Text>
            {conditionOptions.map(([value, label]) => <FieldRow key={value}>
                <TextField mode="edit" valueType="checkbox" value={condition === value ? [value] : []}
                           onChange={(next: string[]) => {
                               if (next.length) setCondition(value)
                           }}
                           valueEnum={{[value]: {text: label}}}/>
                <DigitField value={values[value]}
                            onChange={(next) => setValues((current) => ({...current, [value]: next}))} min={0}
                            width={86} disabled={condition !== value}/>
                <span>天的</span><TimeOfDayField value={times[value]} onChange={(next) => setTimes((current) => ({
                ...current,
                [value]: next
            }))} disabled={condition !== value}/><span>前可退</span>
            </FieldRow>)}
        </div>}
    </RuleCard>
}

function RefundReviewCard() {
    const [value, setValue] = useState('manual')
    return <RuleCard id="refund-review" title="退订审核" hint="无审核时满足条件自动退款；人工审核时进入待审列表。">
        <Choice value={value} onChange={setValue} options={[["auto", '无需审核'], ['manual', '需人工审核']]}/>
    </RuleCard>
}

function PartialRefundCard() {
    const [value, setValue] = useState('deny')
    return <RuleCard id="partial-refund" title="部分退订" hint="支持部分退订时，一笔订单可以只退其中部分门票。">
        <Choice value={value} onChange={setValue} options={[["allow", '支持部分退'], ['deny', '不支持部分退']]}/>
    </RuleCard>
}

function RefundFeeCard() {
    const [mode, setMode] = useState('perTicket')
    const [feeMode, setFeeMode] = useState('fixed')
    const [ticketFee, setTicketFee] = useState<number | null>(1)
    const [orderFee, setOrderFee] = useState<number | null>(1)
    const [ticketPercent, setTicketPercent] = useState<number | null>(1)
    const [orderPercent, setOrderPercent] = useState<number | null>(1)
    const [tiers, setTiers] = useState([{id: 1, days: 1, time: '23:59', fee: 1, unit: 'yuan'}])
    return <RuleCard id="refund-fee" title="退订手续费"
                     hint="手续费支持固定金额、固定百分比和阶梯方式；按退订订单收取时不支持阶梯方式。">
        <Choice value={mode} onChange={(next) => {
            setMode(next);
            if (next === 'perOrder' && feeMode === 'tiered') setFeeMode('fixed')
        }} options={[
            ['none', '不收手续费'], ['perTicket', '按单张门票收取'], ['perOrder', '按退订单收取'],
        ]}/>
        {mode !== 'none' && <>
            <Alert type="warning" banner title="不收手续费时，下面的手续费模式不显示；按退订单收取时不显示阶梯方式。"/>
            <Choice value={feeMode} onChange={setFeeMode} options={mode === 'perOrder' ? [
                ['fixed', '固定金额'], ['percent', '固定百分比'],
            ] : [['fixed', '固定金额'], ['percent', '固定百分比'], ['tiered', '阶梯方式']]}/>
            {feeMode === 'fixed' && <FieldRow>
                <span>{mode === 'perTicket' ? '每一张门票，收取' : '每一笔退订单，收取'}</span>
                <DigitField value={mode === 'perTicket' ? ticketFee : orderFee}
                            onChange={mode === 'perTicket' ? setTicketFee : setOrderFee} width={110}
                            precision={2}/><span>元手续费</span>
            </FieldRow>}
            {feeMode === 'percent' && <FieldRow>
                <span>{mode === 'perTicket' ? '每一张门票，按实付金额的' : '每一笔退订单总金额的'}</span>
                <DigitField value={mode === 'perTicket' ? ticketPercent : orderPercent}
                            onChange={mode === 'perTicket' ? setTicketPercent : setOrderPercent} max={100} width={90}
                            precision={2}/><span>%收取</span>
            </FieldRow>}
            {feeMode === 'tiered' && <div className={subpanelClass}>
                {tiers.map((tier, index) => <FieldRow key={tier.id}>
                    <span>{index === 0 ? '截止有效期，开始日期前' : '开始日期前'} </span>
                    <DigitField value={tier.days}
                                onChange={(next) => setTiers((current) => current.map((item) => item.id === tier.id ? {
                                    ...item,
                                    days: next ?? 0
                                } : item))} width={70}/>
                    <span>天的</span><TimeOfDayField value={tier.time}
                                                     onChange={(next) => setTiers((current) => current.map((item) => item.id === tier.id ? {
                                                         ...item,
                                                         time: next
                                                     } : item))}/>
                    <span>每张门票收取</span><DigitField value={tier.fee}
                                                         onChange={(next) => setTiers((current) => current.map((item) => item.id === tier.id ? {
                                                             ...item,
                                                             fee: next ?? 0
                                                         } : item))} width={80} precision={2}/>
                    <Choice value={tier.unit}
                            onChange={(next) => setTiers((current) => current.map((item) => item.id === tier.id ? {
                                ...item,
                                unit: next
                            } : item))} options={[["yuan", '元'], ['percent', '%']]}/>
                    <Button danger type="text" icon={<DeleteOutlined/>} disabled={tiers.length === 1}
                            onClick={() => setTiers((current) => current.filter((item) => item.id !== tier.id))}/>
                </FieldRow>)}
                <Button type="link" icon={<PlusOutlined/>} onClick={() => setTiers((current) => [...current, {
                    id: Date.now(),
                    days: 2,
                    time: '23:59',
                    fee: 1,
                    unit: 'yuan'
                }])}>添加</Button>
            </div>}
        </>}
    </RuleCard>
}

function TicketCodeCard({ticketType, setTicketType}: { ticketType: string; setTicketType: (value: string) => void }) {
    const [paperMode, setPaperMode] = useState('precode')
    const [electronicMode, setElectronicMode] = useState('custom')
    const [generate, setGenerate] = useState('yes')
    const [code, setCode] = useState('')
    const [length, setLength] = useState<number | null>(6)
    const [prefix, setPrefix] = useState('')
    const [suffix, setSuffix] = useState('')
    const validCode = /^[A-HJ-NP-Z1-9]{1,4}$/i.test(code)
    const validLength = length !== null && Number.isInteger(length) && length >= 1 && length <= 10
    const sample = validCode && validLength ? `${prefix}${code}${'1'.padStart(length, '0')}${suffix}` : ''
    return <RuleCard id="ticket-code" title="门票制码类型"
                     hint="电子票、纸质预制票、纸质机打票三选一，并按票种配置对应的制码方式。">
        <Choice value={ticketType} onChange={setTicketType} options={[
            ['electronic', '电子票'], ['paper', '纸质预制票'], ['print', '纸质机打票'],
        ]}/>
        <div className={subpanelClass} hidden={ticketType !== 'print'}>
            <TemplatePicker label="机打票模板" initialContent={'门票：{票名称}\n票号：{票号}'}/>
        </div>
        {ticketType === 'paper' && <div className={subpanelClass}>
            <Typography.Text strong>预制票模式</Typography.Text><Choice value={paperMode} onChange={setPaperMode}
                                                                        options={[["precode", '预制码'], ['random', '任意码']]}/>
            {paperMode === 'precode' ?
                <SpaceFields label="票代号" value={code} setValue={setCode} placeholder="请输入1至4位英文或数字"/> :
                <Alert type="warning" banner title="任意码说明：不限制编码规则，销售时直接填写打印码。"/>}
            {paperMode === 'precode' && <><FieldRow><span>票序号长度</span><DigitField value={length}
                                                                                       onChange={setLength} min={1}
                                                                                       max={10} width={180}
                                                                                       placeholder="请输入（1~10的整数）"/></FieldRow><SpaceFields
                label="票号前缀" value={prefix} setValue={setPrefix} placeholder="可不填"/><SpaceFields label="票号后缀"
                                                                                                        value={suffix}
                                                                                                        setValue={setSuffix}
                                                                                                        placeholder="可不填"/><FieldRow><span>示例</span><TextField
                mode="read" valueType="text" text={sample}/></FieldRow></>}
        </div>}
        {ticketType === 'electronic' && <div className={subpanelClass}>
            <Typography.Text strong>电子票码生成模式</Typography.Text><Choice value={electronicMode}
                                                                              onChange={setElectronicMode}
                                                                              options={[["custom", '自定义'], ['id', '购票证件号']]}/>
            {electronicMode === 'custom' && <><SpaceFields label="票代号" value={code} setValue={setCode}
                                                           placeholder="请输入1至4位英文或数字"/><FieldRow><span>票序号长度</span><DigitField
                value={length} onChange={setLength} min={1} max={10} width={180}
                placeholder="请输入（1~10的整数）"/></FieldRow><SpaceFields label="票号前缀" value={prefix}
                                                                          setValue={setPrefix}
                                                                          placeholder="可不填"/><SpaceFields
                label="票号后缀" value={suffix} setValue={setSuffix}
                placeholder="可不填"/><FieldRow><span>示例</span><TextField mode="read" valueType="text" text={sample}/></FieldRow></>}
            <Typography.Text strong>电子票码生成二维码</Typography.Text><Choice value={generate} onChange={setGenerate}
                                                                                options={[["yes", '生成'], ['no', '不生成']]}/>
        </div>}
        {(ticketType === 'electronic' && electronicMode === 'custom' || ticketType === 'paper' && paperMode === 'precode') && <>
            {code && !validCode && <Alert type="error" title="票代号需为1至4位英文或数字，不能包含 I、O、0。"/>}
        </>}
    </RuleCard>
}

function SpaceFields({label, value, setValue, placeholder}: {
    label: string;
    value: string;
    setValue: (value: string) => void;
    placeholder?: string
}) {
    return <FieldRow><Typography.Text style={{width: 100, textAlign: 'right'}}>{label}</Typography.Text><TextInput
        value={value} onChange={setValue} placeholder={placeholder} width={420}/></FieldRow>
}

function ActivationCard() {
    const [value, setValue] = useState('staff')
    return <RuleCard id="activation" title="产品激活方式" hint="票什么时候算“激活生效”，决定有效期的起算点。">
        <Choice value={value} onChange={setValue} options={[
            ['sale', '售出激活'], ['pickup', '取票激活'], ['staff', '人工激活'], ['checkin', '签到激活'], ['firstEntry', '初始入园激活'],
        ]}/>
    </RuleCard>
}

function RelativeValidity({label}: { label: string }) {
    const [start, setStart] = useState<(number | null)[]>([0, 0, 0])
    const [end, setEnd] = useState<(number | null)[]>([7, 23, 59])
    const unitLabels = ['天', '时', '分']
    const renderParts = (values: (number | null)[], onChange: Dispatch<SetStateAction<(number | null)[]>>) =>
        values.map((value, index) => <FieldRow key={unitLabels[index]} style={{width: 'auto'}}>
            <DigitField value={value}
                        onChange={(next) => onChange((current) => current.map((part, partIndex) => partIndex === index ? next : part))}
                        min={0} max={index === 0 ? 365 : index === 1 ? 23 : 59} width={68}/>
            <span>{unitLabels[index]}</span>
        </FieldRow>)
    return <FieldRow><span>{label}后</span>{renderParts(start, setStart)}<span>开始</span>
        {renderParts(end, setEnd)}<span>截止</span></FieldRow>
}

function AfterEventValidity({label}: { label: string }) {
    const [amount, setAmount] = useState<number | null>(1)
    const [unit, setUnit] = useState('day')
    const [cutoff, setCutoff] = useState('23:59:59')
    return <FieldRow><span>{label}后时长</span><DigitField value={amount} onChange={setAmount} width={90}/>
        <SelectField value={unit} onChange={(next) => setUnit(next as string)}
                     options={[["day", '天'], ['hour', '时'], ['minute', '分']]} width={100}/>
        {unit === 'day' && <><span>失效截止时间</span><TimeOfDayField value={cutoff} onChange={setCutoff} seconds/></>}
    </FieldRow>
}

function ProductTimeCard() {
    const [mode, setMode] = useState('range')
    const [ranges, setRanges] = useState([{
        id: 1,
        value: ['2026-07-01 06:00:00', '2026-12-30 19:00:00'] as [string, string] | null
    }])
    return <RuleCard id="product-time" title="产品时间设置"
                     hint="门票有效期支持指定时间、按订单创建、按订单支付、按初次核验和按选定游览日期计算。">
        <FieldRow><span>门票有效期</span><SelectField value={mode} onChange={(value) => setMode(value as string)}
                                                      options={[
                                                          ['range', '指定时间内有效'], ['create', '按订单创建成功时间起'], ['pay', '按订单支付成功时间起'],
                                                          ['verify', '按初次核验时间'], ['visit', '按选定游览日期计算'],
                                                      ]} width={400}/></FieldRow>
        <div className={subpanelClass} hidden={mode !== 'range'}>
            {ranges.map((item) => <FieldRow key={item.id}><span>指定日期范围</span><DateTimeRangeField
                value={item.value}
                onChange={(value) => setRanges((current) => current.map((entry) => entry.id === item.id ? {
                    ...entry,
                    value
                } : entry))}/><Button type="text" danger icon={<DeleteOutlined/>} aria-label="删除有效日期范围"
                                      disabled={ranges.length === 1}
                                      onClick={() => setRanges((current) => current.filter((entry) => entry.id !== item.id))}/></FieldRow>)}<Button
            type="link" icon={<PlusOutlined/>}
            onClick={() => setRanges((current) => [...current, {id: Date.now(), value: null}])}>添加</Button>
        </div>
        <div className={subpanelClass} hidden={mode !== 'create'}><RelativeValidity label="创建成功"/></div>
        <div className={subpanelClass} hidden={mode !== 'pay'}><RelativeValidity label="支付成功"/></div>
        <div className={subpanelClass} hidden={mode !== 'verify'}><AfterEventValidity label="核验"/></div>
        <div className={subpanelClass} hidden={mode !== 'visit'}><AfterEventValidity label="选定"/></div>
    </RuleCard>
}

function UsageCountCard() {
    const [mode, setMode] = useState('many')
    const [maxMode, setMaxMode] = useState('limited')
    const [maxCount, setMaxCount] = useState<number | null>(10)
    const [period, setPeriod] = useState<number | null>(1)
    const [periodUnit, setPeriodUnit] = useState('day')
    const [periodQuantity, setPeriodQuantity] = useState<number | null>(365)
    const [perPeriod, setPerPeriod] = useState<number | null>(1)
    return <RuleCard id="usage-count" title="产品使用次数" hint="可设置仅使用一次，或按周期允许多次使用。">
        <Choice value={mode} onChange={setMode} options={[["once", '仅限使用1次'], ['many', '可使用多次']]}/>
        {mode === 'many' && <>
            <FieldRow><span>* 最大通行次数</span><Choice value={maxMode} onChange={setMaxMode}
                                                         options={[["unlimited", '无限'], ['limited', '有限']]}/>
                {maxMode === 'limited' && <DigitField value={maxCount} onChange={setMaxCount} min={1} width={180}
                                                      placeholder="请设置最大通行次数"/>}</FieldRow>
            <FieldRow><span>* 周期</span><DigitField value={period} onChange={setPeriod} min={1} width={180}/>
                <SelectField value={periodUnit} onChange={(next) => setPeriodUnit(next as string)}
                             options={[["day", '天'], ['hour', '时'], ['minute', '分']]} width={100}/></FieldRow>
            <FieldRow><span>* 周期的数量</span><DigitField value={periodQuantity} onChange={setPeriodQuantity} min={1}
                                                           width={180}/></FieldRow>
            <FieldRow><span>* 单周期内最大使用次数</span><DigitField value={perPeriod} onChange={setPerPeriod} min={1}
                                                                     width={180}/></FieldRow>
        </>}
    </RuleCard>
}

function IntervalCard() {
    const [mode, setMode] = useState('limited')
    const [quantity, setQuantity] = useState<number | null>(10)
    const [unit, setUnit] = useState('second')
    return <RuleCard id="use-interval" title="使用时间间隔"
                     hint="同一张票两次刷票之间必须间隔多久，防止连续刷票或多人蹭票。">
        <Choice value={mode} onChange={setMode} options={limitedChoices}/>
        {mode === 'limited' &&
            <FieldRow><span>门票连续使用/核验，中间最短间隔时间</span><DigitField value={quantity} onChange={setQuantity}
                                                                                 width={100}/><SelectField value={unit}
                                                                                                           onChange={(next) => setUnit(next as string)}
                                                                                                           options={[["second", '秒'], ['minute', '分'], ['hour', '时']]}
                                                                                                           width={100}/></FieldRow>}
    </RuleCard>
}

function CheckMethodCard() {
    const [identities, setIdentities] = useState<string[]>([])
    const [others, setOthers] = useState<string[]>([])
    return <RuleCard id="check-method" title="验票方式" hint="选择游客可以使用哪些凭证验票入园，勾选哪个就能用哪个。">
        <FieldRow><span>证件：</span><CheckField value={identities} onChange={setIdentities} options={identityChoices}/></FieldRow>
        <FieldRow><span>其他：</span><CheckField value={others} onChange={setOthers}
                                                options={[["face", '人脸1:N'], ['qrcode', '二维码'], ['ic', 'IC卡'], ['finger', '指纹']]}/></FieldRow>
    </RuleCard>
}

function VerifyTypeCard() {
    const [value, setValue] = useState('face')
    return <RuleCard id="verify-type" title="验证类型" hint="验票时是否验证票与人是同一个人。">
        <Choice value={value} onChange={setValue}
                options={[["none", '不验证'], ['person', '人证比对'], ['face', '人像比对'], ['finger', '指纹比对']]}/>
    </RuleCard>
}

function ReleaseModeCard() {
    const [value, setValue] = useState('oneAfter')
    return <RuleCard id="release-mode" title="放行方式" hint="核验时怎么扣次数，以及先开闸还是先验票。">
        <TextField mode="edit" valueType="radio" value={value}
                   onChange={(event: { target: { value: string } }) => setValue(event.target.value)}
                   valueEnum={choicesToEnum([
                       ['oneAfter', '一检一人 扣除【1】次数，先验票 后开闸'], ['oneBefore', '一检一人 扣除【1】次数，先开闸 后验票'],
                       ['manyAfter', '一检多人 扣除【1】次数，先验票 后开闸'], ['manyAllAfter', '一检多人 扣除【全部】次数，先验票 后开闸'], ['manyAllBefore', '一检多人 扣除【全部】次数，先开闸 后验票'],
                   ])} fieldProps={{layout: 'vertical'}}/>
    </RuleCard>
}

function SuccessPromptCard() {
    const [mode, setMode] = useState('custom')
    return <RuleCard id="success-prompt" title="成功提示" hint="验票通过后向闸机屏幕或语音播报什么内容。">
        <Choice value={mode} onChange={setMode}
                options={[["default", '系统默认'], ['ticketName', '按票名称'], ['custom', '自定义设置']]}/>
        <div className={subpanelClass} hidden={mode !== 'custom'}><TemplatePicker label="成功提示模板"
                                                                                         initialContent="{票名称}，欢迎入园，请通行。"/>
        </div>
    </RuleCard>
}

function InventoryCard() {
    const [mode, setMode] = useState('limited')
    const [value, setValue] = useState<number | null>(100000)
    return <RuleCard id="inventory" title="总库存" hint="门票总可售数量上限；不限时不设上限，限制时所有日期共享总量。">
        <FieldRow><Choice value={mode} onChange={setMode} options={limitedChoices}/>{mode === 'limited' &&
            <DigitField value={value} onChange={setValue} min={0} width={260}/>}</FieldRow>
    </RuleCard>
}

interface BatchRange {
    id: number;
    range: [string, string] | null
}

interface PriceRow {
    id: number;
    period: string;
    stockMode: string;
    stock: number | null;
    cost: number | null;
    line: number | null;
    settlement: number | null
}

const createPriceRows = (): PriceRow[] => [
    {id: 1, period: 'morning', stockMode: 'limited', stock: 500, cost: 60, line: 100, settlement: 80},
    {id: 2, period: 'afternoon', stockMode: 'unlimited', stock: null, cost: 60, line: 100, settlement: 70},
]
const createOtherPrice = (): PriceRow => ({
    id: 0,
    period: 'other',
    stockMode: 'limited',
    stock: 500,
    cost: 60,
    line: 100,
    settlement: 90
})

interface BatchSnapshot {
    dates: string[]
    saleType: string
    priceType: string
    prices: PriceRow[]
    otherPrice: PriceRow | null
}

function BatchSettingsCard() {
    const [ranges, setRanges] = useState<BatchRange[]>([{id: 1, range: ['2024-11-26', '2024-12-31']}, {
        id: 2,
        range: ['2025-01-01', '2025-04-30']
    }])
    const [operation, setOperation] = useState('number')
    const [saleType, setSaleType] = useState('sell')
    const [priceType, setPriceType] = useState('fixed')
    const [selectedDates, setSelectedDates] = useState<string[]>(['3', '5', '10', '12', '17', '19', '24', '26', '31'])
    const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
    const [stockMode, setStockMode] = useState('limited')
    const [stock, setStock] = useState<number | null>(2000)
    const [cost, setCost] = useState<number | null>(60)
    const [linePrice, setLinePrice] = useState<number | null>(100)
    const [settlement, setSettlement] = useState<number | null>(80)
    const [prices, setPrices] = useState<PriceRow[]>(createPriceRows)
    const [sellOtherTimes, setSellOtherTimes] = useState(true)
    const [otherPrice, setOtherPrice] = useState<PriceRow>(createOtherPrice)
    const [saved, setSaved] = useState<BatchSnapshot | null>(null)
    const days = Array.from({length: 31}, (_, index) => String(index + 1))
    const dates = getBatchDates(ranges.map((item) => item.range), operation, selectedDates, selectedWeekdays)
    const canSave = ranges.every((item) => item.range) && dates.length > 0 && (saleType === 'stop' ||
        (priceType === 'fixed' ? settlement !== null && (stockMode !== 'limited' || stock !== null) :
            prices.every((row) => row.settlement !== null && (row.stockMode !== 'limited' || row.stock !== null)) &&
            (!sellOtherTimes || otherPrice.settlement !== null && (otherPrice.stockMode !== 'limited' || otherPrice.stock !== null))))
    const reset = () => {
        setRanges([{id: 1, range: ['2024-11-26', '2024-12-31']}, {id: 2, range: ['2025-01-01', '2025-04-30']}])
        setOperation('number');
        setSelectedDates(['3', '5', '10', '12', '17', '19', '24', '26', '31']);
        setSelectedWeekdays([])
        setSaleType('sell');
        setPriceType('fixed');
        setStockMode('limited');
        setStock(2000)
        setCost(60);
        setLinePrice(100);
        setSettlement(80);
        setPrices(createPriceRows());
        setOtherPrice(createOtherPrice())
        setSellOtherTimes(true);
        setSaved(null)
    }
    return <RuleCard id="batch-settings" title="批量设置"
                     hint="按日期范围批量修改售卖类型、价格库存和结算价格。长图中的按号数、所有日期、按星期为同一页面的不同修改操作状态。">
        <FieldRow><span>*日期范围</span>{ranges.map((item) => <div key={item.id} className="inline-flex min-w-0 max-w-full items-center gap-1.5 [&_.ant-picker]:min-w-0 [&_.ant-picker]:flex-1">
            <DateRangeField value={item.range}
                            onChange={(range) => setRanges((current) => current.map((entry) => entry.id === item.id ? {
                                ...entry,
                                range
                            } : entry))}/>{ranges.length > 1 && <Button type="text" danger icon={<DeleteOutlined/>}
                                                                        onClick={() => setRanges((current) => current.filter((entry) => entry.id !== item.id))}/>}
        </div>)}<Button type="link" icon={<PlusOutlined/>} onClick={() => setRanges((current) => [...current, {
            id: Date.now(),
            range: null
        }])}>添加日期段</Button></FieldRow>
        <FieldRow><span>*修改操作</span><SelectField value={operation}
                                                     onChange={(value) => setOperation(value as string)}
                                                     options={[["number", '按号数'], ['all', '所有日期'], ['weekday', '按星期']]}
                                                     width={460}/></FieldRow>
        {operation === 'number' && <>
            <div className="w-full max-w-[700px]"><CheckField value={selectedDates} onChange={setSelectedDates} dayGrid
                                                         options={days.map((day) => [day, `${day}号`])}/></div>
            <FieldRow><Button type="link" onClick={() => setSelectedDates(days)}>全选</Button><Button type="link"
                                                                                                      onClick={() => setSelectedDates([])}>取消全选</Button><Typography.Text>保存时仅对选择的号数日期进行修改</Typography.Text></FieldRow></>}
        {operation === 'weekday' && <><CheckField value={selectedWeekdays} onChange={setSelectedWeekdays}
                                                  options={[["mon", '星期一'], ['tue', '星期二'], ['wed', '星期三'], ['thu', '星期四'], ['fri', '星期五'], ['sat', '星期六'], ['sun', '星期日']]}/><FieldRow><Button
            type="link"
            onClick={() => setSelectedWeekdays(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])}>全选</Button><Button
            type="link"
            onClick={() => setSelectedWeekdays([])}>取消全选</Button><Typography.Text>保存时仅对选择星期的日期进行修改</Typography.Text></FieldRow></>}
        <FieldRow><span>*售卖类型</span><Choice value={saleType} onChange={setSaleType}
                                                options={[["sell", '可售'], ['stop', '禁止销售']]}/></FieldRow>
        <FieldRow><span>*价格库存类型</span><Choice value={priceType} onChange={setPriceType}
                                                    options={[["fixed", '全天固定价格和库存'], ['period', '多时段价格和库存']]}/></FieldRow>
        {priceType === 'fixed' ? <div className="grid w-full gap-3">
            <FieldRow><span>*日库存</span><Choice value={stockMode} onChange={setStockMode}
                                                  options={[["unlimited", '无限'], ['limited', '有限']]}/>{stockMode === 'limited' &&
                <DigitField value={stock} onChange={setStock} width={180}/>}</FieldRow>
            <FieldRow><span>成本价格</span><DigitField value={cost} onChange={setCost} width={180}
                                                       precision={2}/></FieldRow>
            <FieldRow><span>划线价格</span><DigitField value={linePrice} onChange={setLinePrice} width={180}
                                                       precision={2}/></FieldRow>
            <FieldRow><span>*结算价格</span><DigitField value={settlement} onChange={setSettlement} width={180}
                                                        precision={2}/></FieldRow>
        </div> : <PeriodPriceRows rows={prices} setRows={setPrices} sellOtherTimes={sellOtherTimes}
                                  setSellOtherTimes={setSellOtherTimes}
                                  otherPrice={otherPrice} setOtherPrice={setOtherPrice}/>}
        <FieldRow><Button type="primary" disabled={!canSave} onClick={() => setSaved({
            dates,
            saleType,
            priceType,
            prices: priceType === 'fixed' ? [{
                id: 0,
                period: 'allDay',
                stockMode,
                stock,
                cost,
                line: linePrice,
                settlement
            }] : prices.map((row) => ({...row})),
            otherPrice: priceType === 'period' && sellOtherTimes ? {...otherPrice} : null,
        })}>确认</Button><Button onClick={reset}>取消</Button><Typography.Text
            type="secondary">{dates.length} 个匹配日期</Typography.Text></FieldRow>
        {saved && <><Alert type="success" title={`已保存本页设置，共 ${saved.dates.length} 个日期。`}/>
            <details className="w-full">
                <summary>保存结果</summary>
                <pre className="max-h-[300px] overflow-auto bg-[#f5f5f5] p-3">{JSON.stringify(saved, null, 2)}</pre>
            </details>
        </>}
    </RuleCard>
}

function PeriodPriceRows({rows, setRows, sellOtherTimes, setSellOtherTimes, otherPrice, setOtherPrice}: {
    rows: PriceRow[]
    setRows: Dispatch<SetStateAction<PriceRow[]>>
    sellOtherTimes: boolean
    setSellOtherTimes: (value: boolean) => void
    otherPrice: PriceRow
    setOtherPrice: Dispatch<SetStateAction<PriceRow>>
}) {
    const updateRow = (id: number, edit: (row: PriceRow) => PriceRow) => setRows((current) => current.map((row) => row.id === id ? edit(row) : row))
    const available = Object.keys(pricePeriods).filter((period) => !rows.some((row) => row.period === period))
    const otherRanges = getOtherTimeRanges(rows.map((row) => row.period))
    return <div className="grid w-full grid-cols-1 gap-2 overflow-x-auto">
        <div className={`${priceGridClass} bg-[#f0f0f0] p-2 font-semibold`}>
            <span>* 时间范围信息</span><span>* 时段库存</span><span>成本价格</span><span>划线价格</span><span>* 结算价格</span><span>操作</span>
        </div>
        {rows.map((row) => <div className={priceRowClass} key={row.id}>
            <SelectField value={row.period}
                         onChange={(next) => updateRow(row.id, (current) => ({...current, period: next as string}))}
                         options={Object.entries(pricePeriods).filter(([key]) => key === row.period || available.includes(key)).map(([key, period]) => [key, period.label])}
                         width={170}/>
            <FieldRow><Choice compact value={row.stockMode}
                              onChange={(next) => updateRow(row.id, (current) => ({...current, stockMode: next}))}
                              options={[["unlimited", '无限'], ['limited', '有限']]}/>{row.stockMode === 'limited' &&
                <DigitField value={row.stock}
                            onChange={(next) => updateRow(row.id, (current) => ({...current, stock: next}))}
                            width={90}/>}</FieldRow>
            <DigitField value={row.cost} onChange={(next) => updateRow(row.id, (current) => ({...current, cost: next}))}
                        width={90} precision={2}/>
            <DigitField value={row.line} onChange={(next) => updateRow(row.id, (current) => ({...current, line: next}))}
                        width={90} precision={2}/>
            <DigitField value={row.settlement}
                        onChange={(next) => updateRow(row.id, (current) => ({...current, settlement: next}))} width={90}
                        precision={2}/>
            <Popconfirm title="删除这个时段的价格库存？" okText="删除" cancelText="取消"
                        onConfirm={() => setRows((current) => current.filter((item) => item.id !== row.id))}>
                <Tooltip title="删除时段"><Button type="text" danger disabled={rows.length === 1}
                                                  icon={<DeleteOutlined/>} aria-label="删除价格时段"/></Tooltip>
            </Popconfirm>
        </div>)}
        <Button type="link" icon={<PlusOutlined/>} disabled={!available.length}
                onClick={() => setRows((current) => [...current, {
                    id: Date.now(),
                    period: available[0],
                    stockMode: 'unlimited',
                    stock: null,
                    cost: 60,
                    line: 100,
                    settlement: 90
                }])}>添加</Button>
        <FieldRow><SwitchField value={sellOtherTimes}
                               onChange={setSellOtherTimes}/><span>上方未设置的时间范围也可售卖</span></FieldRow>
        {sellOtherTimes && <div className={priceRowClass}>
            <TextField mode="read" valueType="textarea" text={otherRanges.join('\n')}/>
            <FieldRow><Choice compact value={otherPrice.stockMode}
                              onChange={(stockMode) => setOtherPrice((current) => ({...current, stockMode}))}
                              options={[["unlimited", '无限'], ['limited', '有限']]}/>
                {otherPrice.stockMode === 'limited' && <DigitField value={otherPrice.stock}
                                                                   onChange={(stock) => setOtherPrice((current) => ({
                                                                       ...current,
                                                                       stock
                                                                   }))} width={90}/>}</FieldRow>
            <DigitField value={otherPrice.cost} onChange={(cost) => setOtherPrice((current) => ({...current, cost}))}
                        width={90} precision={2}/>
            <DigitField value={otherPrice.line} onChange={(line) => setOtherPrice((current) => ({...current, line}))}
                        width={90} precision={2}/>
            <DigitField value={otherPrice.settlement}
                        onChange={(settlement) => setOtherPrice((current) => ({...current, settlement}))} width={90}
                        precision={2}/>
            <Button type="text" disabled icon={<DeleteOutlined/>} aria-label="兜底时段不能删除"/>
        </div>}
    </div>
}

export default function TicketRuleCards() {
    const [ticketType, setTicketType] = useState('paper')
    const [stationMode, setStationMode] = useState('allow')
    const [stations, setStations] = useState<string[]>(['A', 'B', 'C', 'D'])
    const [sellerMode, setSellerMode] = useState('allow')
    const [sellers, setSellers] = useState<string[]>(['A1', 'A2', 'Z1', 'M1'])
    const sellerStations: Record<string, string> = {A1: 'A', A2: 'A', Z1: 'Z', M1: 'M'}
    const invalidSellers = stationMode === 'none' ? [] : sellers.filter((seller) => {
        const included = stations.includes(sellerStations[seller])
        return stationMode === 'allow' ? !included : included
    })
    const extensionCards = [
        <RefundLimitCard key="refund-limit"/>,
        <RefundReviewCard key="refund-review"/>,
        <PartialRefundCard key="partial-refund"/>,
        <RefundFeeCard key="refund-fee"/>,
        <TicketCodeCard key="ticket-code" ticketType={ticketType} setTicketType={setTicketType}/>,
        <ActivationCard key="activation"/>,
        <ProductTimeCard key="product-time"/>,
        <UsageCountCard key="usage-count"/>,
        <IntervalCard key="use-interval"/>,
        <CheckMethodCard key="check-method"/>,
        <VerifyTypeCard key="verify-type"/>,
        <ReleaseModeCard key="release-mode"/>,
        <SuccessPromptCard key="success-prompt"/>,
        <InventoryCard key="inventory"/>,
        <BatchSettingsCard key="batch-settings"/>,
    ]
    return <section className="grid w-full min-w-0 grid-cols-1 gap-4" aria-labelledby="ticket-rule-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 [&_.ant-typography]:mb-1"><Typography.Title level={4} id="ticket-rule-title">票务规则配置卡片</Typography.Title>
                <Typography.Paragraph type="secondary">根据提供的长图和分段截图合并实现 30 组票务规则配置。所有字段输入都由
                    TextField 渲染，添加、删除和业务联动由示例页面管理。</Typography.Paragraph></div>
            <Tag className="shrink-0" color="blue">30 组配置</Tag>
        </div>
        <TicketTypeCard type={ticketType} setType={setTicketType}/>
        <DeliveryCard ticketType={ticketType}/>
        <IdentityCard/>
        <PeopleCard/>
        <AdvanceMinCard/>
        <AdvanceMaxCard/>
        <PurchaseLimitCard/>
        <DailySaleCard/>
        <AgeCard/>
        <RegionCard/>
        <GenderCard/>
        <PrerequisiteCard/>
        <AudienceCard/>
        <SalesScopeCard kind="station" mode={stationMode} setMode={setStationMode}
                        added={stations} setAdded={setStations}/>
        <SalesScopeCard kind="seller" mode={sellerMode} setMode={setSellerMode}
                        added={sellers} setAdded={setSellers} invalidValues={invalidSellers}/>
        {extensionCards}
    </section>
}
