import React from 'react';
import { Button, Input, message, Space, Typography } from 'antd';
import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionDrawer, ActionModal } from '@xc-antd/ui';

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

const ActionOverlayDemo = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

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
          统一采用左对齐 footer，确认按钮在前、取消按钮在后，并内置异步确认状态。
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
        onOpenChange={setDrawerOpen}
        onConfirm={() => handleConfirm('抽屉提交成功')}
      >
        <Typography.Paragraph>业务表单内容放在这里。</Typography.Paragraph>
        <Input placeholder="请输入示例内容" />
      </ActionDrawer>

      <ActionModal
        title="操作确认"
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={() => handleConfirm('弹窗操作成功')}
      >
        确定要执行当前操作吗？
      </ActionModal>
    </Space>
  );
};

export default ActionOverlayDemo;
