import { useState, type ChangeEvent } from 'react'
import { Alert, Button, Card, Col, Descriptions, Row, Space, Tag, Typography } from 'antd'
import { TextField } from 'xc-antd'
import TicketRuleCards from './TicketRuleCards'

const { Paragraph, Text, Title } = Typography

type NumberRange = [number | undefined, number | undefined]
type TimeRange = [string, string] | null

interface BookingRule {
  name: string
  description: string
  status: 'open' | 'paused'
  requiresApproval: boolean
  guestRange: NumberRange
  advanceDays: number | null
  effectiveDate: string | null
  openingHours: TimeRange
}

const statusEnum = {
  open: { text: '开放预约', status: 'Success' },
  paused: { text: '暂停预约', status: 'Default' },
}

const createExampleRule = (): BookingRule => ({
  name: '周末场馆预约',
  description: '每单可预约 1 至 8 人，开放时段内入场。',
  status: 'open',
  requiresApproval: false,
  guestRange: [1, 8],
  advanceDays: 7,
  effectiveDate: '2026-10-01',
  openingHours: ['09:00', '18:00'],
})

const copyRule = (rule: BookingRule): BookingRule => ({
  ...rule,
  guestRange: [...rule.guestRange],
  openingHours: rule.openingHours ? [...rule.openingHours] : null,
})

const usageCode = `type NumberRange = [number | undefined, number | undefined]
const [guestRange, setGuestRange] = useState<NumberRange>([1, 8])
const [openingHours, setOpeningHours] = useState<[string, string] | null>(['09:00', '18:00'])

<TextField
  mode="edit"
  valueType="digitRange"
  value={guestRange}
  onChange={(next?: NumberRange) =>
    setGuestRange(next ? [next[0], next[1]] : [undefined, undefined])
  }
/>

<TextField
  mode="edit"
  valueType="timeRange"
  format="HH:mm"
  value={openingHours}
  onChange={(_times: unknown, strings?: [string, string] | null) =>
    setOpeningHours(strings?.[0] && strings?.[1] ? [strings[0], strings[1]] : null)
  }
/>

<TextField mode="read" valueType="digitRange" text={guestRange} />
<TextField mode="read" valueType="timeRange" format="HH:mm" text={openingHours ?? []} />`

