import React from 'react';
import { Button, Input, message, Space, Typography } from 'antd';
import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionDrawer, ActionModal } from '@zhilv/xc-antd';

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

const ActionOverlayDemo = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [drawerValue, setDrawerValue] = React.useState('');
  const [modalValue, setModalValue] = React.useState('');

  const handleConfirm = async (messageText: string) => {
    await wait(600);
    await message.success(messageText);
    return true;
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          抽屉与弹窗
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          统一采用左对齐 footer，并在存在未保存内容时拦截蒙版、关闭和取消操作。
        </Typography.Paragraph>
      </div>

      <Space wrap>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
        >
          打开新增抽屉
        </Button>
        <Button icon={<ExportOutlined />} onClick={() => setModalOpen(true)}>
          打开确认弹窗
        </Button>
      </Space>

      <ActionDrawer
        title="新增数据"
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setDrawerValue('');
        }}
        hasUnsavedChanges={drawerValue.trim().length > 0}
        onConfirm={() => handleConfirm('抽屉提交成功')}
      >
        <Typography.Paragraph>业务表单内容放在这里。</Typography.Paragraph>
        <Input
          value={drawerValue}
          placeholder="输入内容后点击蒙版"
          onChange={(event) => setDrawerValue(event.target.value)}
        />
      </ActionDrawer>

      <ActionModal
        title="操作确认"
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setModalValue('');
        }}
        hasUnsavedChanges={modalValue.trim().length > 0}
        onConfirm={() => handleConfirm('弹窗操作成功')}
      >
        <Input
          value={modalValue}
          placeholder="输入内容后点击蒙版"
          onChange={(event) => setModalValue(event.target.value)}
        />
      </ActionModal>
    </Space>
  );
};

export default ActionOverlayDemo;