function TextFieldUsageDemo() {
  const [draft, setDraft] = useState<BookingRule>(createExampleRule)
  const [saved, setSaved] = useState<BookingRule | null>(null)
  const [saveCount, setSaveCount] = useState(0)

  const handleSave = () => {
    setSaved(copyRule(draft))
    setSaveCount((count) => count + 1)
  }

  const savedResult = saved && {
    ...saved,
    guestRange: saved.guestRange.map((value) => value ?? null),
  }

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ marginTop: 0 }}>TextField 使用示例</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          先看 30 组票务规则配置，再看预约规则中 <Text code>value</Text>、<Text code>onChange</Text>
          和 <Text code>text</Text> 的受控编辑与只读回显。
        </Paragraph>
      </div>

      <TicketRuleCards />

      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Card title="编辑预约规则" extra={<Tag color="blue">mode="edit"</Tag>}>
            <Row gutter={[16, 16]}>
              <Col xs={24} xl={12}>
                <Card type="inner" title="基础输入" style={{ height: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Text strong>规则名称</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="text"
                          value={draft.name}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setDraft((current) => ({ ...current, name: event.target.value }))
                          }
                          fieldProps={{ placeholder: '请输入规则名称' }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>规则说明</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="textarea"
                          value={draft.description}
                          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                            setDraft((current) => ({ ...current, description: event.target.value }))
                          }
                          fieldProps={{ placeholder: '填写预约说明', rows: 2 }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} xl={12}>
                <Card type="inner" title="数值与范围" style={{ height: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Text strong>每单人数（最小值～最大值）</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="digitRange"
                          value={draft.guestRange}
                          onChange={(next?: NumberRange) =>
                            setDraft((current) => ({
                              ...current,
                              guestRange: next ? [next[0], next[1]] : [undefined, undefined],
                            }))
                          }
                          fieldProps={{ placeholder: ['最少人数', '最多人数'], min: 0 }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>可提前预约天数</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="digit"
                          value={draft.advanceDays}
                          onChange={(advanceDays: number | null) =>
                            setDraft((current) => ({ ...current, advanceDays }))
                          }
                          fieldProps={{ min: 0, max: 365, style: { width: '100%' } }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} xl={12}>
                <Card type="inner" title="日期时间" style={{ height: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Text strong>规则生效日期</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="date"
                          value={draft.effectiveDate}
                          onChange={(_date: unknown, dateString: string) =>
                            setDraft((current) => ({ ...current, effectiveDate: dateString || null }))
                          }
                          fieldProps={{ style: { width: '100%' }, allowClear: true }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>每日开放时间</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="timeRange"
                          format="HH:mm"
                          value={draft.openingHours}
                          onChange={(_times: unknown, strings?: [string, string] | null) => {
                            const openingHours: TimeRange = strings?.[0] && strings?.[1]
                              ? [strings[0], strings[1]]
                              : null
                            setDraft((current) => ({ ...current, openingHours }))
                          }}
                          fieldProps={{
                            placeholder: ['开始时间', '结束时间'],
                            minuteStep: 15,
                            allowClear: true,
                            style: { width: '100%' },
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} xl={12}>
                <Card type="inner" title="选择与状态" style={{ height: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Text strong>预约状态</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="select"
                          value={draft.status}
                          valueEnum={statusEnum}
                          onChange={(status: BookingRule['status']) =>
                            setDraft((current) => ({ ...current, status }))
                          }
                          fieldProps={{ style: { width: '100%' }, allowClear: false }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>人工审核</Text>
                      <div style={{ marginTop: 8 }}>
                        <TextField
                          mode="edit"
                          valueType="switch"
                          value={draft.requiresApproval}
                          onChange={(requiresApproval: boolean) =>
                            setDraft((current) => ({ ...current, requiresApproval }))
                          }
                          fieldProps={{ checkedChildren: '需要', unCheckedChildren: '免审' }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            <Space wrap style={{ marginTop: 20 }}>
              <Button type="primary" onClick={handleSave}>保存到本页</Button>
              <Button onClick={() => setDraft(createExampleRule())}>恢复示例值</Button>
              <Button
                onClick={() => setDraft((current) => ({
                  ...current,
                  guestRange: [undefined, undefined],
                  openingHours: null,
                }))}
              >
                清空两个范围
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="实时只读回显" extra={<Tag>mode="read"</Tag>} style={{ height: '100%' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="规则名称">
                <TextField mode="read" valueType="text" text={draft.name} />
              </Descriptions.Item>
              <Descriptions.Item label="规则说明">
                <TextField mode="read" valueType="textarea" text={draft.description} />
              </Descriptions.Item>
              <Descriptions.Item label="每单人数">
                <TextField mode="read" valueType="digitRange" text={draft.guestRange} />
              </Descriptions.Item>
              <Descriptions.Item label="提前预约">
                <TextField mode="read" valueType="digit" text={draft.advanceDays} />
                {draft.advanceDays === null ? null : ' 天'}
              </Descriptions.Item>
              <Descriptions.Item label="生效日期">
                <TextField mode="read" valueType="date" text={draft.effectiveDate} />
              </Descriptions.Item>
              <Descriptions.Item label="开放时间">
                <TextField mode="read" valueType="timeRange" format="HH:mm" text={draft.openingHours ?? []} />
              </Descriptions.Item>
              <Descriptions.Item label="预约状态">
                <TextField mode="read" valueType="select" text={draft.status} valueEnum={statusEnum} />
              </Descriptions.Item>
              <Descriptions.Item label="人工审核">
                <TextField
                  mode="read"
                  valueType="switch"
                  text={draft.requiresApproval}
                  fieldProps={{ checkedChildren: '需要', unCheckedChildren: '免审' }}
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="保存结果" extra={saved && <Tag color="green">已保存 {saveCount} 次</Tag>} style={{ height: '100%' }}>
            {savedResult ? (
              <pre style={{ margin: 0, padding: 12, overflowX: 'auto', background: '#f5f5f5', borderRadius: 6 }}>
                {JSON.stringify(savedResult, null, 2)}
              </pre>
            ) : (
              <Alert type="info" showIcon title="点击“保存到本页”后，这里会显示当前配置快照。" />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="两个范围字段的受控写法">
        <Paragraph type="secondary">
          <Text code>digitRange</Text> 双端清空后可能回调 <Text code>undefined</Text>，需要归一化为空数组对；
          <Text code>timeRange</Text> 的第二个回调参数是格式化时间数组，清空时可能为 <Text code>null</Text>。
        </Paragraph>
        <pre style={{ margin: 0, padding: 16, overflowX: 'auto', background: '#f5f5f5', borderRadius: 6 }}>
          <code>{usageCode}</code>
        </pre>
      </Card>

    </Space>
  )
}

export default TextFieldUsageDemo
